const DEFAULT_BODY_DIMENSIONS = {
    front: 65,
    side: 80,
    middle: 80,
}
const DEFAULT_LEG_DIMENSIONS = {
    coxia: 35,
    femur: 85,
    tibia: 100,
}

const DEFAULT_DIMENSIONS = {
    front: 65,
    side: 80,
    middle: 80,
    coxia: 35,
    femur: 85,
    tibia: 100,
}

const DEFAULT_POSE = {
    leftFront: { alpha: 0, beta: 0, gamma: 0 },
    leftMiddle: { alpha: 0, beta: 0, gamma: 0 },
    leftBack: { alpha: 0, beta: 0, gamma: 0 },
    rightFront: { alpha: 0, beta: 0, gamma: 0 },
    rightMiddle: { alpha: 0, beta: 0, gamma: 0 },
    rightBack: { alpha: 0, beta: 0, gamma: 0 },
}

const DEFAULT_SERVO_POSE_VALUE = {
    leftFront: { alpha: 1500, beta: 1500, gamma: 1500 },    // 1 2 3
    leftMiddle: { alpha: 1500, beta: 1500, gamma: 1500 },   // 5 6 7
    leftBack: { alpha: 1500, beta: 1500, gamma: 1500 },     // 9 10 11

    rightFront: { alpha: 1500, beta: 1500, gamma: 1500 },   // 30 31 32
    rightMiddle: { alpha: 1500, beta: 1500, gamma: 1500 },  // 25 26 27
    rightBack: { alpha: 1500, beta: 1500, gamma: 1500 }     // 20 21 22
}

const SERVO_LINK_PINS = {
    leftFront: { alpha: 1, beta: 2, gamma: 3 },
    leftMiddle: { alpha: 5, beta: 6, gamma: 7 },
    leftBack: { alpha: 9, beta: 10, gamma: 11 },
    
    rightFront: { alpha: 30, beta: 31, gamma: 32 },
    rightMiddle: { alpha: 25, beta: 26, gamma: 27 },
    rightBack: { alpha: 21, beta: 22, gamma: 23 }
}

const DEFAULT_PATTERN_PARAMS = { alpha: 0, beta: 0, gamma: 0 }

const DEFAULT_IK_PARAMS = {
    tx: 0,
    ty: 0,
    tz: 0,
    rx: 0,
    ry: 0,
    rz: 0,
    hipStance: 0,
    legStance: 0,
}

const DEFAULT_GAIT_PARAMS = {
    tx: 0,
    tz: 0,
    rx: 0,
    ry: 0,
    legStance: -25,
    hipStance: 0,
    hipSwing: 15,
    liftSwing: 40,
    stepCount: 2,
}

export {
    DEFAULT_DIMENSIONS,
    DEFAULT_LEG_DIMENSIONS,
    DEFAULT_BODY_DIMENSIONS,
    DEFAULT_POSE,
    DEFAULT_IK_PARAMS,
    DEFAULT_PATTERN_PARAMS,
    DEFAULT_GAIT_PARAMS,
    DEFAULT_SERVO_POSE_VALUE,
    SERVO_LINK_PINS
}
