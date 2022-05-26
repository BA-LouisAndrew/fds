import { DataStore } from "./dataStore"

export class InMemoryStore extends DataStore {
  map: Map<string, string>

  async init(): Promise<void> {
    this.map = new Map()
    DataStore.setInstance(this)

    if (process.env.NODE_ENV !== "test") {
      console.log("> In-memory store initiated")
    }
  }

  async get(id: string): Promise<string> {
    const value = this.map.get(id)
    return !value ? "" : value
  }

  async set(id: string, data: string): Promise<void> {
    this.map.set(id, data)
  }

  async delete(id: string): Promise<void> {
    this.map.delete(id)
  }

  async print(): Promise<string> {
    return JSON.stringify([...this.map.entries()])
  }
}
