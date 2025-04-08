import { param } from "express-validator";
import { validateRequest } from "../middlewares/validateRequest.middleware";

const getProfileModerator = [
    param('moderatorId')
        .exists()
        .isNumeric()
        .withMessage('moderatorId is required'),
    validateRequest
]
export default getProfileModerator;