export class UtilityService {
  static validateName(name: string) {
    if (name === "Mickey") {
      return true
    }

    return false
  } 
}