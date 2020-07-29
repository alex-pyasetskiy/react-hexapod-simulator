import React, { Component } from "react"
import { sliderList, Card, ResetButton } from "../generic"
import { DEFAULT_POSE, DEFAULT_PATTERN_PARAMS, DEFAULT_SERVO_POSE_VALUE } from "../../templates"
import { SECTION_NAMES, ANGLE_NAMES } from "../vars"

class LegPatternPage extends Component {
    pageName = SECTION_NAMES.legPatterns
    state = { patternParams: DEFAULT_PATTERN_PARAMS }

    componentDidMount = () => {
        this.props.onMount(this.pageName)
        this.reset()
    }

    reset = () => {
        this.props.onUpdate(DEFAULT_POSE)
        this.setState({ patternParams: DEFAULT_PATTERN_PARAMS })
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
        let res = reversed ? base + new_diff : base - new_diff
        console.log(res.toFixed())
        return res.toFixed()
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
            res.push(`#${key}P${value}`)
        }
        res.push('T100D100')
        return res
    }

    updatePatternPose = (name, value) => {
        const patternParams = { ...this.state.patternParams, [name]: Number(value) }
        let newPose = {}

        for (const leg in DEFAULT_POSE) {
            newPose[leg] = patternParams
        }
        
        console.log(newPose)
        let controller_cmd = this.toServo(newPose).join("")
        console.log(controller_cmd)
        fetch('http://localhost:4000/', {method: 'POST', mode: 'no-cors',  headers: {
            "Content-Type": "application/json"
          }, body: JSON.stringify({cmd: controller_cmd})}).then(res=>console.log(res.json))

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
