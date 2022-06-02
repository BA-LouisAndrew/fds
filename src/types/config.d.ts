export interface Config {
  enableCache: boolean
  dataStore: "redis" | "in-memory"
  enableNotification: boolean
  notificationUrl?: string
}
