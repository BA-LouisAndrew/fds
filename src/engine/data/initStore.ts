import { DataStore } from "./dataStore"
import { InMemoryStore } from "./inMemoryStore"
import { RedisStore } from "./redisStore"

export const initStore = (useRedis: boolean): DataStore => {
  return useRedis ? new RedisStore() : new InMemoryStore()
}