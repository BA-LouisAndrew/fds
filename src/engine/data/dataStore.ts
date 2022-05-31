export abstract class DataStore {
  private static instance: DataStore
  static TTL = 3_600
  static VALIDATION_PREFIX = "validation:"
  static RULE_PREFIX = "rule:"

  static getInstance() {
    return this.instance
  }

  protected static setInstance(store: DataStore) {
    DataStore.instance = store
  }

  public static setTTL(ttl: number) {
    this.TTL = ttl
  }

  static getValidationKey(validationId: string) {
    return `${this.VALIDATION_PREFIX}${validationId}`
  }

  static getRuleKey(ruleName: string) {
    return `${this.RULE_PREFIX}${ruleName}`
  }

  abstract init(): Promise<void>

  abstract get(id: string): Promise<string>
  abstract set(id: string, data: string): Promise<void>
  abstract delete(id: string): Promise<void>
  abstract list(prefix: string): Promise<string[]>
  abstract print(): Promise<string>
  abstract flush(): Promise<void>
}
