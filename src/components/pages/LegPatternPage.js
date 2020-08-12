import React, { Component } from "react"
import { sliderList, Card, ResetButton } from "../generic"
import { DEFAULT_POSE, DEFAULT_PATTERN_PARAMS } from "../../configs"
import { SECTION_NAMES, ANGLE_NAMES, BOARD_SOCKET} from "../vars"
import { controllerCMD } from "../../hexapod"


const ws = new WebSocket(BOARD_SOCKET)
class LegPatternPage extends Component {
    pageName = SECTION_NAMES.legPatterns
    state = { patternParams: DEFAULT_PATTERN_PARAMS }

    componentDidMount = () => {
        this.props.onMount(this.pageName)
        this.reset()
        
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
        this.props.onUpdate(DEFAULT_POSE)
        this.setState({ patternParams: DEFAULT_PATTERN_PARAMS })
    }

    updatePatternPose = (name, value) => {
        const patternParams = { ...this.state.patternParams, [name]: Number(value) }
        let newPose = {}

        for (const leg in DEFAULT_POSE) {
            newPose[leg] = patternParams
        }
        
        let controller_cmd = controllerCMD(newPose).join("")
        ws.send(JSON.stringify(controller_cmd))

        this.props.onUpdate(newPose)
        this.setState({ patternParams })
    }

    get sliders() {
        return sliderList({
            names: ANGLE_NAMES,
            values: this.state.patternParams,
            handleChange: this.updatePatternPose,
        })
    }

    render = () => (
        <Card title={<h2>{this.pageName}</h2>}>
            <div className="grid-cols-1">{this.sliders}</div>
            <ResetButton reset={this.reset} />
        </Card>
    )
}

export default LegPatternPage