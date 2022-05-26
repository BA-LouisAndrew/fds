import { DataStore } from "@/engine/data/dataStore"

export class UtilityService {
  static validateName(name: string) {
    if (name === "Mickey") {
      return true
    }

    return false
  } 
  
  static printCache() {
    return DataStore.getInstance().print()
  }
}