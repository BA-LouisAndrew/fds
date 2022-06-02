/**
 * Address object of the customer
 */
export type Address = {
  /**
   * Street of where the customer lives.
   * @example "1313 Disneyland Dr"
   */
  streetName: string
  /**
   * Postal code of customer's address
   * @example 92802
   */
  postalCode: number
  /**
   * City of where the customer lives.
   * @example "Anaheim"
   */
  city: string
  /**
   * State of where the customer lives.
   * @example "California"
   */
  state: string
  /**
   * Country on where the customer lives.
   * @example "United States"
   */
  country: string
}

/**
 * Sample entity (customer), on whom the validation should be done.
 */
export interface Customer {
  /**
   * First name of the customer.
   * @example "Mickey"
   */
  firstName: string
  /**
   * Last name of the customer.
   * @example "Mouse"
   */
  lastName: string
  /**
   * Customer's address.
   */
  address: Address
  /**
   * Customer's email address.
   * @example "hello-world@mickey.com"
   */
  email: string
  /**
   * Customer's phone number.
   * @example "+17147814636"
   */
  phoneNumber: string
}
