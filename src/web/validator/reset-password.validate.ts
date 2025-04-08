import { body } from "express-validator";
import { validateRequest } from "../middlewares/validateRequest.middleware";

const resetPasswordOfModerator = [
    body("newPassword")
        .notEmpty()
        .withMessage("New password is required")
        .isString()
        .withMessage("New password must be a string"),
    validateRequest
]
export default resetPasswordOfModerator;