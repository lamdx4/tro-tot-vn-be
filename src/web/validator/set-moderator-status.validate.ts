import { body, param } from "express-validator";
import { validateRequest } from "../middlewares/validateRequest.middleware";
import { AccountStatus } from "@/domains/entities/enum/value-object";

const setModeratorStatusValidate = [
    param('moderatorId').exists().withMessage('Moderator ID is required').isNumeric().withMessage('Moderator ID must be a number'),
    body('status')
        .exists().withMessage('Status is required')
        .isIn([AccountStatus.ACTIVE, AccountStatus.INACTIVE]).withMessage('Status must be either "Active" or "InActive"'),
    validateRequest
]
export default setModeratorStatusValidate;