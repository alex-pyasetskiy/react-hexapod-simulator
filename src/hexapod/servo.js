import { DEFAULT_SERVO_POSE_VALUE } from "../configs"


function translatePose (angle, base, reversed) {
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


export function controllerCMD ({ rightMiddle, rightFront, leftFront, leftMiddle, leftBack, rightBack}) {
    const servos = {

        21: translatePose(leftFront.alpha, DEFAULT_SERVO_POSE_VALUE.leftFront.alpha, false),
        22: translatePose(leftFront.beta, DEFAULT_SERVO_POSE_VALUE.leftFront.beta, true),
        23: translatePose(leftFront.gamma, DEFAULT_SERVO_POSE_VALUE.leftFront.gamma, false),

        25: translatePose(leftMiddle.alpha, DEFAULT_SERVO_POSE_VALUE.leftMiddle.alpha, false),
        26: translatePose(leftMiddle.beta, DEFAULT_SERVO_POSE_VALUE.leftMiddle.beta, true),
        27: translatePose(leftMiddle.gamma, DEFAULT_SERVO_POSE_VALUE.leftMiddle.gamma, false),

        30: translatePose(leftBack.alpha, DEFAULT_SERVO_POSE_VALUE.leftBack.alpha, false),
        31: translatePose(leftBack.beta, DEFAULT_SERVO_POSE_VALUE.leftBack.beta, true),
        32: translatePose(leftBack.gamma, DEFAULT_SERVO_POSE_VALUE.leftBack.gamma, false),

        1: translatePose(rightBack.alpha, DEFAULT_SERVO_POSE_VALUE.rightBack.alpha, false),
        2: translatePose(rightBack.beta, DEFAULT_SERVO_POSE_VALUE.rightBack.beta, false),
        3: translatePose(rightBack.gamma, DEFAULT_SERVO_POSE_VALUE.rightBack.gamma, true),

        6: translatePose(rightMiddle.alpha, DEFAULT_SERVO_POSE_VALUE.rightMiddle.alpha, false),
        7: translatePose(rightMiddle.beta, DEFAULT_SERVO_POSE_VALUE.rightMiddle.beta, false),
        8: translatePose(rightMiddle.gamma, DEFAULT_SERVO_POSE_VALUE.rightMiddle.gamma, true),

        10: translatePose(rightFront.alpha,  DEFAULT_SERVO_POSE_VALUE.rightFront.alpha, false),
        11: translatePose(rightFront.beta,  DEFAULT_SERVO_POSE_VALUE.rightFront.beta, false),
        12: translatePose(rightFront.gamma,  DEFAULT_SERVO_POSE_VALUE.rightFront.gamma, true)
    };

    let res = []
    for (const [key, value] of Object.entries(servos)) {
        res.push(`#${key}P${value.toFixed()}`)
    }
    res.push('T100')
    return res
}