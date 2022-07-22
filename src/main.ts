import { app } from "./app"
import { initStore } from "./engine/data/initStore"
import { createContext as createDatabaseContext } from "./engine/database/context"
import { Database } from "./engine/database/database"
import { Notification } from "./engine/notification"
import { Agent } from "./engine/request/agent"
import { createContext as createRequestContext } from "./engine/request/context"
import { RestartEngine } from "./engine/restartEngine"
import { Config } from "./types/config"
import { delay, waitForRabbit } from "./utils/waitForRabbit"

const port = process.env.PORT || 8000
const CONFIG: Config = {
  enableCache: process.env.ENABLE_CACHE === "true" || true,
  dataStore: (process.env.DATA_STORE as Config["dataStore"]) || "in-memory",
  notificationUrl: process.env.RABBITMQ_URL || "amqp://localhost",
  rabbitManagementUi: process.env.RABBITMQ_MANAGEMENT_UI,
  enableNotification: process.env.ENABLE_NOTIFICATION === "true" || true,
}

;(async () => {
  const store = initStore(CONFIG.dataStore) // In memory store
  const database = new Database(createDatabaseContext())
  const notification = new Notification()

  Agent.setClient(createRequestContext())

  await database.init()
  await store.init()

  if (CONFIG.enableNotification && CONFIG.rabbitManagementUi) {
    const isRabbitAvailable = await waitForRabbit(CONFIG.rabbitManagementUi)
    await delay(1500)

    if (!isRabbitAvailable) {
      throw new Error("> Rabbit is not available!")
    }
  }

  await notification.init(CONFIG.notificationUrl)

  if (CONFIG.dataStore === "redis") {
    await RestartEngine.runSuspendedValidations()
  }

  if (CONFIG.enableCache) {
    Database.setCache(store)
  }

  app.set("config", CONFIG)
  app.listen(port, () => {
    console.log("app listening on " + port)
  })
})()
