import { DataStore } from "./dataStore"

export class InMemoryStore extends DataStore {
  map: Map<string, string> 

  init(): Promise<void> {
    return new Promise(resolve => {
      this.map = new Map()
      DataStore.setInstance(this)

      if (process.env.NODE_ENV !== "test") {
        console.log("> In-memory store initiated")
      }
      
      resolve()
    })
  }

  get(id: string): Promise<string> {
    return new Promise(resolve => {
      const value = this.map.get(id)
      if (!value) {
        resolve("")
      } else {
        resolve(value)
      }
    })
  }

  set(id: string, data: string): Promise<void> {
    return new Promise(resolve => {
      this.map.set(id, data)
      resolve()
    })
  }

  delete(id: string): Promise<void> {
    return new Promise(resolve => {
      this.map.delete(id)
      resolve()
    })
  }
}