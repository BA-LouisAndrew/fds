import { DataStore } from "./dataStore"
import { InMemoryStore } from "./inMemoryStore"
import { RedisStore } from "./redisStore"

export const initStore = (): DataStore => {
  const useRedis = false // DEBUG. Disable redis for now
  return useRedis ? new RedisStore() : new InMemoryStore()
}