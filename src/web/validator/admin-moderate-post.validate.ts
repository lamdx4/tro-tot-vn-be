import { body, param } from 'express-validator';
import { validateRequest } from '../middlewares/validateRequest.middleware';
import { ActionType } from '@/domains/entities/enum/value-object';

const validatePostStatus = [
  param('postId')
    .isInt({ gt: 0 })
    .withMessage('Invalid post ID'),
  body('actionType')
    .isIn([ActionType.APPROVED, ActionType.REJECTED])
    .withMessage('actionType must be either "Approved" or "Rejected"'),
  body('message')
    .if(body('status').equals('Rejected'))
    .notEmpty()
    .withMessage('Rejection reason is required when status is "reject"'),
  validateRequest
];

export default validatePostStatus;