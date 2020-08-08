import React, { Component } from "react"
import { renderToString } from "react-dom/server"
import LegPoseWidget from "./LegPoseWidgets"
import { Card, ToggleSwitch, ResetButton, NumberInputField, Slider } from "../generic"
import { DEFAULT_POSE, DEFAULT_SERVO_POSE_VALUE, SERVO_LINK_PINS } from "../../templates"
import { SECTION_NAMES, LEG_NAMES } from "../vars"

const ws = new WebSocket('ws://hexabot.node:4000/')

class ForwardKinematicsPage extends Component {
    pageName = SECTION_NAMES.forwardKinematics
    state = { WidgetType: NumberInputField }

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

    reset = () => this.props.onUpdate(DEFAULT_POSE)

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
        console.log(base - new_diff)
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
            23: this.translate(rightBack.gamma, DEFAULT_SERVO_POSE_VALUE.rightBack.gamma, false),

            25: this.translate(rightMiddle.alpha, DEFAULT_SERVO_POSE_VALUE.rightMiddle.alpha, false),
            26: this.translate(rightMiddle.beta, DEFAULT_SERVO_POSE_VALUE.rightMiddle.beta, false),
            27: this.translate(rightMiddle.gamma, DEFAULT_SERVO_POSE_VALUE.rightMiddle.gamma, false),

            30: this.translate(rightFront.alpha,  DEFAULT_SERVO_POSE_VALUE.rightFront.alpha, false),
            31: this.translate(rightFront.beta,  DEFAULT_SERVO_POSE_VALUE.rightFront.beta, false),
            32: this.translate(rightFront.gamma,  DEFAULT_SERVO_POSE_VALUE.rightFront.gamma, false)
        };

        let res = []
        for (const [key, value] of Object.entries(servos)) {
            res.push(`#${key}P${value.toFixed()}`)
        }
        res.push('T100D100')
        return res
    }

    updatePose = (name, angle, value) => {
        const pose = this.props.params.pose
        
        const newPose = {
            ...pose,
            [name]: { ...pose[name], [angle]: value },
        }

        let controller_cmd = this.toServo(newPose).join("")
        // ws.send(JSON.stringify(controller_cmd))

        console.log(this.toServo(newPose))      

        this.props.onUpdate(newPose)
    }

    toggleMode = () => {
        const WidgetType = this.state.WidgetType === Slider ? NumberInputField : Slider
        this.setState({ WidgetType })
    }

    legPoseWidget = name => (
        <LegPoseWidget
            key={name}
            name={name}
            pose={this.props.params.pose[name]}
            onUpdate={this.updatePose}
            WidgetType={this.state.WidgetType}
            renderStacked={this.state.WidgetType === Slider}
        />
    )

    get toggleSwitch() {
        const props = {
            id: "FwdKinematicsSwitch",
            value: renderToString(this.state.WidgetType),
            handleChange: this.toggleMode,
            showValue: false,
        }

        return <ToggleSwitch {...props} />
    }

    render = () => (
        <Card title={<h2>{this.pageName}</h2>} other={this.toggleSwitch}>
            <div className="grid-cols-2">
                {LEG_NAMES.map(name => this.legPoseWidget(name))}
            </div>
            <ResetButton reset={this.reset} />
        </Card>
    )
}

export default ForwardKinematicsPage