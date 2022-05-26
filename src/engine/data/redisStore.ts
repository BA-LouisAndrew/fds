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
      rejectUnauthorized: false
    }
  }
}

export class RedisStore extends DataStore {
  client: RedisClientType

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


  async get(id: string): Promise<string> {
    const value = await this.client.get(id) 
    if (!value) {
      return ""
    }
    return value
  }

  async set(id: string, data: string): Promise<void> {
    await this.client.set(id, data)
  }

  async delete(id: string): Promise<void> {
    await this.client.del(id)
  }
}