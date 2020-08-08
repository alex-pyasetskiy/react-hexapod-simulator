import React, { Component } from "react"
import { sliderList, Card, ResetButton, AlertBox } from "../generic"
import { solveInverseKinematics } from "../../hexapod"
import { SECTION_NAMES, IK_SLIDERS_LABELS } from "../vars"
import { DEFAULT_IK_PARAMS, DEFAULT_SERVO_POSE_VALUE } from "../../templates"
import PoseTable from "./PoseTable"

const ws = new WebSocket('ws://hexabot.node:4000/')
class InverseKinematicsPage extends Component {
    pageName = SECTION_NAMES.inverseKinematics
    state = { ikParams: DEFAULT_IK_PARAMS, errorMessage: null }

    componentDidMount = () => {
        this.props.onMount(this.pageName)
        
        ws.onopen = () => {
            // on connecting, do nothing but log it to the console
            console.log('connected')
        }

        ws.onmessage = evt => {
            // on receiving a message, add it to the list of messages
            // const message = JSON.parse(evt.data)
        }

        ws.onclose = () => {
            console.log('disconnected')
            // automatically try to reconnect on connection loss
        }
    }

    reset = () => {
        const result = solveInverseKinematics(
            this.props.params.dimensions,
            DEFAULT_IK_PARAMS
        )
        this.updateHexapodPlot(result.hexapod, DEFAULT_IK_PARAMS)
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
        res.push('T100D100')
        return res
    }

    updateHexapodPlot = (hexapod, ikParams) => {
        this.setState({ ikParams, errorMessage: null })
        this.props.onUpdate(hexapod)
    }

    updateIkParams = (name, value) => {
        const ikParams = { ...this.state.ikParams, [name]: value }
        const result = solveInverseKinematics(this.props.params.dimensions, ikParams)

        if (!result.obtainedSolution) {
            this.props.onUpdate(null)
            this.setState({ errorMessage: result.message })
            return
        }

        let controller_cmd = this.toServo(result.pose).join("")
        ws.send(JSON.stringify(controller_cmd))

        this.updateHexapodPlot(result.hexapod, ikParams)
    }

    get sliders() {
        return sliderList({
            names: IK_SLIDERS_LABELS,
            values: this.state.ikParams,
            handleChange: this.updateIkParams,
        })
    }

    get additionalInfo() {
        if (this.state.errorMessage) {
            return <AlertBox info={this.state.errorMessage} />
        }

        return <PoseTable pose={this.props.params.pose} />
    }

    render = () => (
        <Card title={<h2>{this.pageName}</h2>}>
            <div className="grid-cols-3">{this.sliders.slice(0, 6)}</div>
            <div className="grid-cols-2">{this.sliders.slice(6, 8)}</div>
            <ResetButton reset={this.reset} />
            {this.additionalInfo}
        </Card>
    )
}

export default InverseKinematicsPage