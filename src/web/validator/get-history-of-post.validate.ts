import { param } from "express-validator"
import { validateRequest } from "../middlewares/validateRequest.middleware"

const getHistoryOfPostValidate = [
    param('postId')
        .exists()
        .isNumeric()
        .withMessage('postId is required'),
    validateRequest
]
export default getHistoryOfPostValidate