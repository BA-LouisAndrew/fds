import { DataStore } from "@/engine/data/dataStore"

const TIMEOUT = 5000

export class UtilityService {
  static COUNTER = 0

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

  static isEmailDomainBlacklisted(email: string): boolean {
    const BLACKLISTED_DOMAINS = ["@fraud.com", "@shady.co.id", "@tx.go", "@crime.com"]
    return BLACKLISTED_DOMAINS.some((domain) => email.includes(domain))
  }

  static isUserRegisteredInExternalDomain(lastName: string) {
    const REGISTERED_LAST_NAMES = ["Thomas", "Mouse", "Goofy", "Bear"]
    return REGISTERED_LAST_NAMES.some((name) => lastName === name)
  }

  static getBlacklistedEmails(): string[] {
    return ["hello-world@mickey.com", "thomas-and@friends.com", "goofy@shady.co.id", "scooby-doo@fraud.co"]
  }

  static getOperatingCountries(): string[] {
    return ["Germany", "DE", "United States", "US", "France", "FR"]
  }

  static retries(): boolean {
    if (this.COUNTER === 1) {
      this.COUNTER = 0
      return true
    }

    this.COUNTER = 1
    return false
  }

  static withTimeout<T>(value: T, timeout?: number): Promise<T> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve(value)
      }, timeout ?? TIMEOUT)
    })
  }
}
