import React, { Component } from "react"
import { sliderList, Card, ResetButton, ToggleSwitch } from "../generic"
import { SECTION_NAMES, GAIT_SLIDER_LABELS, GAIT_RANGE_PARAMS } from "../vars"
import getWalkSequence from "../../hexapod/solvers/walkSequenceSolver"
import PoseTable from "./PoseTable"
import { VirtualHexapod } from "../../hexapod"
import { tRotZmatrix } from "../../hexapod/geometry"
import { DEFAULT_GAIT_PARAMS } from "../../templates"

const ANIMATION_DELAY = 500

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
    }

    componentWillUnmount = () => {
        clearInterval(this.intervalID)
    }

    translate = (angle, base, reversed) => {
        const minAngle = -60
        const maxAngle = 60 //180
        // const minPulse = 800
        // const maxPulse = 2200
        const minPulse = 500
        const maxPulse = 2500
        const scale = (maxPulse - minPulse)/(maxAngle - minAngle)
        const new_diff = scale * angle
        if (angle === 0) {
            return base
        }
        // //console.log(new_diff)        
        // return reversed ? 1500 + new_diff : 1500 - new_diff
        // const p = (minPulse  + (minPulse - maxPulse)  * angle / 180);
        // return reversed ? 1500 + p : 1500 - p
        return reversed ? base - new_diff : base + new_diff
    };
    

    // #1P1500 #2P1500 #3P1500 #5P1500 #6P1500 #7P1500 #9P1500 #10P1500 #11P1500 #21P1500 #22P1500 #23P1500 #25P1500 #26P1500 #27P1500 #30P1500 #31P1500 #32P1500 T500D500
    toServo = ({ rightMiddle, rightFront, leftFront, leftMiddle, leftBack, rightBack}) => {
        
        const servos = {
            30: this.translate(leftFront.alpha, 1500, false),     1: this.translate(rightFront.alpha, 1500, true),
            31: this.translate(leftFront.beta, 2000, true),     2: this.translate(rightFront.beta, 1000, false),
            32: this.translate(leftFront.gamma, 1500, false),    3: this.translate(rightFront.gamma, 2000, false),

            21: this.translate(leftMiddle.alpha, 1500, false),    5: this.translate(rightBack.alpha, 1500, false),
            22: this.translate(leftMiddle.beta, 2000, true),    6: this.translate(rightBack.beta, 1000, false),
            23: this.translate(leftMiddle.gamma, 1500, false),   7: this.translate(rightBack.gamma, 2000, false),

            25: this.translate(leftBack.alpha, 1500, false),      9: this.translate(rightMiddle.alpha, 1500, false),
            26: this.translate(leftBack.beta, 2000, true),     10: this.translate(rightMiddle.beta, 1000, false),
            27: this.translate(leftBack.gamma, 1500, false),    11: this.translate(rightMiddle.gamma, 2000, false)
        };
        let res = ''

        for (const [key, value] of Object.entries(servos)) {
            // this.state.sequence[key] && this.state.sequence[key] < value ? this.setState({sequence: {key :value}}) : 
            res += '#' + key + 'P' + value.toFixed()
          }
        res += 'T300\r\n'
        // if (this.state.isAnimating){this.setState({'sequence': this.state.sequence + res})}
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

        console.log(this.toServo(pose))

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
