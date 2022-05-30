import { DataStore } from "@/engine/data/dataStore"

const TIMEOUT = 5000

export class UtilityService {
  static validateName(name: string) {
    return new Promise((resolve) => {
      setTimeout(() => {
        if (name === "Mickey") {
          resolve(true)
        } else {
          resolve(false)
        }
      }, TIMEOUT)
    })
  }

  static printCache() {
    return DataStore.getInstance().print()
  }
}
