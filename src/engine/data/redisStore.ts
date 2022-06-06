import { createClient, RedisClientType } from "redis"

import { DataStore } from "./dataStore"

const createRedisConfig = () => {
  const isProduction = process.env.REDIS !== undefined
  if (!isProduction) {
    return {}
  }

  return {
    url: process.env.REDIS,
    socket: {
      tls: true,
      rejectUnauthorized: false,
    },
  }
}

export class RedisStore extends DataStore {
  client: RedisClientType
  static MAX_SIZE = 25

  constructor() {
    super()
    this.client = createClient(createRedisConfig())
  }

  async init() {
    await this.client.connect()
    DataStore.setInstance(this)

    if (process.env.NODE_ENV !== "test") {
      console.log("> Redis instance connected.")
    }
  }

  async validateKeys() {
    const keys = await this.client.keys("*")
    if (keys.length === RedisStore.MAX_SIZE) {
      const [lastKey] = keys.splice(-1)
      await this.delete(lastKey)
    }
  }

  async get(id: string): Promise<string> {
    const value = await this.client.get(id)
    if (!value) {
      return ""
    }
    return value
  }

  async set(id: string, data: string): Promise<void> {
    await this.client.setEx(id, DataStore.TTL, data)
  }

  async delete(id: string): Promise<void> {
    await this.client.del(id)
  }

  async print(): Promise<string> {
    return ""
  }

  async list(prefix: string): Promise<string[]> {
    const keys = await this.client.keys(prefix + "*")
    if (keys.length === 0) {
      return []
    }

    return (await this.client.mGet(keys)).filter(Boolean) as string[]
  }

  async flush(): Promise<void> {
    await this.client.flushAll()
  }
}
