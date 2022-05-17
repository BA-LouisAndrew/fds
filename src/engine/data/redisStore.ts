import { createClient, RedisClientType } from "redis"

import { Blocking, BlockingId } from "../../routes/blocking/blocking"
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
    DataStore.instance = this
  }

  async connect() {
    await this.client.connect()
    console.log(await this.client.keys("*"))
  }

  /**
   * Not a best practice
   * @deprecated
   */
  async _get(id: BlockingId): Promise<Blocking> {
    const blockingStringified = await this.client.get(id.toString())
    const blocking = JSON.parse(blockingStringified)
    if (this.validate(blocking)) {
      return blocking
    }

    return {
      id: -1,
      value: -1,
    }
  }
  
  /**
   * Needs RedisJSON to be installed.
   */
  async get(id: BlockingId): Promise<Blocking> {
    const blocking = await this.client.json.get(id.toString(), { path: "." })
    if (this.validate(blocking)) {
      return blocking as unknown as Blocking
    }

    return {
      id: -1,
      value: -1,
    }
  }

  /**
   * @deprecated Do not use
   */
  async _set(id: BlockingId, blocking: Blocking): Promise<void> {
    const blockingStringified = JSON.stringify(blocking)
    await this.client.set(id.toString(), blockingStringified)
  }

  /**
   * Needs RedisJSON to be installed.
   */
  async set(id: BlockingId, blocking: Blocking): Promise<void> {
    await this.client.json.set(id.toString(), ".", blocking as any)
  }

  async delete(id: BlockingId): Promise<void> {
    await this.client.del(id.toString())
  }
}
