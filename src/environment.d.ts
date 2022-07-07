declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: "development" | "production" | "test"
      PORT?: string
      RABBITMQ_URL?: string
      RABBITMQ_MANAGEMENT_UI?: string
      REDIS?: string
      ENABLE_CACHE?: string
      DATA_STORE?: "redis" | "in-memory"
      ENABLE_NOTIFICATION?: string
    }
  }
}

export {}
