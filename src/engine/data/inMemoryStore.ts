import { DataStore } from "./dataStore"

export class InMemoryStore extends DataStore {
  static MAX_SIZE = 100

  map: Map<string, string>
  keys: string[]

  async init(): Promise<void> {
    this.map = new Map()
    this.keys = []
    DataStore.setInstance(this)

    if (process.env.NODE_ENV !== "test") {
      console.log("> In-memory store initiated")
    }
  }
  
  async validateKeys() {
    if (this.keys.length === InMemoryStore.MAX_SIZE) {
      const firstKey = this.keys.shift()
      if (firstKey) {
        await this.delete(firstKey)
      }
    }
  }

  async get(id: string): Promise<string> {
    const value = this.map.get(id)
    return !value ? "" : value
  }

  async set(id: string, data: string): Promise<void> {
    await this.validateKeys()
    this.map.set(id, data)
  }

  async delete(id: string): Promise<void> {
    this.map.delete(id)
  }

  async print(): Promise<string> {
    return JSON.stringify([...this.map.entries()].map(([key, value]) => [key, JSON.parse(value)]))
  }
}
