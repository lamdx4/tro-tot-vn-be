export enum AccountStatus {
  INACTIVE = "InActive",
  ACTIVE = "Active",
  BANNED = "Banned"
}

export enum Gender {
  FEMALE = "Female",
  MALE = "Male"
}

export enum PostStatus {
  PENDING = "Pending",
  APPROVED = "Approved",
  REJECTED = "Rejected",
  HIDDEN = "Hidden",
  SUSPENDED = "Suspended"
}

export enum ActionType {
  APPROVED = "Approved",
  REJECTED = "Rejected",
  SUSPENDED = "Suspended"
}

export enum InteriorCondition {
  FULL = "Full",
  NONE = "None"
}

export enum AppointmentStatus {
  PENDING = "Pending",
  REJECT = "Reject",
  ACCEPT = "Accept"
}

export enum MultimediaType {
  VIDEO = "Video",
  IMAGE = "Image"
}

export enum EntityMemberType {
  ADMIN = "Admin",
  CUSTOMER = "Customer"
}

export enum EntityType {
  POST = "Post",
  RATE = "Rate",
  CUSTOMER = "Customer"
}

export enum ReportStatus {
  PENDING = "Pending",
  DONE = "Done"
}

export enum EntityReportTarget {
  POST = "Post",
  RATE = "Rate",
  USER = "User"
}

export enum PenaltyType {
  TEMPORARY_BAN = "Temporary Ban",
  PERMANENT_BAN = "Permanent Ban",
  WARNING = "Warning"
}