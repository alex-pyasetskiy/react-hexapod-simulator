import React, { Component } from "react"
import { sliderList, Card, ResetButton, AlertBox } from "../generic"
import { solveInverseKinematics } from "../../hexapod"
import { SECTION_NAMES, IK_SLIDERS_LABELS , BOARD_SOCKET} from "../vars"
import { DEFAULT_IK_PARAMS } from "../../configs"
import { controllerCMD } from "../../hexapod"

import PoseTable from "./PoseTable"

const ws = new WebSocket(BOARD_SOCKET)
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

        let controller_cmd = controllerCMD(result.pose).join("")
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

    get alertInfo() {
        if (this.state.errorMessage) {
            return <AlertBox info={this.state.errorMessage} />
        }
        return ''
    }

    render = () => (
        <div className="grid-cotainer">
            <h2>{this.pageName}</h2>
                {this.alertInfo}
                <div className="grid-cols-2">
                    <div className="grid-cols-1">
                        {this.sliders}
                    </div>
                    <PoseTable pose={this.props.params.pose} />
                </div>
            <ResetButton reset={this.reset} />
        </div>
    )
}

export default InverseKinematicsPage