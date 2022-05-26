import { app } from "./app"
import { initStore } from "./engine/data/initStore"
import { createContext as createDatabaseContext } from "./engine/database/context"
import { Database } from "./engine/database/database"
import { Agent } from "./engine/request/agent"
import { createContext as createRequestContext } from "./engine/request/context"

const port = process.env.PORT || 8000
const CONFIG = {
  enableCache: false,
  withRedis: false,
};

(async () => {
  const store = initStore(CONFIG.withRedis) // In memory store
  const database = new Database(createDatabaseContext())

  await database.init()
  await store.init()
  Agent.setClient(createRequestContext())

  if (CONFIG.enableCache) {
    Database.setCache(store)
  }

  app.listen(port, () => {
    console.log("app listening on " + port)
  })
})()
