import React, { Component } from "react"
import { sliderList, Card, ResetButton, ToggleSwitch } from "../generic"
import { SECTION_NAMES, GAIT_SLIDER_LABELS, GAIT_RANGE_PARAMS } from "../vars"
import getWalkSequence from "../../hexapod/solvers/walkSequenceSolver"
import PoseTable from "./PoseTable"
import { VirtualHexapod } from "../../hexapod"
import { tRotZmatrix } from "../../hexapod/geometry"
import { DEFAULT_GAIT_PARAMS, DEFAULT_SERVO_POSE_VALUE } from "../../templates"

const ws = new WebSocket('ws://hexabot.node:3030')
// const gamepadSoc = new WebSocket('ws://hexabot.node:7000')

const ANIMATION_DELAY = 150

const getPose = (sequences, i) => {
    return Object.keys(sequences).reduce((newSequences, legPosition) => {
        const { alpha, beta, gamma } = sequences[legPosition]
        newSequences[legPosition] = { alpha: alpha[i], beta: beta[i], gamma: gamma[i] }
        return newSequences
    }, {})
}

const newSwitch = (id, value, handleChange) => (
    <ToggleSwitch id={id} handleChange={handleChange} value={value} showValue={true} />
)

const switches = (switch1, switch2, switch3) => (
    <div className="grid-cols-3" style={{ paddingBottom: "20px" }}>
        {switch1}
        {switch2}
        {switch3}
    </div>
)

const countSteps = sequence => sequence["leftMiddle"].alpha.length

// function heartbeat() {
//     clearTimeout(this.pingTimeout);
   
//     // Use `WebSocket#terminate()`, which immediately destroys the connection,
//     // instead of `WebSocket#close()`, which waits for the close timer.
//     // Delay should be equal to the interval at which your server
//     // sends out pings plus a conservative assumption of the latency.
//     this.pingTimeout = setTimeout(() => {
//       this.terminate();
//     }, 30000 + 1000);
//   }

class WalkingGaitsPage extends Component {
    pageName = SECTION_NAMES.walkingGaits
    currentTwist = 0
    walkSequence = null
    state = {
        gaitParams: DEFAULT_GAIT_PARAMS,
        isAnimating: false,
        animationDelay: DEFAULT_GAIT_PARAMS.animationDelay,
        isTripodGait: true,
        isForward: true,
        inWalkMode: true,
        showGaitWidgets: true,
        animationCount: 1,
        sequence: {},
    }

    componentDidMount = () => {
        this.props.onMount(this.pageName)
        const { isTripodGait, inWalkMode } = this.state
        this.setWalkSequence(DEFAULT_GAIT_PARAMS, isTripodGait, inWalkMode)
        
        // init servo socket client
        ws.onopen = () => {
            console.log('servo controller connected')
        }
        ws.onclose = () => {
            console.log('servo controller disconnected')
        }

        // init gamepad socket listener
        // gamepadSoc.onopen = () => {
        //     console.info('gamepad connected')
        // }
        // gamepadSoc.onmessage = event => {
        //     console.error(`gamepad event = ${event}`)
        // }
        // gamepadSoc.onclose = () => {
        //     console.info('gamepad disconnected')
        // }

        // gamepadSoc.on('open', heartbeat);
        // gamepadSoc.on('ping', heartbeat);
        // gamepadSoc.on('close', function clear() {
        //     clearTimeout(this.pingTimeout);
        // });     
    }

    componentWillUnmount = () => {
        clearInterval(this.intervalID)
    }

    translate = (angle, base, reversed) => {
        const minAngle = -90
        const maxAngle = 90
        const minPulse = 500
        const maxPulse = 2500
        const scale = (maxPulse - minPulse)/(maxAngle - minAngle)
        const new_diff = scale * angle
        if (angle === 0) {
            return base
        }
        return reversed ? base + new_diff : base - new_diff
    };
    

    toServo = ({ rightMiddle, rightFront, leftFront, leftMiddle, leftBack, rightBack}) => {
        const servos = {

            1: this.translate(leftFront.alpha, DEFAULT_SERVO_POSE_VALUE.leftFront.alpha, false),
            2: this.translate(leftFront.beta, DEFAULT_SERVO_POSE_VALUE.leftFront.beta, true),
            3: this.translate(leftFront.gamma, DEFAULT_SERVO_POSE_VALUE.leftFront.gamma, false),

            5: this.translate(leftMiddle.alpha, DEFAULT_SERVO_POSE_VALUE.leftMiddle.alpha, false),
            6: this.translate(leftMiddle.beta, DEFAULT_SERVO_POSE_VALUE.leftMiddle.beta, true),
            7: this.translate(leftMiddle.gamma, DEFAULT_SERVO_POSE_VALUE.leftMiddle.gamma, false),

            9: this.translate(leftBack.alpha, DEFAULT_SERVO_POSE_VALUE.leftBack.alpha, false),
            10: this.translate(leftBack.beta, DEFAULT_SERVO_POSE_VALUE.leftBack.beta, true),
            11: this.translate(leftBack.gamma, DEFAULT_SERVO_POSE_VALUE.leftBack.gamma, false),

            21: this.translate(rightBack.alpha, DEFAULT_SERVO_POSE_VALUE.rightBack.alpha, false),
            22: this.translate(rightBack.beta, DEFAULT_SERVO_POSE_VALUE.rightBack.beta, false),
            23: this.translate(rightBack.gamma, DEFAULT_SERVO_POSE_VALUE.rightBack.gamma, true),

            25: this.translate(rightMiddle.alpha, DEFAULT_SERVO_POSE_VALUE.rightMiddle.alpha, false),
            26: this.translate(rightMiddle.beta, DEFAULT_SERVO_POSE_VALUE.rightMiddle.beta, false),
            27: this.translate(rightMiddle.gamma, DEFAULT_SERVO_POSE_VALUE.rightMiddle.gamma, true),

            30: this.translate(rightFront.alpha,  DEFAULT_SERVO_POSE_VALUE.rightFront.alpha, false),
            31: this.translate(rightFront.beta,  DEFAULT_SERVO_POSE_VALUE.rightFront.beta, false),
            32: this.translate(rightFront.gamma,  DEFAULT_SERVO_POSE_VALUE.rightFront.gamma, true)
        };

        let res = []
        for (const [key, value] of Object.entries(servos)) {
            res.push(`#${key}P${value.toFixed()}`)
        }
        res.push('T100')
        return res
    }

    animate = () => {
        const { isForward, inWalkMode } = this.state

        const stepCount = countSteps(this.walkSequence)
        const animationCount = (this.state.animationCount + 1) % stepCount
        this.setState({ animationCount })

        const tempStep = isForward ? animationCount : stepCount - animationCount
        const step = Math.max(0, Math.min(stepCount - 1, tempStep))

        const pose = getPose(this.walkSequence, step)
        let controller_cmd = this.toServo(pose).join("")
        ws.send(JSON.stringify(controller_cmd))
        if (inWalkMode) {
            this.onUpdate(pose, this.currentTwist)
            return
        }

        const deltaTwist = (this.state.gaitParams.hipSwing * 2) / stepCount
        const twist = isForward
            ? (this.currentTwist + deltaTwist) % 360
            : (this.currentTwist - deltaTwist) % 360

        this.onUpdate(pose, twist)
    }

    onUpdate = (pose, currentTwist) => {
        this.currentTwist = currentTwist
        const { dimensions } = this.props.params
        const hexapod = new VirtualHexapod(dimensions, pose, { wontRotate: true })
        // console.log(hexapod)
        // ❗❗️HACK When we've passed undefined pose values for some reason
        if (!hexapod || !hexapod.body) {
            return
        }

        const matrix = tRotZmatrix(currentTwist)
        this.props.onUpdate(hexapod.cloneTrot(matrix))
    }

    setWalkSequence = (gaitParams, isTripodGait, inWalkMode) => {
        const gaitType = isTripodGait ? "tripod" : "ripple"
        const walkMode = inWalkMode ? "walking" : "rotating"

        const { dimensions } = this.props.params
        const { animationCount } = this.state

        this.walkSequence =
            getWalkSequence(dimensions, gaitParams, gaitType, walkMode) ||
            this.walkSequence

        const pose = getPose(this.walkSequence, animationCount)
        this.onUpdate(pose, this.currentTwist)
        this.setState({ gaitParams, isTripodGait, inWalkMode })
    }

    reset = () => {
        const { isTripodGait, inWalkMode } = this.state
        this.currentTwist = 0
        this.setWalkSequence(DEFAULT_GAIT_PARAMS, isTripodGait, inWalkMode)
    }

    updateGaitParams = (name, value) => {
        const { isTripodGait, inWalkMode } = this.state
        const gaitParams = { ...this.state.gaitParams, [name]: value }
        this.setWalkSequence(gaitParams, isTripodGait, inWalkMode)
    }

    toggleWalkMode = () => {
        const { gaitParams, isTripodGait } = this.state
        const inWalkMode = !this.state.inWalkMode
        this.setWalkSequence(gaitParams, isTripodGait, inWalkMode)
    }

    toggleGaitType = () => {
        const { gaitParams, inWalkMode } = this.state
        const isTripodGait = !this.state.isTripodGait
        this.setWalkSequence(gaitParams, isTripodGait, inWalkMode)
    }

    toggleWidgets = () => this.setState({ showGaitWidgets: !this.state.showGaitWidgets })

    toggleDirection = () => this.setState({ isForward: !this.state.isForward })

    toggleAnimating = () => {
        const isAnimating = !this.state.isAnimating
        this.setState({ isAnimating })

        if (isAnimating) {
            this.intervalID = setInterval(this.animate, ANIMATION_DELAY)
        } else {
            clearInterval(this.intervalID)
        }
    }

    get widgetsSwitch() {
        const value = this.state.showGaitWidgets ? "controlsShown" : "poseShown"
        return newSwitch("widgetSw", value, this.toggleWidgets)
    }

    get animatingSwitch() {
        const value = this.state.isAnimating ? "PLAYING..." : "...PAUSED. "
        return newSwitch("animatingSw", value, this.toggleAnimating)
    }

    get gaitTypeSwitch() {
        const value = this.state.isTripodGait ? "tripodGait" : "rippleGait"
        return newSwitch("gaitSw", value, this.toggleGaitType)
    }

    get directionSwitch() {
        const value = this.state.isForward ? "isForward" : "isBackward"
        return newSwitch("directionSw", value, this.toggleDirection)
    }

    get rotateSwitch() {
        const value = this.state.inWalkMode ? "isWalk" : "isRotate"
        return newSwitch("rotateSw", value, this.toggleWalkMode)
    }

    get sliders() {
        const sliders = sliderList({
            names: GAIT_SLIDER_LABELS,
            values: this.state.gaitParams,
            rangeParams: GAIT_RANGE_PARAMS,
            handleChange: this.updateGaitParams,
        })

        return <div className="grid-cols-2">{sliders}</div>
    }

    get animationCount() {
        const { isAnimating, animationCount } = this.state
        return (
            <div className="text" hidden={!isAnimating}>
                {animationCount}
            </div>
        )
    }

    render() {
        const animationControlSwitches = switches(
            this.animatingSwitch,
            this.widgetsSwitch
        )
        const gaitControlSwitches = switches(
            this.gaitTypeSwitch,
            this.directionSwitch,
            this.rotateSwitch
        )

        const { showGaitWidgets } = this.state
        const { pose } = this.props.params

        return (
            <Card title={<h2>{this.pageName}</h2>} other={this.animationCount}>
                {animationControlSwitches}

                <div hidden={!showGaitWidgets}>
                    {gaitControlSwitches}
                    {this.sliders}
                    <ResetButton reset={this.reset} />
                </div>

                <div hidden={showGaitWidgets}>
                    <PoseTable pose={pose} />
                </div>
            </Card>
        )
    }
}

export default WalkingGaitsPage