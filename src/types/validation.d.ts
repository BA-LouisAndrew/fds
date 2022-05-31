import { Customer } from "./customer"

export interface Validation<T = Customer> {
  /**
   * Unique identifier (UUIDv4) of the validation process.
   * @pattern [0-9A-Fa-f]{8}-[0-9A-Fa-f]{4}-4[0-9A-Fa-f]{3}-[89ABab][0-9A-Fa-f]{3}-[0-9A-Fa-f]{12}
   * @example "52907745-7672-470e-a803-a2f8feb52944"
   */
  validationId: string
  /**
   * Current fraud score.
   * @isFloat
   * @minimum 0
   * @maximum 1
   */
  fraudScore: number
  /**
   * Total number of rule checks ro be runned.
   * @isInt
   */
  totalChecks: number
  /**
   * Number of checks runned.
   * @isInt
   * @minimum 0
   */
  runnedChecks: number
  /**
   * Details of rule check that's currently running.
   */
  currentlyRunning?: {
    /**
     * The number of the currently running check in the order.
     */
    number: number
    /**
     * Unique identifier of the validation rule.
     */
    name: string
  }
  /**
   * Checks that passed.
   */
  passedChecks: ValidationEventResult[]
  /**
   * Checks that failed.
   */
  failedChecks: ValidationEventResult[]
  /**
   * Name of the rules that skipped the check process.
   */
  skippedChecks: string[]
  /**
   * Additional information on the validation process.
   */
  additionalInfo: ValidationAdditionalInfo<T>
  /**
   * A collection of validation events. Containing validation details on passed, check and not started validations.
   */
  events: ValidationEvent[]
}

export type ValidationEventResult = Omit<ValidationEvent, "status">

export type ValidationEventStatus = "NOT_STARTED" | "FAILED" | "PASSED" | "RUNNING"

export type ValidationEvent = {
  /**
   * Name of the rule.
   */
  name: string
  /**
   * Status of the validation event.
   * @example "NOT_STARTED"
   */
  status: ValidationEventStatus
  /**
   * ISO stringified date of when the validation event started.
   */
  dateStarted: string | null
  /**
   * ISO stringified date of when the validation event ended.
   */
  dateEnded: string | null
  /**
   * Mesages that give informations on the validation event.
   */
  messages?: string[]
}

export type ValidationAdditionalInfo<T> = {
  /**
   * Date time information on when the validation started.
   */
  startDate: string
  /**
   * Date time information on when the validation ended.
   */
  endDate?: string
  /**
   * Additional information regarding the validation customer.
   */
  customerInformation?: T
}

export type MinifiedValidation = Pick<
  Validation,
  "validationId" | "totalChecks" | "runnedChecks" | "fraudScore" | "skippedChecks"
>
