/* tslint:disable */
/* eslint-disable */
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import type { TsoaRoute } from '@tsoa/runtime';
import {  fetchMiddlewares, ExpressTemplateService } from '@tsoa/runtime';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { VideoCallController } from './../controllers/video-call.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { SearchController } from './../controllers/search.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { RecommendController } from './../controllers/recommend.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { PostController } from './../controllers/post.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { NotificationController } from './../controllers/notification.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MessageController } from './../controllers/message.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { LocationController } from './../controllers/location.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { InteractionController } from './../controllers/interaction.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { MultimediaController } from './../controllers/file.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { CustomerController } from './../controllers/customer.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { ConversationController } from './../controllers/chat.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AuthController } from './../controllers/auth.controller';
// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
import { AdminController } from './../controllers/admin.controller';
import { expressAuthentication } from './../../infras/auth/tsoa-auth';
// @ts-ignore - no great way to install types from subpackage
import type { Request as ExRequest, Response as ExResponse, RequestHandler, Router } from 'express';
const multer = require('multer');


const expressAuthenticationRecasted = expressAuthentication as (req: ExRequest, securityName: string, scopes?: string[], res?: ExResponse) => Promise<any>;


// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

const models: TsoaRoute.Models = {
    "IceServer": {
        "dataType": "refObject",
        "properties": {
            "urls": {"dataType":"string","required":true},
            "username": {"dataType":"string"},
            "credential": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "IceConfigResponse": {
        "dataType": "refObject",
        "properties": {
            "iceServers": {"dataType":"array","array":{"dataType":"refObject","ref":"IceServer"},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_IceConfigResponse_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"ref":"IceConfigResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_any_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"any"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SearchResponse": {
        "dataType": "refObject",
        "properties": {
            "searchLogId": {"dataType":"double"},
            "data": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "pagination": {"dataType":"nestedObjectLiteral","nestedProperties":{"totalPages":{"dataType":"double","required":true},"pageSize":{"dataType":"double","required":true},"page":{"dataType":"double","required":true},"total":{"dataType":"double","required":true}},"required":true},
            "searchTimeMs": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SearchHealthResponse": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["healthy"]},{"dataType":"enum","enums":["unhealthy"]},{"dataType":"enum","enums":["error"]}],"required":true},
            "searchService": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["connected"]},{"dataType":"enum","enums":["disconnected"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SearchFeedbackRequest": {
        "dataType": "refObject",
        "properties": {
            "searchLogId": {"dataType":"double","required":true},
            "isHelpful": {"dataType":"boolean","required":true},
            "issues": {"dataType":"array","array":{"dataType":"string"}},
            "comment": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SearchClickRequest": {
        "dataType": "refObject",
        "properties": {
            "searchLogId": {"dataType":"double","required":true},
            "searchLogItemId": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecommendationResponse": {
        "dataType": "refObject",
        "properties": {
            "recommendationLogId": {"dataType":"double"},
            "data": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "pagination": {"dataType":"nestedObjectLiteral","nestedProperties":{"totalPages":{"dataType":"double","required":true},"pageSize":{"dataType":"double","required":true},"page":{"dataType":"double","required":true},"total":{"dataType":"double","required":true}},"required":true},
            "processingTimeMs": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecommendErrorMessage": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["Page must be >= 1"]},{"dataType":"enum","enums":["PageSize must be between 1 and 50"]},{"dataType":"enum","enums":["No recommendation history yet. Browse some posts first!"]},{"dataType":"enum","enums":["Recommendation service is temporarily unavailable"]},{"dataType":"enum","enums":["recommendationLogId and recommendationLogItemId are required"]},{"dataType":"enum","enums":["Failed to get recommendations"]},{"dataType":"enum","enums":["Failed to log click"]},{"dataType":"enum","enums":[""]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecommendErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "success": {"dataType":"boolean","required":true},
            "message": {"ref":"RecommendErrorMessage","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecommendHealthResponse": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["healthy"]},{"dataType":"enum","enums":["unhealthy"]},{"dataType":"enum","enums":["error"]}],"required":true},
            "recommendService": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["connected"]},{"dataType":"enum","enums":["disconnected"]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RecommendationClickRequest": {
        "dataType": "refObject",
        "properties": {
            "recommendationLogId": {"dataType":"double","required":true},
            "recommendationLogItemId": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PostErrorMessage": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["POST_NOT_FOUND"]},{"dataType":"enum","enums":["CUSTOMER_NOT_OWNER"]},{"dataType":"enum","enums":["STATE_NOT_ALLOW"]},{"dataType":"enum","enums":["CONTENT_VIOLATION"]},{"dataType":"enum","enums":["DELETED_FAILURE"]},{"dataType":"enum","enums":["UPLOAD_FAILED"]},{"dataType":"enum","enums":["UPLOAD_SUCCESS"]},{"dataType":"enum","enums":["FETCH_POSTS_FAILED"]},{"dataType":"enum","enums":["IMAGE_SIZE_LIMIT_EXCEEDED"]},{"dataType":"enum","enums":["VIDEO_SIZE_LIMIT_EXCEEDED"]},{"dataType":"enum","enums":["FILE_SIZE_LIMIT_EXCEEDED"]},{"dataType":"enum","enums":["FILE_NOT_FOUND"]},{"dataType":"enum","enums":["INTERNAL_SERVER_ERROR"]},{"dataType":"enum","enums":["VALIDATION_ERROR"]},{"dataType":"enum","enums":["UNKNOWN_ERROR"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PostErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"ref":"PostErrorMessage","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"enum","enums":[null],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PostResponse": {
        "dataType": "refObject",
        "properties": {
            "postId": {"dataType":"double","required":true},
            "ownerId": {"dataType":"double","required":true},
            "status": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "title": {"dataType":"string","required":true},
            "description": {"dataType":"string","required":true},
            "price": {"dataType":"double","required":true},
            "streetNumber": {"dataType":"string","required":true},
            "street": {"dataType":"string","required":true},
            "ward": {"dataType":"string","required":true},
            "district": {"dataType":"string","required":true},
            "city": {"dataType":"string","required":true},
            "interiorCondition": {"dataType":"string","required":true},
            "acreage": {"dataType":"double","required":true},
            "multimediaFiles": {"dataType":"array","array":{"dataType":"any"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_PostResponse-or-null_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"union","subSchemas":[{"ref":"PostResponse"},{"dataType":"enum","enums":[null]}]},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "NotificationErrorMessage": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["FCM_TOKEN_REQUIRED"]},{"dataType":"enum","enums":["INTERNAL_SERVER_ERROR"]},{"dataType":"enum","enums":["VALIDATION_ERROR"]},{"dataType":"enum","enums":[""]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "NotificationErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"ref":"NotificationErrorMessage","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"enum","enums":[null],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RegisterTokenRequest": {
        "dataType": "refObject",
        "properties": {
            "fcmToken": {"dataType":"string","required":true},
            "platform": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UnregisterTokenRequest": {
        "dataType": "refObject",
        "properties": {
            "fcmToken": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_any-Array_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"any"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AttachmentDTO": {
        "dataType": "refObject",
        "properties": {
            "attachmentId": {"dataType":"double","required":true},
            "messageId": {"dataType":"double","required":true},
            "fileName": {"dataType":"string","required":true},
            "fileUrl": {"dataType":"string","required":true},
            "fileType": {"dataType":"string","required":true},
            "fileSize": {"dataType":"double"},
            "mimeType": {"dataType":"string"},
            "cloudFileId": {"dataType":"string"},
            "fileId": {"dataType":"double"},
            "createdAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "MessageDTO": {
        "dataType": "refObject",
        "properties": {
            "messageId": {"dataType":"double","required":true},
            "conversationId": {"dataType":"double","required":true},
            "senderId": {"dataType":"double","required":true},
            "content": {"dataType":"string","required":true},
            "messageType": {"dataType":"string","required":true},
            "status": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime"},
            "deletedAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "attachments": {"dataType":"array","array":{"dataType":"refObject","ref":"AttachmentDTO"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_MessageDTO-Array_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"MessageDTO"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_MessageDTO_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"ref":"MessageDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SendMessageInput": {
        "dataType": "refObject",
        "properties": {
            "conversationId": {"dataType":"double","required":true},
            "content": {"dataType":"string","required":true},
            "messageType": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "EditMessageInput": {
        "dataType": "refObject",
        "properties": {
            "content": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData__success-boolean__": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"success":{"dataType":"boolean","required":true}}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData__downloadUrl-string--fileName-string--mimeType-string--fileSize-number__": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"fileSize":{"dataType":"double","required":true},"mimeType":{"dataType":"string","required":true},"fileName":{"dataType":"string","required":true},"downloadUrl":{"dataType":"string","required":true}}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_null_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":[null]},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ContactLogRequest": {
        "dataType": "refObject",
        "properties": {
            "postId": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CustomerProfileResponse": {
        "dataType": "refObject",
        "properties": {
            "customerId": {"dataType":"double","required":true},
            "phone": {"dataType":"string"},
            "email": {"dataType":"string"},
            "firstName": {"dataType":"string"},
            "lastName": {"dataType":"string"},
            "avatarUrl": {"dataType":"string"},
            "gender": {"dataType":"string"},
            "birthday": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"string"}]},
            "currentCity": {"dataType":"string"},
            "currentDistrict": {"dataType":"string"},
            "currentJob": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_CustomerProfileResponse-or-any_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"union","subSchemas":[{"ref":"CustomerProfileResponse"},{"dataType":"any"}]},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CustomerErrorMessage": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["CUSTOMER_NOT_FOUND"]},{"dataType":"enum","enums":["POST_NOT_FOUND"]},{"dataType":"enum","enums":["CANNOT_RATE_OWN_POST"]},{"dataType":"enum","enums":["CONTENT_VIOLATION"]},{"dataType":"enum","enums":["RATE_NOT_FOUND"]},{"dataType":"enum","enums":["POST_NOT_SAVED"]},{"dataType":"enum","enums":["POST_ALREADY_SAVED"]},{"dataType":"enum","enums":["EMAIL_ALREADY_EXISTS"]},{"dataType":"enum","enums":["UPDATE_PROFILE_FAILED"]},{"dataType":"enum","enums":["SUBSCRIPTION_ALREADY_EXISTS"]},{"dataType":"enum","enums":["SUBSCRIPTION_NOT_FOUND"]},{"dataType":"enum","enums":["INTERNAL_SERVER_ERROR"]},{"dataType":"enum","enums":["VALIDATION_ERROR"]},{"dataType":"enum","enums":["INTERNAL_ERROR"]},{"dataType":"enum","enums":[""]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CustomerErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"ref":"CustomerErrorMessage","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"enum","enums":[null],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_CustomerProfileResponse-or-null_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"union","subSchemas":[{"ref":"CustomerProfileResponse"},{"dataType":"enum","enums":[null]}]},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RateRequest": {
        "dataType": "refObject",
        "properties": {
            "numStar": {"dataType":"double","required":true},
            "comment": {"dataType":"string","validators":{"maxLength":{"value":500}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RateResponse": {
        "dataType": "refObject",
        "properties": {
            "rateId": {"dataType":"double","required":true},
            "customerId": {"dataType":"double","required":true},
            "postId": {"dataType":"double","required":true},
            "numStar": {"dataType":"double","required":true},
            "comment": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CursorPagingResponse_RateResponse.string_": {
        "dataType": "refObject",
        "properties": {
            "dataPag": {"dataType":"array","array":{"dataType":"refObject","ref":"RateResponse"},"required":true},
            "nextCursor": {"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}],"required":true},
            "hasMore": {"dataType":"boolean","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_CursorPagingResponse_RateResponse.string__": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"ref":"CursorPagingResponse_RateResponse.string_"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData__avgRate-number--countRate-number_-or-any_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"union","subSchemas":[{"dataType":"nestedObjectLiteral","nestedProperties":{"countRate":{"dataType":"double","required":true},"avgRate":{"dataType":"double","required":true}}},{"dataType":"any"}]},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_boolean_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"boolean"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "SubscriptionResponse": {
        "dataType": "refObject",
        "properties": {
            "subscriptionId": {"dataType":"double","required":true},
            "customerId": {"dataType":"double","required":true},
            "city": {"dataType":"string","required":true},
            "district": {"dataType":"string","required":true},
            "createdAt": {"dataType":"datetime","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_SubscriptionResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"SubscriptionResponse"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_SubscriptionResponse-or-any_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"union","subSchemas":[{"ref":"SubscriptionResponse"},{"dataType":"any"}]},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateSubscriptionRequest": {
        "dataType": "refObject",
        "properties": {
            "city": {"dataType":"string","required":true,"validators":{"minLength":{"value":1},"maxLength":{"value":100}}},
            "district": {"dataType":"string","required":true,"validators":{"minLength":{"value":1},"maxLength":{"value":100}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ParticipantDTO": {
        "dataType": "refObject",
        "properties": {
            "participantId": {"dataType":"double","required":true},
            "conversationId": {"dataType":"double","required":true},
            "customerId": {"dataType":"double","required":true},
            "role": {"dataType":"string","required":true},
            "joinedAt": {"dataType":"datetime","required":true},
            "leftAt": {"dataType":"union","subSchemas":[{"dataType":"datetime"},{"dataType":"enum","enums":[null]}]},
            "firstName": {"dataType":"string"},
            "lastName": {"dataType":"string"},
            "avatarId": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ConversationDTO": {
        "dataType": "refObject",
        "properties": {
            "conversationId": {"dataType":"double","required":true},
            "conversationType": {"dataType":"string","required":true},
            "createdBy": {"dataType":"double","required":true},
            "createdAt": {"dataType":"datetime","required":true},
            "updatedAt": {"dataType":"datetime"},
            "participantCount": {"dataType":"double"},
            "lastMessage": {"dataType":"string"},
            "lastMessageAt": {"dataType":"datetime"},
            "participants": {"dataType":"array","array":{"dataType":"refObject","ref":"ParticipantDTO"}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_ConversationDTO-Array_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"ConversationDTO"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_ConversationDTO-or-null_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"union","subSchemas":[{"ref":"ConversationDTO"},{"dataType":"enum","enums":[null]}]},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_ConversationDTO_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"ref":"ConversationDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "CreateConversationRequest": {
        "dataType": "refObject",
        "properties": {
            "conversationType": {"dataType":"string","required":true},
            "participantIds": {"dataType":"array","array":{"dataType":"double"},"required":true},
            "name": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_ParticipantDTO_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"ref":"ParticipantDTO"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AddParticipantRequest": {
        "dataType": "refObject",
        "properties": {
            "customerId": {"dataType":"double","required":true},
            "role": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_ParticipantDTO-Array_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"ParticipantDTO"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_string-or-null_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"enum","enums":[null]}]},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthErrorMessage": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["USER_ALREADY_EXISTS"]},{"dataType":"enum","enums":["USER_NOT_FOUND"]},{"dataType":"enum","enums":["EMAIL_NOT_FOUND"]},{"dataType":"enum","enums":["EMAIL_EXIST"]},{"dataType":"enum","enums":["OTP_SENT_RECENTLY"]},{"dataType":"enum","enums":["OTP_INVALID"]},{"dataType":"enum","enums":["TOKEN_REQUIRED"]},{"dataType":"enum","enums":["INVALID_TOKEN"]},{"dataType":"enum","enums":["INVALID_ACCESS_TOKEN"]},{"dataType":"enum","enums":["INVALID_REFRESH_TOKEN"]},{"dataType":"enum","enums":["ACCOUNT_INACTIVE"]},{"dataType":"enum","enums":["ACCOUNT_NOT_FOUND"]},{"dataType":"enum","enums":["PASSWORD_NOT_MATCH"]},{"dataType":"enum","enums":["UPDATE_PASSWORD_FAIL"]},{"dataType":"enum","enums":["ROLLBACK_FAILED"]},{"dataType":"enum","enums":["INTERNAL_SERVER_ERROR"]},{"dataType":"enum","enums":["VALIDATION_ERROR"]},{"dataType":"enum","enums":["UNKNOWN_ERROR"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AuthErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"ref":"AuthErrorMessage","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"enum","enums":[null],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RegisterRequest": {
        "dataType": "refObject",
        "properties": {
            "phone": {"dataType":"string","required":true,"validators":{"pattern":{"value":"^(0|84)(3|5|7|8|9)([0-9]{8})$"}}},
            "email": {"dataType":"string","required":true,"validators":{"pattern":{"value":"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"}}},
            "firstName": {"dataType":"string","required":true,"validators":{"minLength":{"value":1},"maxLength":{"value":30}}},
            "lastName": {"dataType":"string","required":true,"validators":{"minLength":{"value":1},"maxLength":{"value":30}}},
            "birthday": {"dataType":"string"},
            "gender": {"dataType":"string","validators":{"pattern":{"value":"^(Male|Female)$"}}},
            "password": {"dataType":"string","validators":{"minLength":{"value":8},"pattern":{"value":"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$"}}},
            "currentCity": {"dataType":"string","validators":{"maxLength":{"value":100}}},
            "currentDistrict": {"dataType":"string","validators":{"maxLength":{"value":100}}},
            "currentJob": {"dataType":"string","validators":{"maxLength":{"value":30}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OTPResponse": {
        "dataType": "refObject",
        "properties": {
            "message": {"dataType":"string","required":true},
            "ttl": {"dataType":"double"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_OTPResponse_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"ref":"OTPResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "OTPRequest": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true,"validators":{"pattern":{"value":"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "VerifyOTPRequest": {
        "dataType": "refObject",
        "properties": {
            "email": {"dataType":"string","required":true,"validators":{"pattern":{"value":"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"}}},
            "otp": {"dataType":"string","required":true,"validators":{"minLength":{"value":6},"maxLength":{"value":6}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_OTPResponse-or-any_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"union","subSchemas":[{"ref":"OTPResponse"},{"dataType":"any"}]},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResetPasswordRequest": {
        "dataType": "refObject",
        "properties": {
            "resetToken": {"dataType":"string","required":true},
            "password": {"dataType":"string","validators":{"minLength":{"value":8},"pattern":{"value":"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$"}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginResponse": {
        "dataType": "refObject",
        "properties": {
            "accessToken": {"dataType":"string","required":true},
            "refreshToken": {"dataType":"string","required":true},
            "expiresIn": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_LoginResponse-or-any_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"union","subSchemas":[{"ref":"LoginResponse"},{"dataType":"any"}]},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LoginRequest": {
        "dataType": "refObject",
        "properties": {
            "identifier": {"dataType":"string","required":true},
            "password": {"dataType":"string"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RefreshTokenResponse": {
        "dataType": "refObject",
        "properties": {
            "accessToken": {"dataType":"string","required":true},
            "refreshToken": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_RefreshTokenResponse-or-any_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"union","subSchemas":[{"ref":"RefreshTokenResponse"},{"dataType":"any"}]},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "RefreshTokenRequest": {
        "dataType": "refObject",
        "properties": {
            "refreshToken": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_string-or-any_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"union","subSchemas":[{"dataType":"string"},{"dataType":"any"}]},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "LogoutRequest": {
        "dataType": "refObject",
        "properties": {
            "token": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ChangePasswordRequest": {
        "dataType": "refObject",
        "properties": {
            "oldPassword": {"dataType":"string"},
            "newPassword": {"dataType":"string","validators":{"minLength":{"value":8},"pattern":{"value":"^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d).{8,}$"}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "DashboardStatsResponse": {
        "dataType": "refObject",
        "properties": {
            "totalPendingPost": {"dataType":"double","required":true},
            "totalRejectedPostInWeek": {"dataType":"double","required":true},
            "totalApprovedPostInWeek": {"dataType":"double","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_DashboardStatsResponse_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"ref":"DashboardStatsResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AdminErrorMessage": {
        "dataType": "refAlias",
        "type": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["MODERATOR_NOT_FOUND"]},{"dataType":"enum","enums":["USER_NOT_FOUND"]},{"dataType":"enum","enums":["ACCOUNT_NOT_FOUND"]},{"dataType":"enum","enums":["POST_NOT_FOUND"]},{"dataType":"enum","enums":["REQUIRED_REASON"]},{"dataType":"enum","enums":["PHONE_ALREADY_EXISTS"]},{"dataType":"enum","enums":["EMAIL_ALREADY_EXISTS"]},{"dataType":"enum","enums":["MODERATION_FAILED"]},{"dataType":"enum","enums":["UPDATE_PROFILE_FAILED"]},{"dataType":"enum","enums":["UPDATE_PROFILE_SUCCESS"]},{"dataType":"enum","enums":["ADD_MODERATOR_SUCCESS"]},{"dataType":"enum","enums":["ACTION_TYPE_REQUIRED"]},{"dataType":"enum","enums":["REJECTION_REASON_REQUIRED"]},{"dataType":"enum","enums":["INTERNAL_SERVER_ERROR"]},{"dataType":"enum","enums":["VALIDATION_ERROR"]},{"dataType":"enum","enums":["UNKNOWN_ERROR"]}],"validators":{}},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AdminErrorResponse": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"ref":"AdminErrorMessage","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"enum","enums":[null],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ModeratePostRequest": {
        "dataType": "refObject",
        "properties": {
            "actionType": {"dataType":"union","subSchemas":[{"dataType":"enum","enums":["Approved"]},{"dataType":"enum","enums":["Rejected"]}],"required":true,"validators":{"pattern":{"value":"^(Approved|Rejected)$"}}},
            "reason": {"dataType":"string","validators":{"minLength":{"value":1}}},
            "isHateContent": {"dataType":"boolean"},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "PostModerationHistoryResponse": {
        "dataType": "refObject",
        "properties": {
            "postId": {"dataType":"double","required":true},
            "actionType": {"dataType":"string","required":true},
            "reason": {"dataType":"string"},
            "execAt": {"dataType":"datetime","required":true},
            "admin": {"dataType":"nestedObjectLiteral","nestedProperties":{"account":{"dataType":"nestedObjectLiteral","nestedProperties":{"email":{"dataType":"string","required":true}},"required":true},"lastName":{"dataType":"string","required":true},"firstName":{"dataType":"string","required":true},"accountId":{"dataType":"double","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_PostModerationHistoryResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"PostModerationHistoryResponse"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ModeratorActionHistoryResponse": {
        "dataType": "refObject",
        "properties": {
            "postId": {"dataType":"double","required":true},
            "actionType": {"dataType":"string","required":true},
            "reason": {"dataType":"string"},
            "execAt": {"dataType":"datetime","required":true},
            "post": {"dataType":"nestedObjectLiteral","nestedProperties":{"title":{"dataType":"string","required":true},"postId":{"dataType":"double","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_ModeratorActionHistoryResponse-Array_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"ModeratorActionHistoryResponse"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ModeratorSummary": {
        "dataType": "refObject",
        "properties": {
            "adminId": {"dataType":"double","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "birthday": {"dataType":"datetime","required":true},
            "gender": {"dataType":"string","required":true},
            "joinedAt": {"dataType":"datetime","required":true},
            "account": {"dataType":"nestedObjectLiteral","nestedProperties":{"status":{"dataType":"string","required":true},"phone":{"dataType":"string","required":true},"email":{"dataType":"string","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_ModeratorSummary-Array_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"dataType":"array","array":{"dataType":"refObject","ref":"ModeratorSummary"}},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "AddModeratorRequest": {
        "dataType": "refObject",
        "properties": {
            "firstName": {"dataType":"string","required":true,"validators":{"minLength":{"value":1},"maxLength":{"value":30}}},
            "lastName": {"dataType":"string","required":true,"validators":{"minLength":{"value":1},"maxLength":{"value":30}}},
            "email": {"dataType":"string","required":true,"validators":{"pattern":{"value":"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"}}},
            "phone": {"dataType":"string","required":true,"validators":{"pattern":{"value":"^(0|84)(3|5|7|8|9)([0-9]{8})$"}}},
            "gender": {"dataType":"string","required":true,"validators":{"pattern":{"value":"^(Male|Female)$"}}},
            "birthday": {"dataType":"string","required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "UpdateModeratorStatusRequest": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"string","required":true,"validators":{"pattern":{"value":"^(Active|Inactive|Blocked)$"}}},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ModeratorProfileResponse": {
        "dataType": "refObject",
        "properties": {
            "adminId": {"dataType":"double","required":true},
            "firstName": {"dataType":"string","required":true},
            "lastName": {"dataType":"string","required":true},
            "birthday": {"dataType":"datetime","required":true},
            "gender": {"dataType":"string","required":true},
            "joinedAt": {"dataType":"datetime","required":true},
            "account": {"dataType":"nestedObjectLiteral","nestedProperties":{"status":{"dataType":"string","required":true},"phone":{"dataType":"string","required":true},"email":{"dataType":"string","required":true}},"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_ModeratorProfileResponse_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"ref":"ModeratorProfileResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ModerationStatsResponse": {
        "dataType": "refObject",
        "properties": {
            "aiRejections": {"dataType":"double","required":true},
            "adminRejections": {"dataType":"double","required":true},
            "totalProcessed": {"dataType":"double","required":true},
        },
        "additionalProperties": {"dataType":"any"},
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
    "ResponseData_ModerationStatsResponse_": {
        "dataType": "refObject",
        "properties": {
            "status": {"dataType":"double","required":true},
            "message": {"dataType":"string","required":true},
            "error": {"dataType":"array","array":{"dataType":"any"},"required":true},
            "data": {"dataType":"union","subSchemas":[{"ref":"ModerationStatsResponse"},{"dataType":"enum","enums":[null]}],"required":true},
        },
        "additionalProperties": false,
    },
    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
};
const templateService = new ExpressTemplateService(models, {"noImplicitAdditionalProperties":"throw-on-extras","bodyCoercion":true});

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa




export function RegisterRoutes(app: Router,opts?:{multer?:ReturnType<typeof multer>}) {

    // ###########################################################################################################
    //  NOTE: If you do not see routes for all of your controllers in this file, then you might not have informed tsoa of where to look
    //      Please look into the "controllerPathGlobs" config option described in the readme: https://github.com/lukeautry/tsoa
    // ###########################################################################################################

    const upload = opts?.multer ||  multer({"limits":{"fileSize":8388608}});

    
        const argsVideoCallController_getIceConfig: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/video-call/ice-config',
            ...(fetchMiddlewares<RequestHandler>(VideoCallController)),
            ...(fetchMiddlewares<RequestHandler>(VideoCallController.prototype.getIceConfig)),

            async function VideoCallController_getIceConfig(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsVideoCallController_getIceConfig, request, response });

                const controller = new VideoCallController();

              await templateService.apiHandler({
                methodName: 'getIceConfig',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSearchController_search: Record<string, TsoaRoute.ParameterSchema> = {
                query: {"in":"query","name":"query","required":true,"dataType":"string"},
                city: {"in":"query","name":"city","dataType":"string"},
                district: {"in":"query","name":"district","dataType":"string"},
                ward: {"in":"query","name":"ward","dataType":"string"},
                priceMin: {"in":"query","name":"priceMin","dataType":"double"},
                priceMax: {"in":"query","name":"priceMax","dataType":"double"},
                acreageMin: {"in":"query","name":"acreageMin","dataType":"double"},
                acreageMax: {"in":"query","name":"acreageMax","dataType":"double"},
                interiorCondition: {"in":"query","name":"interiorCondition","dataType":"string"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                pageSize: {"default":20,"in":"query","name":"pageSize","dataType":"double"},
        };
        app.get('/search',
            ...(fetchMiddlewares<RequestHandler>(SearchController)),
            ...(fetchMiddlewares<RequestHandler>(SearchController.prototype.search)),

            async function SearchController_search(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSearchController_search, request, response });

                const controller = new SearchController();

              await templateService.apiHandler({
                methodName: 'search',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSearchController_health: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/search/health',
            ...(fetchMiddlewares<RequestHandler>(SearchController)),
            ...(fetchMiddlewares<RequestHandler>(SearchController.prototype.health)),

            async function SearchController_health(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSearchController_health, request, response });

                const controller = new SearchController();

              await templateService.apiHandler({
                methodName: 'health',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSearchController_submitFeedback: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"SearchFeedbackRequest"},
        };
        app.post('/search/feedback',
            ...(fetchMiddlewares<RequestHandler>(SearchController)),
            ...(fetchMiddlewares<RequestHandler>(SearchController.prototype.submitFeedback)),

            async function SearchController_submitFeedback(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSearchController_submitFeedback, request, response });

                const controller = new SearchController();

              await templateService.apiHandler({
                methodName: 'submitFeedback',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsSearchController_logClick: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"SearchClickRequest"},
        };
        app.post('/search/click',
            ...(fetchMiddlewares<RequestHandler>(SearchController)),
            ...(fetchMiddlewares<RequestHandler>(SearchController.prototype.logClick)),

            async function SearchController_logClick(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsSearchController_logClick, request, response });

                const controller = new SearchController();

              await templateService.apiHandler({
                methodName: 'logClick',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRecommendController_getRecommendations: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                page: {"default":1,"in":"query","name":"page","dataType":"double"},
                pageSize: {"default":20,"in":"query","name":"pageSize","dataType":"double"},
                logId: {"in":"query","name":"logId","dataType":"double"},
        };
        app.get('/recommend',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(RecommendController)),
            ...(fetchMiddlewares<RequestHandler>(RecommendController.prototype.getRecommendations)),

            async function RecommendController_getRecommendations(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRecommendController_getRecommendations, request, response });

                const controller = new RecommendController();

              await templateService.apiHandler({
                methodName: 'getRecommendations',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRecommendController_health: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/recommend/health',
            ...(fetchMiddlewares<RequestHandler>(RecommendController)),
            ...(fetchMiddlewares<RequestHandler>(RecommendController.prototype.health)),

            async function RecommendController_health(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRecommendController_health, request, response });

                const controller = new RecommendController();

              await templateService.apiHandler({
                methodName: 'health',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsRecommendController_logClick: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"RecommendationClickRequest"},
        };
        app.post('/recommend/click',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(RecommendController)),
            ...(fetchMiddlewares<RequestHandler>(RecommendController.prototype.logClick)),

            async function RecommendController_logClick(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsRecommendController_logClick, request, response });

                const controller = new RecommendController();

              await templateService.apiHandler({
                methodName: 'logClick',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPostController_createPost: Record<string, TsoaRoute.ParameterSchema> = {
                title: {"in":"formData","name":"title","required":true,"dataType":"string"},
                description: {"in":"formData","name":"description","required":true,"dataType":"string"},
                price: {"in":"formData","name":"price","required":true,"dataType":"string"},
                acreage: {"in":"formData","name":"acreage","required":true,"dataType":"string"},
                streetNumber: {"in":"formData","name":"streetNumber","required":true,"dataType":"string"},
                street: {"in":"formData","name":"street","required":true,"dataType":"string"},
                ward: {"in":"formData","name":"ward","required":true,"dataType":"string"},
                district: {"in":"formData","name":"district","required":true,"dataType":"string"},
                city: {"in":"formData","name":"city","required":true,"dataType":"string"},
                interiorStatus: {"in":"formData","name":"interiorStatus","required":true,"dataType":"string"},
                images: {"in":"formData","name":"images","required":true,"dataType":"array","array":{"dataType":"file"}},
                video: {"in":"formData","name":"video","required":true,"dataType":"file"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/posts',
            authenticateMiddleware([{"jwt":[]}]),
            upload.fields([
                {
                    name: "images",
                },
                {
                    name: "video",
                    maxCount: 1
                }
            ]),
            ...(fetchMiddlewares<RequestHandler>(PostController)),
            ...(fetchMiddlewares<RequestHandler>(PostController.prototype.createPost)),

            async function PostController_createPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPostController_createPost, request, response });

                const controller = new PostController();

              await templateService.apiHandler({
                methodName: 'createPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPostController_editPost: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
                title: {"in":"formData","name":"title","required":true,"dataType":"string"},
                description: {"in":"formData","name":"description","required":true,"dataType":"string"},
                price: {"in":"formData","name":"price","required":true,"dataType":"string"},
                acreage: {"in":"formData","name":"acreage","required":true,"dataType":"string"},
                streetNumber: {"in":"formData","name":"streetNumber","required":true,"dataType":"string"},
                street: {"in":"formData","name":"street","required":true,"dataType":"string"},
                ward: {"in":"formData","name":"ward","required":true,"dataType":"string"},
                district: {"in":"formData","name":"district","required":true,"dataType":"string"},
                city: {"in":"formData","name":"city","required":true,"dataType":"string"},
                interiorStatus: {"in":"formData","name":"interiorStatus","required":true,"dataType":"string"},
                oldFiles: {"in":"formData","name":"oldFiles","required":true,"dataType":"string"},
                images: {"in":"formData","name":"images","required":true,"dataType":"array","array":{"dataType":"file"}},
                video: {"in":"formData","name":"video","required":true,"dataType":"file"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.put('/posts/:postId',
            authenticateMiddleware([{"jwt":[]}]),
            upload.fields([
                {
                    name: "images",
                },
                {
                    name: "video",
                    maxCount: 1
                }
            ]),
            ...(fetchMiddlewares<RequestHandler>(PostController)),
            ...(fetchMiddlewares<RequestHandler>(PostController.prototype.editPost)),

            async function PostController_editPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPostController_editPost, request, response });

                const controller = new PostController();

              await templateService.apiHandler({
                methodName: 'editPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 200,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPostController_getMyPosts: Record<string, TsoaRoute.ParameterSchema> = {
                status: {"default":"Approved","in":"query","name":"status","dataType":"string"},
                cursor: {"default":0,"in":"query","name":"cursor","dataType":"double"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/posts/me',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PostController)),
            ...(fetchMiddlewares<RequestHandler>(PostController.prototype.getMyPosts)),

            async function PostController_getMyPosts(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPostController_getMyPosts, request, response });

                const controller = new PostController();

              await templateService.apiHandler({
                methodName: 'getMyPosts',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPostController_searchPost: Record<string, TsoaRoute.ParameterSchema> = {
                keyword: {"default":"","in":"query","name":"keyword","dataType":"string"},
                city: {"in":"query","name":"city","dataType":"string"},
                district: {"in":"query","name":"district","dataType":"string"},
                ward: {"in":"query","name":"ward","dataType":"string"},
                interiorCondition: {"in":"query","name":"interiorCondition","dataType":"string"},
                acreage: {"in":"query","name":"acreage","dataType":"string"},
                price: {"in":"query","name":"price","dataType":"string"},
                cursor: {"in":"query","name":"cursor","dataType":"string"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/posts/search',
            ...(fetchMiddlewares<RequestHandler>(PostController)),
            ...(fetchMiddlewares<RequestHandler>(PostController.prototype.searchPost)),

            async function PostController_searchPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPostController_searchPost, request, response });

                const controller = new PostController();

              await templateService.apiHandler({
                methodName: 'searchPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPostController_getLastPost: Record<string, TsoaRoute.ParameterSchema> = {
                limit: {"default":4,"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/posts/latest',
            ...(fetchMiddlewares<RequestHandler>(PostController)),
            ...(fetchMiddlewares<RequestHandler>(PostController.prototype.getLastPost)),

            async function PostController_getLastPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPostController_getLastPost, request, response });

                const controller = new PostController();

              await templateService.apiHandler({
                methodName: 'getLastPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPostController_hideMyPost: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/posts/:postId/hide',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PostController)),
            ...(fetchMiddlewares<RequestHandler>(PostController.prototype.hideMyPost)),

            async function PostController_hideMyPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPostController_hideMyPost, request, response });

                const controller = new PostController();

              await templateService.apiHandler({
                methodName: 'hideMyPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPostController_unHideMyPost: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/posts/:postId/unhide',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PostController)),
            ...(fetchMiddlewares<RequestHandler>(PostController.prototype.unHideMyPost)),

            async function PostController_unHideMyPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPostController_unHideMyPost, request, response });

                const controller = new PostController();

              await templateService.apiHandler({
                methodName: 'unHideMyPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPostController_getPostDetail: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/posts/:postId',
            ...(fetchMiddlewares<RequestHandler>(PostController)),
            ...(fetchMiddlewares<RequestHandler>(PostController.prototype.getPostDetail)),

            async function PostController_getPostDetail(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPostController_getPostDetail, request, response });

                const controller = new PostController();

              await templateService.apiHandler({
                methodName: 'getPostDetail',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsPostController_getDetailMyPost: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/posts/me/:postId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(PostController)),
            ...(fetchMiddlewares<RequestHandler>(PostController.prototype.getDetailMyPost)),

            async function PostController_getDetailMyPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsPostController_getDetailMyPost, request, response });

                const controller = new PostController();

              await templateService.apiHandler({
                methodName: 'getDetailMyPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_registerToken: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"RegisterTokenRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/notifications/tokens',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.registerToken)),

            async function NotificationController_registerToken(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_registerToken, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'registerToken',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_unregisterToken: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"UnregisterTokenRequest"},
        };
        app.post('/notifications/tokens/unregister',
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.unregisterToken)),

            async function NotificationController_unregisterToken(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_unregisterToken, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'unregisterToken',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsNotificationController_getMyTokens: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/notifications/tokens',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(NotificationController)),
            ...(fetchMiddlewares<RequestHandler>(NotificationController.prototype.getMyTokens)),

            async function NotificationController_getMyTokens(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsNotificationController_getMyTokens, request, response });

                const controller = new NotificationController();

              await templateService.apiHandler({
                methodName: 'getMyTokens',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMessageController_getMessages: Record<string, TsoaRoute.ParameterSchema> = {
                conversationId: {"in":"path","name":"conversationId","required":true,"dataType":"double"},
                limit: {"default":20,"in":"query","name":"limit","dataType":"double"},
                offset: {"default":0,"in":"query","name":"offset","dataType":"double"},
        };
        app.get('/chat/conversations/:conversationId/messages',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MessageController)),
            ...(fetchMiddlewares<RequestHandler>(MessageController.prototype.getMessages)),

            async function MessageController_getMessages(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessageController_getMessages, request, response });

                const controller = new MessageController();

              await templateService.apiHandler({
                methodName: 'getMessages',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMessageController_getMessageById: Record<string, TsoaRoute.ParameterSchema> = {
                messageId: {"in":"path","name":"messageId","required":true,"dataType":"double"},
        };
        app.get('/chat/messages/:messageId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MessageController)),
            ...(fetchMiddlewares<RequestHandler>(MessageController.prototype.getMessageById)),

            async function MessageController_getMessageById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessageController_getMessageById, request, response });

                const controller = new MessageController();

              await templateService.apiHandler({
                methodName: 'getMessageById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMessageController_sendMessage: Record<string, TsoaRoute.ParameterSchema> = {
                conversationId: {"in":"path","name":"conversationId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"SendMessageInput"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/chat/conversations/:conversationId/messages',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MessageController)),
            ...(fetchMiddlewares<RequestHandler>(MessageController.prototype.sendMessage)),

            async function MessageController_sendMessage(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessageController_sendMessage, request, response });

                const controller = new MessageController();

              await templateService.apiHandler({
                methodName: 'sendMessage',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMessageController_editMessage: Record<string, TsoaRoute.ParameterSchema> = {
                messageId: {"in":"path","name":"messageId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"EditMessageInput"},
        };
        app.put('/chat/messages/:messageId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MessageController)),
            ...(fetchMiddlewares<RequestHandler>(MessageController.prototype.editMessage)),

            async function MessageController_editMessage(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessageController_editMessage, request, response });

                const controller = new MessageController();

              await templateService.apiHandler({
                methodName: 'editMessage',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMessageController_deleteMessage: Record<string, TsoaRoute.ParameterSchema> = {
                messageId: {"in":"path","name":"messageId","required":true,"dataType":"double"},
        };
        app.delete('/chat/messages/:messageId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MessageController)),
            ...(fetchMiddlewares<RequestHandler>(MessageController.prototype.deleteMessage)),

            async function MessageController_deleteMessage(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessageController_deleteMessage, request, response });

                const controller = new MessageController();

              await templateService.apiHandler({
                methodName: 'deleteMessage',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMessageController_markRead: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"dataType":"nestedObjectLiteral","nestedProperties":{"messageIds":{"dataType":"array","array":{"dataType":"double"},"required":true}}},
        };
        app.post('/chat/messages/read',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MessageController)),
            ...(fetchMiddlewares<RequestHandler>(MessageController.prototype.markRead)),

            async function MessageController_markRead(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessageController_markRead, request, response });

                const controller = new MessageController();

              await templateService.apiHandler({
                methodName: 'markRead',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMessageController_uploadFile: Record<string, TsoaRoute.ParameterSchema> = {
                conversationId: {"in":"path","name":"conversationId","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                file: {"in":"formData","name":"file","required":true,"dataType":"file"},
                content: {"in":"formData","name":"content","dataType":"string"},
        };
        app.post('/chat/conversations/:conversationId/files',
            authenticateMiddleware([{"jwt":[]}]),
            upload.fields([
                {
                    name: "file",
                    maxCount: 1
                }
            ]),
            ...(fetchMiddlewares<RequestHandler>(MessageController)),
            ...(fetchMiddlewares<RequestHandler>(MessageController.prototype.uploadFile)),

            async function MessageController_uploadFile(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessageController_uploadFile, request, response });

                const controller = new MessageController();

              await templateService.apiHandler({
                methodName: 'uploadFile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMessageController_getFileDownloadUrl: Record<string, TsoaRoute.ParameterSchema> = {
                fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
        };
        app.get('/chat/files/:fileId/download',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(MessageController)),
            ...(fetchMiddlewares<RequestHandler>(MessageController.prototype.getFileDownloadUrl)),

            async function MessageController_getFileDownloadUrl(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMessageController_getFileDownloadUrl, request, response });

                const controller = new MessageController();

              await templateService.apiHandler({
                methodName: 'getFileDownloadUrl',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsLocationController_getWards: Record<string, TsoaRoute.ParameterSchema> = {
                districtId: {"in":"path","name":"districtId","required":true,"dataType":"string"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/location/wards/:districtId',
            ...(fetchMiddlewares<RequestHandler>(LocationController)),
            ...(fetchMiddlewares<RequestHandler>(LocationController.prototype.getWards)),

            async function LocationController_getWards(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsLocationController_getWards, request, response });

                const controller = new LocationController();

              await templateService.apiHandler({
                methodName: 'getWards',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsInteractionController_logContact: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"ContactLogRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/interactions/contact',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(InteractionController)),
            ...(fetchMiddlewares<RequestHandler>(InteractionController.prototype.logContact)),

            async function InteractionController_logContact(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsInteractionController_logContact, request, response });

                const controller = new InteractionController();

              await templateService.apiHandler({
                methodName: 'logContact',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsMultimediaController_getFile: Record<string, TsoaRoute.ParameterSchema> = {
                fileId: {"in":"path","name":"fileId","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/files/:fileId',
            ...(fetchMiddlewares<RequestHandler>(MultimediaController)),
            ...(fetchMiddlewares<RequestHandler>(MultimediaController.prototype.getFile)),

            async function MultimediaController_getFile(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsMultimediaController_getFile, request, response });

                const controller = new MultimediaController();

              await templateService.apiHandler({
                methodName: 'getFile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_getInformation: Record<string, TsoaRoute.ParameterSchema> = {
                customerId: {"in":"path","name":"customerId","required":true,"dataType":"double"},
        };
        app.get('/customer/:customerId/profile',
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.getInformation)),

            async function CustomerController_getInformation(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_getInformation, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'getInformation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_getMyProfile: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/customer/me',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.getMyProfile)),

            async function CustomerController_getMyProfile(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_getMyProfile, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'getMyProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_updateMyProfile: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                avatar: {"in":"formData","name":"avatar","dataType":"file"},
                firstName: {"in":"formData","name":"firstName","dataType":"string"},
                lastName: {"in":"formData","name":"lastName","dataType":"string"},
                email: {"in":"formData","name":"email","dataType":"string"},
                bio: {"in":"formData","name":"bio","dataType":"string"},
                gender: {"in":"formData","name":"gender","dataType":"string"},
                birthday: {"in":"formData","name":"birthday","dataType":"string"},
                currentCity: {"in":"formData","name":"currentCity","dataType":"string"},
                currentDistrict: {"in":"formData","name":"currentDistrict","dataType":"string"},
                currentJob: {"in":"formData","name":"currentJob","dataType":"string"},
        };
        app.post('/customer/me',
            authenticateMiddleware([{"jwt":[]}]),
            upload.fields([
                {
                    name: "avatar",
                    maxCount: 1
                }
            ]),
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.updateMyProfile)),

            async function CustomerController_updateMyProfile(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_updateMyProfile, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'updateMyProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_getMyRate: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/customer/posts/:postId/rate',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.getMyRate)),

            async function CustomerController_getMyRate(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_getMyRate, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'getMyRate',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_addRate: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"RateRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/customer/posts/:postId/rate',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.addRate)),

            async function CustomerController_addRate(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_addRate, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'addRate',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_deleteRate: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.delete('/customer/posts/:postId/rate',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.deleteRate)),

            async function CustomerController_deleteRate(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_deleteRate, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'deleteRate',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_getRateFromPost: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
                cursor: {"in":"query","name":"cursor","dataType":"string"},
                limit: {"default":10,"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/customer/posts/:postId/rates',
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.getRateFromPost)),

            async function CustomerController_getRateFromPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_getRateFromPost, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'getRateFromPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_getAvgRateFromPost: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
        };
        app.get('/customer/posts/:postId/rate-avg',
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.getAvgRateFromPost)),

            async function CustomerController_getAvgRateFromPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_getAvgRateFromPost, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'getAvgRateFromPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_savePost: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/customer/saved-posts/:postId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.savePost)),

            async function CustomerController_savePost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_savePost, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'savePost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_getSavedPost: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/customer/saved-posts',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.getSavedPost)),

            async function CustomerController_getSavedPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_getSavedPost, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'getSavedPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_deleteSavedPost: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.delete('/customer/saved-posts/:postId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.deleteSavedPost)),

            async function CustomerController_deleteSavedPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_deleteSavedPost, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'deleteSavedPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_checkIfSaved: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/customer/saved-posts/:postId/check',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.checkIfSaved)),

            async function CustomerController_checkIfSaved(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_checkIfSaved, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'checkIfSaved',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_getSubscription: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/customer/subscriptions',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.getSubscription)),

            async function CustomerController_getSubscription(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_getSubscription, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'getSubscription',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_createSubscription: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateSubscriptionRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/customer/subscriptions',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.createSubscription)),

            async function CustomerController_createSubscription(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_createSubscription, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'createSubscription',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_deleteSubscription: Record<string, TsoaRoute.ParameterSchema> = {
                subscriptionId: {"in":"path","name":"subscriptionId","required":true,"dataType":"double"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.delete('/customer/subscriptions/:subscriptionId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.deleteSubscription)),

            async function CustomerController_deleteSubscription(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_deleteSubscription, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'deleteSubscription',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsCustomerController_getHistoryViewPost: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/customer/view-history',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(CustomerController)),
            ...(fetchMiddlewares<RequestHandler>(CustomerController.prototype.getHistoryViewPost)),

            async function CustomerController_getHistoryViewPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsCustomerController_getHistoryViewPost, request, response });

                const controller = new CustomerController();

              await templateService.apiHandler({
                methodName: 'getHistoryViewPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConversationController_syncMessages: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                since: {"in":"query","name":"since","required":true,"dataType":"string"},
                limit: {"default":100,"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/conversations/sync',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ConversationController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationController.prototype.syncMessages)),

            async function ConversationController_syncMessages(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationController_syncMessages, request, response });

                const controller = new ConversationController();

              await templateService.apiHandler({
                methodName: 'syncMessages',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConversationController_getConversations: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                limit: {"default":20,"in":"query","name":"limit","dataType":"double"},
                offset: {"default":0,"in":"query","name":"offset","dataType":"double"},
        };
        app.get('/conversations',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ConversationController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationController.prototype.getConversations)),

            async function ConversationController_getConversations(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationController_getConversations, request, response });

                const controller = new ConversationController();

              await templateService.apiHandler({
                methodName: 'getConversations',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConversationController_getConversationById: Record<string, TsoaRoute.ParameterSchema> = {
                conversationId: {"in":"path","name":"conversationId","required":true,"dataType":"double"},
        };
        app.get('/conversations/:conversationId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ConversationController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationController.prototype.getConversationById)),

            async function ConversationController_getConversationById(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationController_getConversationById, request, response });

                const controller = new ConversationController();

              await templateService.apiHandler({
                methodName: 'getConversationById',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConversationController_createConversation: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"CreateConversationRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/conversations',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ConversationController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationController.prototype.createConversation)),

            async function ConversationController_createConversation(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationController_createConversation, request, response });

                const controller = new ConversationController();

              await templateService.apiHandler({
                methodName: 'createConversation',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConversationController_addParticipant: Record<string, TsoaRoute.ParameterSchema> = {
                conversationId: {"in":"path","name":"conversationId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"AddParticipantRequest"},
        };
        app.post('/conversations/:conversationId/participants',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ConversationController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationController.prototype.addParticipant)),

            async function ConversationController_addParticipant(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationController_addParticipant, request, response });

                const controller = new ConversationController();

              await templateService.apiHandler({
                methodName: 'addParticipant',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConversationController_removeParticipant: Record<string, TsoaRoute.ParameterSchema> = {
                conversationId: {"in":"path","name":"conversationId","required":true,"dataType":"double"},
                customerId: {"in":"path","name":"customerId","required":true,"dataType":"double"},
        };
        app.delete('/conversations/:conversationId/participants/:customerId',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ConversationController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationController.prototype.removeParticipant)),

            async function ConversationController_removeParticipant(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationController_removeParticipant, request, response });

                const controller = new ConversationController();

              await templateService.apiHandler({
                methodName: 'removeParticipant',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 204,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsConversationController_getParticipants: Record<string, TsoaRoute.ParameterSchema> = {
                conversationId: {"in":"path","name":"conversationId","required":true,"dataType":"double"},
        };
        app.get('/conversations/:conversationId/participants',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(ConversationController)),
            ...(fetchMiddlewares<RequestHandler>(ConversationController.prototype.getParticipants)),

            async function ConversationController_getParticipants(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsConversationController_getParticipants, request, response });

                const controller = new ConversationController();

              await templateService.apiHandler({
                methodName: 'getParticipants',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_registerAccount: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"RegisterRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/auth/register',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.registerAccount)),

            async function AuthController_registerAccount(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_registerAccount, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'registerAccount',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: 201,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_sendOTPRegister: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"OTPRequest"},
        };
        app.post('/auth/send-otp-register',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.sendOTPRegister)),

            async function AuthController_sendOTPRegister(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_sendOTPRegister, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'sendOTPRegister',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_verifyOTPRegister: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"VerifyOTPRequest"},
        };
        app.post('/auth/verify-otp-register',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.verifyOTPRegister)),

            async function AuthController_verifyOTPRegister(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_verifyOTPRegister, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'verifyOTPRegister',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_forgotPassword: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"OTPRequest"},
        };
        app.post('/auth/forgot-password',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.forgotPassword)),

            async function AuthController_forgotPassword(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_forgotPassword, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'forgotPassword',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_verifyOtp: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"VerifyOTPRequest"},
        };
        app.post('/auth/verify-otp',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.verifyOtp)),

            async function AuthController_verifyOtp(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_verifyOtp, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'verifyOtp',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_resetPassword: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"ResetPasswordRequest"},
        };
        app.post('/auth/reset-password',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.resetPassword)),

            async function AuthController_resetPassword(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_resetPassword, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'resetPassword',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_login: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"LoginRequest"},
        };
        app.post('/auth/login',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.login)),

            async function AuthController_login(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_login, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'login',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_refreshToken: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"RefreshTokenRequest"},
        };
        app.post('/auth/refresh-token',
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.refreshToken)),

            async function AuthController_refreshToken(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_refreshToken, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'refreshToken',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_logout: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"LogoutRequest"},
        };
        app.post('/auth/logout',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.logout)),

            async function AuthController_logout(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_logout, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'logout',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAuthController_changePassword: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"ChangePasswordRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/auth/change-password',
            authenticateMiddleware([{"jwt":[]}]),
            ...(fetchMiddlewares<RequestHandler>(AuthController)),
            ...(fetchMiddlewares<RequestHandler>(AuthController.prototype.changePassword)),

            async function AuthController_changePassword(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAuthController_changePassword, request, response });

                const controller = new AuthController();

              await templateService.apiHandler({
                methodName: 'changePassword',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_getStatisticsForDashBoard: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/admin/dashboard-stats',
            authenticateMiddleware([{"jwt":["Admin","Manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.getStatisticsForDashBoard)),

            async function AdminController_getStatisticsForDashBoard(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_getStatisticsForDashBoard, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'getStatisticsForDashBoard',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_resetPasswordOfModerator: Record<string, TsoaRoute.ParameterSchema> = {
                moderatorId: {"in":"path","name":"moderatorId","required":true,"dataType":"double"},
        };
        app.put('/admin/moderators/:moderatorId/reset-password',
            authenticateMiddleware([{"jwt":["Manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.resetPasswordOfModerator)),

            async function AdminController_resetPasswordOfModerator(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_resetPasswordOfModerator, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'resetPasswordOfModerator',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_listPostPending: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/admin/posts/pending',
            authenticateMiddleware([{"jwt":["Admin","Manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.listPostPending)),

            async function AdminController_listPostPending(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_listPostPending, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'listPostPending',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_moderatePost: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"ModeratePostRequest"},
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.post('/admin/posts/:postId/moderate',
            authenticateMiddleware([{"jwt":["Admin","Manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.moderatePost)),

            async function AdminController_moderatePost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_moderatePost, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'moderatePost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_getHistoryOfPost: Record<string, TsoaRoute.ParameterSchema> = {
                postId: {"in":"path","name":"postId","required":true,"dataType":"double"},
        };
        app.get('/admin/posts/:postId/history',
            authenticateMiddleware([{"jwt":["Admin","Manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.getHistoryOfPost)),

            async function AdminController_getHistoryOfPost(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_getHistoryOfPost, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'getHistoryOfPost',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_getHistoryByModeratorId: Record<string, TsoaRoute.ParameterSchema> = {
                moderatorId: {"in":"path","name":"moderatorId","required":true,"dataType":"double"},
        };
        app.get('/admin/moderators/:moderatorId/history',
            authenticateMiddleware([{"jwt":["Manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.getHistoryByModeratorId)),

            async function AdminController_getHistoryByModeratorId(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_getHistoryByModeratorId, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'getHistoryByModeratorId',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_getModerators: Record<string, TsoaRoute.ParameterSchema> = {
                key: {"in":"query","name":"key","dataType":"string"},
        };
        app.get('/admin/moderators',
            authenticateMiddleware([{"jwt":["Manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.getModerators)),

            async function AdminController_getModerators(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_getModerators, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'getModerators',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_addModerators: Record<string, TsoaRoute.ParameterSchema> = {
                body: {"in":"body","name":"body","required":true,"ref":"AddModeratorRequest"},
        };
        app.post('/admin/moderators',
            authenticateMiddleware([{"jwt":["Manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.addModerators)),

            async function AdminController_addModerators(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_addModerators, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'addModerators',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_updateModerator: Record<string, TsoaRoute.ParameterSchema> = {
                moderatorId: {"in":"path","name":"moderatorId","required":true,"dataType":"double"},
                body: {"in":"body","name":"body","required":true,"ref":"UpdateModeratorStatusRequest"},
        };
        app.put('/admin/moderators/:moderatorId/status',
            authenticateMiddleware([{"jwt":["Manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.updateModerator)),

            async function AdminController_updateModerator(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_updateModerator, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'updateModerator',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_getProfileModerator: Record<string, TsoaRoute.ParameterSchema> = {
                moderatorId: {"in":"path","name":"moderatorId","required":true,"dataType":"double"},
        };
        app.get('/admin/moderators/:moderatorId/profile',
            authenticateMiddleware([{"jwt":["Manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.getProfileModerator)),

            async function AdminController_getProfileModerator(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_getProfileModerator, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'getProfileModerator',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_getMyProfile: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
        };
        app.get('/admin/me/profile',
            authenticateMiddleware([{"jwt":["Admin","Manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.getMyProfile)),

            async function AdminController_getMyProfile(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_getMyProfile, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'getMyProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_updateMyProfile: Record<string, TsoaRoute.ParameterSchema> = {
                req: {"in":"request","name":"req","required":true,"dataType":"object"},
                body: {"in":"body","name":"body","required":true,"dataType":"any"},
        };
        app.put('/admin/me/profile',
            authenticateMiddleware([{"jwt":["Admin","Manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.updateMyProfile)),

            async function AdminController_updateMyProfile(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_updateMyProfile, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'updateMyProfile',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_getModerationStats: Record<string, TsoaRoute.ParameterSchema> = {
        };
        app.get('/admin/moderation-stats',
            authenticateMiddleware([{"jwt":["Admin","Manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.getModerationStats)),

            async function AdminController_getModerationStats(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_getModerationStats, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'getModerationStats',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        const argsAdminController_exportTrainingData: Record<string, TsoaRoute.ParameterSchema> = {
                limit: {"in":"query","name":"limit","dataType":"double"},
        };
        app.get('/admin/export-training-data',
            authenticateMiddleware([{"jwt":["Admin","Manager"]}]),
            ...(fetchMiddlewares<RequestHandler>(AdminController)),
            ...(fetchMiddlewares<RequestHandler>(AdminController.prototype.exportTrainingData)),

            async function AdminController_exportTrainingData(request: ExRequest, response: ExResponse, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            let validatedArgs: any[] = [];
            try {
                validatedArgs = templateService.getValidatedArgs({ args: argsAdminController_exportTrainingData, request, response });

                const controller = new AdminController();

              await templateService.apiHandler({
                methodName: 'exportTrainingData',
                controller,
                response,
                next,
                validatedArgs,
                successStatus: undefined,
              });
            } catch (err) {
                return next(err);
            }
        });
        // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa


    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

    function authenticateMiddleware(security: TsoaRoute.Security[] = []) {
        return async function runAuthenticationMiddleware(request: any, response: any, next: any) {

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            // keep track of failed auth attempts so we can hand back the most
            // recent one.  This behavior was previously existing so preserving it
            // here
            const failedAttempts: any[] = [];
            const pushAndRethrow = (error: any) => {
                failedAttempts.push(error);
                throw error;
            };

            const secMethodOrPromises: Promise<any>[] = [];
            for (const secMethod of security) {
                if (Object.keys(secMethod).length > 1) {
                    const secMethodAndPromises: Promise<any>[] = [];

                    for (const name in secMethod) {
                        secMethodAndPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }

                    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

                    secMethodOrPromises.push(Promise.all(secMethodAndPromises)
                        .then(users => { return users[0]; }));
                } else {
                    for (const name in secMethod) {
                        secMethodOrPromises.push(
                            expressAuthenticationRecasted(request, name, secMethod[name], response)
                                .catch(pushAndRethrow)
                        );
                    }
                }
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa

            try {
                request['user'] = await Promise.any(secMethodOrPromises);

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }

                next();
            }
            catch(err) {
                // Show most recent error as response
                const error = failedAttempts.pop();
                error.status = error.status || 401;

                // Response was sent in middleware, abort
                if (response.writableEnded) {
                    return;
                }
                next(error);
            }

            // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
        }
    }

    // WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
}

// WARNING: This file was auto-generated with tsoa. Please do not modify it. Re-run tsoa to re-generate this file: https://github.com/lukeautry/tsoa
