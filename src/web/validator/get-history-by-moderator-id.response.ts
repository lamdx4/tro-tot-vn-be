import { param } from "express-validator";
import { validateRequest } from "../middlewares/validateRequest.middleware";

const getHistoryByModeratorIdValidate = [
    param('moderatorId')
        .exists()
        .isNumeric()
        .withMessage('moderatorId is required'),
    validateRequest
]