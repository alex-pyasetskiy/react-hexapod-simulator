import { solveInverseKinematics, VirtualHexapod, getNewPlotParams } from "./hexapod";
import * as configs from "./configs"


while (true) {

    let res = solveInverseKinematics(configs.DEFAULT_DIMENSIONS, configs.DEFAULT_IK_PARAMS);
    console.log(res);
};