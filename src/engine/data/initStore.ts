import { Config } from "@/types/config"

import { DataStore } from "./dataStore"
import { InMemoryStore } from "./inMemoryStore"
import { RedisStore } from "./redisStore"

export const initStore = (dataStore: Config["dataStore"]): DataStore => {
  switch (dataStore) {
  case "redis":
    return new RedisStore()
  case "in-memory":
  default:
    return new InMemoryStore()
  }
}
