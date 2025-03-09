export class ConfigService {
  private readonly envConfig: NodeJS.ProcessEnv
  private static instance: ConfigService
  private constructor() {
    this.envConfig = process.env
  }

  get(key: string): string | undefined {
    return this.envConfig[key]
  }

  getOrThrow(key: string): string {
    if (!this.envConfig[key]) {
      throw new Error(`Config error - missing env.${key}`)
    }
    return this.envConfig[key]
  }

  public static gI(): ConfigService {
    return this.instance || (this.instance = new this())
  }
}
