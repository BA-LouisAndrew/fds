import { app } from"@/app"
import { initStore } from "@/engine/data/initStore"
import { createMockContext } from "@/engine/database/context"
import { Database } from "@/engine/database/database"

export const initTestingServer = async () => {
  const mockContext = createMockContext()
  const store = initStore(false)
  const database = new Database(mockContext)

  await store.init()
  await database.init()

  return { app, mockContext }
}