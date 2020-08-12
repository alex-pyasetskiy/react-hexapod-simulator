import React, { Component } from "react"
import { renderToString } from "react-dom/server"
import LegPoseWidget from "./LegPoseWidgets"
import { Card, ToggleSwitch, ResetButton, NumberInputField, Slider } from "../generic"
import { DEFAULT_POSE } from "../../configs"
import { SECTION_NAMES, LEG_NAMES, BOARD_SOCKET } from "../vars"
import { controllerCMD } from "../../hexapod"


const ws = new WebSocket(BOARD_SOCKET)

class ForwardKinematicsPage extends Component {
    pageName = SECTION_NAMES.forwardKinematics
    state = { WidgetType: Slider }

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

    updatePose = (name, angle, value) => {
        const pose = this.props.params.pose
        
        const newPose = {
            ...pose,
            [name]: { ...pose[name], [angle]: value },
        }

        let controller_cmd = controllerCMD(newPose).join("")
        ws.send(JSON.stringify(controller_cmd))

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