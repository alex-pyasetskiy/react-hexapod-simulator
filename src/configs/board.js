import { DEFAULT_SERVO_POSE_VALUE } from "./hexapodParams"

const SERVO_LINK_PINS = {
    leftFront: { alpha: 1, beta: 2, gamma: 3 },
    leftMiddle: { alpha: 5, beta: 6, gamma: 7 },
    leftBack: { alpha: 9, beta: 10, gamma: 11 },

    rightFront: { alpha: 30, beta: 31, gamma: 32 },
    rightMiddle: { alpha: 25, beta: 26, gamma: 27 },
    rightBack: { alpha: 21, beta: 22, gamma: 23 },
}

// {
//         1: this.translate(leftFront.alpha, DEFAULT_SERVO_POSE_VALUE.leftFront.alpha, false),
//         2: this.translate(leftFront.beta, DEFAULT_SERVO_POSE_VALUE.leftFront.beta, true),
//         3: this.translate(leftFront.gamma, DEFAULT_SERVO_POSE_VALUE.leftFront.gamma, false),

//         5: this.translate(leftMiddle.alpha, DEFAULT_SERVO_POSE_VALUE.leftMiddle.alpha, false),
//         6: this.translate(leftMiddle.beta, DEFAULT_SERVO_POSE_VALUE.leftMiddle.beta, true),
//         7: this.translate(leftMiddle.gamma, DEFAULT_SERVO_POSE_VALUE.leftMiddle.gamma, false),

//         9: this.translate(leftBack.alpha, DEFAULT_SERVO_POSE_VALUE.leftBack.alpha, false),
//         10: this.translate(leftBack.beta, DEFAULT_SERVO_POSE_VALUE.leftBack.beta, true),
//         11: this.translate(leftBack.gamma, DEFAULT_SERVO_POSE_VALUE.leftBack.gamma, false),

//         21: this.translate(rightBack.alpha, DEFAULT_SERVO_POSE_VALUE.rightBack.alpha, false),
//         22: this.translate(rightBack.beta, DEFAULT_SERVO_POSE_VALUE.rightBack.beta, false),
//         23: this.translate(rightBack.gamma, DEFAULT_SERVO_POSE_VALUE.rightBack.gamma, true),

//         25: this.translate(rightMiddle.alpha, DEFAULT_SERVO_POSE_VALUE.rightMiddle.alpha, false),
//         26: this.translate(rightMiddle.beta, DEFAULT_SERVO_POSE_VALUE.rightMiddle.beta, false),
//         27: this.translate(rightMiddle.gamma, DEFAULT_SERVO_POSE_VALUE.rightMiddle.gamma, true),

//         30: this.translate(rightFront.alpha,  DEFAULT_SERVO_POSE_VALUE.rightFront.alpha, false),
//         31: this.translate(rightFront.beta,  DEFAULT_SERVO_POSE_VALUE.rightFront.beta, false),
//         32: this.translate(rightFront.gamma,  DEFAULT_SERVO_POSE_VALUE.rightFront.gamma, true)
// }
