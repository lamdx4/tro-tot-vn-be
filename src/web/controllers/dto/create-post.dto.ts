export interface CreatePostDto {
  /** @minLength 5 @maxLength 200 */
  title: string;
  
  /** @minLength 10 */
  description: string;
  
  /** @pattern ^\d+(\.\d+)?$ */
  price: string;
  
  /** @pattern ^\d+(\.\d+)?$ */
  acreage: string;
  
  /** @minLength 1 */
  streetNumber: string;
  
  /** @minLength 1 */
  street: string;
  
  /** @minLength 1 */
  ward: string;
  
  /** @minLength 1 */
  district: string;
  
  /** @minLength 1 */
  city: string;
  
  /** @minLength 1 */
  interiorStatus: string;
}
