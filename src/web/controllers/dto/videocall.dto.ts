export interface IceServer {
  urls: string
  username?: string
  credential?: string
}

export interface IceConfigResponse {
  iceServers: IceServer[]
}
