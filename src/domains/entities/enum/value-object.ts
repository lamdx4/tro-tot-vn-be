export enum AccountStatus {
  INACTIVE = 'InActive',
  ACTIVE = 'Active',
}

export enum Gender {
  FEMALE = 'Female',
  MALE = 'Male'
}

export enum PostStatus {
  PENDING = 'Pending',
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
  HIDDEN = 'Hidden'
}

export enum ActionType {
  APPROVED = 'Approved',
  REJECTED = 'Rejected',
}

export enum InteriorCondition {
  FULL = 'Full',
  NONE = 'None'
}

export enum AppointmentStatus {
  PENDING = 'Pending',
  REJECT = 'Reject',
  ACCEPT = 'Accept'
}

export enum MultimediaType {
  VIDEO = 'Video',
  IMAGE = 'Image'
}

export enum EntityParticipantType {
  ADMIN = 'Admin',
  CUSTOMER = 'Customer'
}
export enum RoleType {
  MANAGER = 'Manager',
  MODERATOR = 'Moderator',
  CUSTOMER = 'Customer'
}

// Chat-related enums
export enum ConversationType {
  DIRECT = 'Direct',
  GROUP = 'Group'
}

export enum MessageType {
  TEXT = 'Text',
  IMAGE = 'Image',
  FILE = 'File'
}

export enum MessageStatus {
  SENT = 'Sent',
  DELIVERED = 'Delivered',
  READ = 'Read'
}

export enum ParticipantRole {
  MEMBER = 'Member',
  ADMIN = 'Admin'
}

// Attachment types for message attachments
export enum AttachmentType {
  IMAGE = 'Image',
  VIDEO = 'Video',
  FILE = 'File'
}

