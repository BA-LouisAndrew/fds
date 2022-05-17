import { app } from "./app"
import { initStore } from "./engine/data/initStore"

const port = process.env.PORT || 8000

;(async () => {
  const store = initStore()
  await store.init()

  app.listen(port, () => {
    console.log("app listening on " + port)
  })
})()