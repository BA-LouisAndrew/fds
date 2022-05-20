import { app } from "./app"
import { initStore } from "./engine/data/initStore"
import { createContext } from "./engine/database/context"
import { Database } from "./engine/database/database"

const port = process.env.PORT || 8000

;(async () => {
  const store = initStore(false)
  const database = new Database(createContext())

  await database.init()
  await store.init()

  app.listen(port, () => {
    console.log("app listening on " + port)
  })
})()