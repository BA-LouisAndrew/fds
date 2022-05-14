import { createClient , RedisClientType } from "redis"

import { Blocking } from "../../routes/blocking/blocking"
import { DataStore } from "./dataStore"

export class RedisStore extends DataStore {
  client: RedisClientType

  constructor() {
    super()
    this.client = createClient()
    DataStore.DataStore = this
  }

  async connect() {
    await this.client.connect()
    console.log(await this.client.keys("*"))
  }
 
  async get(id: number): Promise<Blocking> {
    const blockingStringified = await this.client.get(id.toString())
    const blocking = JSON.parse(blockingStringified)
    if (blocking instanceof blocking) {
      return blocking
    }

    return {
      id: -1,
      value: -1
    }
  }

  async set(id: number, blocking: Blocking): Promise<void> {
    const blockingStringified = JSON.stringify(blocking)
    await this.client.set(id.toString(), blockingStringified)
  }
}