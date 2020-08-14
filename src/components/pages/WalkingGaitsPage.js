import { w3cwebsocket as W3CWebSocket } from "websocket";
import React, { Component } from "react"
import { sliderList, Card, ResetButton, ToggleSwitch } from "../generic"
import { SECTION_NAMES, GAIT_SLIDER_LABELS, GAIT_RANGE_PARAMS, BOARD_SOCKET } from "../vars"
import getWalkSequence from "../../hexapod/solvers/walkSequenceSolver"
import PoseTable from "./PoseTable"
import { VirtualHexapod, controllerCMD } from "../../hexapod"
import { tRotZmatrix } from "../../hexapod/geometry"
import { DEFAULT_GAIT_PARAMS } from "../../configs"

import style from './WaklingGaitsPage.module.scss'

// const client = new W3CWebSocket('ws://127.0.0.1:4000');
const ws = new WebSocket(BOARD_SOCKET)

const ANIMATION_DELAY = 120

const getPose = (sequences, i) => {
    return Object.keys(sequences).reduce((newSequences, legPosition) => {
        const { alpha, beta, gamma } = sequences[legPosition]
        newSequences[legPosition] = { alpha: alpha[i], beta: beta[i], gamma: gamma[i] }
        return newSequences
    }, {})
}

const newSwitch = (id, value, handleChange) => (
    <ToggleSwitch className={style.toggleSwitch} id={id} handleChange={handleChange} value={value} showValue={true} />
)

// const switches = (switch1, switch2, switch3) => (
//     // <div className="grid-cols-1" style={{ paddingBottom: "20px" }}>
//     <div className="switch-container">
//         {switch1}
//         {switch2}
//         {switch3}
//     </div>
// )

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
        socketClient: null,
        startState: false,
        gamepad: {},
        pushStart: 0,
        pushEnd: 0,
    }

    async handleArrows (btnState) {
        switch(parseInt(btnState)) {
            case 0:
                
                this.toggleAnimating()
                this.setState({isForward:true})
                this.setState({inWalkMode:true})
                break;
            case 1:
                //up
                this.setState({isForward:true})
                this.toggleAnimating()
                break;
            case 2:
                //down
                this.setState({isForward:false})
                this.toggleAnimating()
                break;
            case 4:
                this.setState({isForward:true})
                this.setState({inWalkMode:false})
                this.toggleAnimating()
                break;
            case 8:
                //rotate right
                this.setState({inWalkMode:false})
                this.setState({isForward:false})
                this.toggleAnimating()
                break;
                
            default:
                console.log("arrows default")
        }
    }

    async handleStartBack (btnState) {
        switch(parseInt(btnState)) {
            case 0:
                break;
            case 1:
                // start pushed
                break;
            case 2:
                //back pushed
                break;
            default:
                // do nothing
        }
    }

    componentDidMount = () => {
        this.props.onMount(this.pageName)
        const { isTripodGait, inWalkMode } = this.state
        this.setWalkSequence(DEFAULT_GAIT_PARAMS, isTripodGait, inWalkMode)

        ws.onopen = () => {
            console.log('servo controller connected')
        }
        ws.onclose = () => {
            console.log('servo controller disconnected')
        }

        const client = new W3CWebSocket('ws://127.0.0.1:4000');
        client.onopen = () => {
            console.log('WebSocket Client Connected');
            this.setState({ socketClient: client });
        };

        client.onmessage = (message) => {
            let event = JSON.parse(message.data)
            this.handleArrows(event.arrows)
            this.handleStartBack(event.fn)
        };
    }

    componentWillUnmount = () => {
        clearInterval(this.intervalID)
    }

    animate = () => {
        const { isForward, inWalkMode } = this.state

        const stepCount = countSteps(this.walkSequence)
        const animationCount = (this.state.animationCount + 1) % stepCount
        this.setState({ animationCount })

        const tempStep = isForward ? animationCount : stepCount - animationCount
        const step = Math.max(0, Math.min(stepCount - 1, tempStep))

        const pose = getPose(this.walkSequence, step)
        let controller_cmd = controllerCMD(pose).join("")
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

        return (
            <div className="grid-cols-3">
                {sliders}
            </div>
        )
    }

    get animationCount() {
        const { isAnimating, animationCount } = this.state
        return (
            <div className="text" hidden={!isAnimating}>
                {animationCount}
            </div>
        )
    }

    get connectionState() {
        const { socketClient } = this.state
        let connection = socketClient ? 'Connected' : 'Not connected'
        return <div className={style.connectionInfo}>{connection}</div>
    }

    render() {

        const { showGaitWidgets } = this.state
        const { pose } = this.props.params

        return (
            <div className={style.wrapper}>
                <div className={style.pageHeader}>
                    {/* {this.animationCount} */}
                    {this.connectionState}
                    {this.animatingSwitch}
                    {this.gaitTypeSwitch}
                    {this.directionSwitch}
                    {this.rotateSwitch}
                </div>
                <div className={style.sliders}>
                    {this.sliders}
                    <PoseTable pose={pose} />
                </div>

                {/* <div hidden={!showGaitWidgets}>
                    {this.sliders}
                    <ResetButton reset={this.reset} />
                </div> */}

                <div hidden={showGaitWidgets}>
                    <PoseTable pose={pose} />
                </div>
            </div>
        )
    }
}

export default WalkingGaitsPage