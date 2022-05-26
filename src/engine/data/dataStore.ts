
export abstract class DataStore {
  private static instance: DataStore

  static getInstance() {
    return this.instance
  }

  protected static setInstance(store: DataStore) {
    DataStore.instance = store
  }

  abstract init(): Promise<void>

  abstract get(id: string): Promise<string>
  abstract set(id: string, data: string): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract print(): Promise<string>
}