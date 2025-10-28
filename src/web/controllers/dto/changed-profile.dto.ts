export default interface ChangedProfileDto {
  bio: string
  lastName: string
  firstName: string
  email: string
  gender: string
  birthDate?: string
  currentCity?: string
  currentDistrict?: string
  currentJob?: string
  avatarFile?: Express.Multer.File | null
}
