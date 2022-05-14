import { app } from "./app"
import { RedisStore } from "./engine/data/redisStore"

const port = process.env.PORT || 8000

;(async () => {
  const dataStore = new RedisStore()
  await dataStore.connect()

  app.listen(port, () => {
    console.log("app listening on " + port)
  })
})()