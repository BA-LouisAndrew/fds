import { app } from "./app"
import { initStore } from "./engine/data/initStore"
import { createContext } from "./engine/database/context"
import { Database } from "./engine/database/database"

const port = process.env.PORT || 8000
const CONFIG = {
  enableCache: false,
  withRedis: false,
};

(async () => {
  const store = initStore(CONFIG.withRedis) // In memory store
  const database = new Database(createContext())

  await database.init()
  await store.init()

  if (CONFIG.enableCache) {
    Database.setCache(store)
  }

  app.listen(port, () => {
    console.log("app listening on " + port)
  })
})()
