export default interface ChangedProfileDto {
  /** @maxLength 500 */
  bio: string;
  
  /** @minLength 2 @maxLength 50 */
  lastName: string;
  
  /** @minLength 2 @maxLength 50 */
  firstName: string;
  
  /** @pattern ^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$ */
  email: string;
  
  /** @pattern ^(Male|Female)$ */
  gender: string;
  
  /** @example "1990-01-01" */
  birthDate?: string;
  
  /** @maxLength 100 */
  currentCity?: string;
  
  /** @maxLength 100 */
  currentDistrict?: string;
  
  /** @pattern ^(Student|Employed)$ */
  currentJob?: string;
  
  avatarFile?: Express.Multer.File | null;
}
