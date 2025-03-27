import { body } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest.middleware';

const validatePostStatus = [
  body('postId')
    .isInt({ gt: 0 })
    .withMessage('Invalid post ID'),
  body('status')
    .isIn(['Approved', 'Rejected'])
    .withMessage('Status must be either "Approved" or "Rejected"'),
  body('message')
    .if(body('status').equals('Rejected'))
    .notEmpty()
    .withMessage('Rejection reason is required when status is "reject"'),
  validateRequest
];

export default validatePostStatus;