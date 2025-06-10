export default interface ChangedProfileDto {
  bio: string
  lastName: string
  firstName: string
  email: string
  gender: string
  birthDate?: string
  address?: string
  avatarFile?: Express.Multer.File | null
}
