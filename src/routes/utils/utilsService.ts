import { DataStore } from "@/engine/data/dataStore"

const TIMEOUT = 5000

export class UtilityService {
  static validateName(name: string, timeout?: number) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (name === "Mickey") {
          resolve(true)
        } else {
          resolve(false)
        }
      }, timeout ?? TIMEOUT)
    })
  }

  static printCache() {
    return DataStore.getInstance().print()
  }

  static alwaysTrue(timeout?: number): Promise<boolean> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, timeout ?? TIMEOUT)
    })
  }
}
