import bcrypt from "bcryptjs";

export class PasswordService {
  private static readonly saltRounds = 10; // Định nghĩa số vòng salt

  /**
   * Băm mật khẩu trước khi lưu vào database
   * @param password - Mật khẩu gốc của người dùng
   * @returns Chuỗi mật khẩu đã được băm
   */
  static async hashPassword(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(this.saltRounds);
    return await bcrypt.hash(password, salt);
  }

  /**
   * So sánh mật khẩu nhập vào với mật khẩu đã băm trong database
   * @param plainPassword - Mật khẩu do người dùng nhập vào
   * @param hashedPassword - Mật khẩu đã băm lưu trong database
   * @returns `true` nếu khớp, ngược lại trả về `false`
   */
  static async comparePassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }
}
