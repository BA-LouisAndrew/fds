
export abstract class DataStore {
  private static instance: DataStore
  static TTL = 3_600

  static getInstance() {
    return this.instance
  }

  protected static setInstance(store: DataStore) {
    DataStore.instance = store
  }
  
  public static setTTL(ttl: number) {
    this.TTL = ttl
  }

  abstract init(): Promise<void>

  abstract get(id: string): Promise<string>
  abstract set(id: string, data: string): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract print(): Promise<string>
}