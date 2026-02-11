export class ConfigService {
  private static instance: ConfigService
  private constructor() {}

  get(key: string): string | undefined {
    return process.env[key]
  }

  getOrThrow(key: string): string {
    const value = process.env[key]
    if (!value) {
      throw new Error(`Config error - missing env.${key}`)
    }
    return value
  }

  public static gI(): ConfigService {
    return this.instance || (this.instance = new this())
  }
}
