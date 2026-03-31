import { env } from '@/preload-env'

export class ConfigService {
  private static instance: ConfigService
  private constructor() {}

  /**
   * Lấy giá trị cấu hình đã được validate (Type-safe)
   */
  get<K extends keyof typeof env>(key: K): typeof env[K] {
    return env[key]
  }

  /**
   * Tương tự get nhưng giữ tên cũ để không break code cũ
   */
  getOrThrow<K extends keyof typeof env>(key: K): typeof env[K] {
    return env[key]
  }

  /**
   * Lấy data thô chưa qua validate (nếu cần)
   */
  getRaw(key: string): string | undefined {
    return process.env[key]
  }

  public static gI(): ConfigService {
    return this.instance || (this.instance = new this())
  }
}
