/**
 * Address object of the customer
 */
export type Address = {
  /**
   * Street of where the customer lives.
   */
  streetName: string;
  /**
   * Postal code of customer's address
   */
  postalCode: number;
  /**
   * City of where the customer lives.
   */
  city: string;
  /**
   * State of where the customer lives.
   */
  state: string;
  /**
   * Country on where the customer lives.
   */
  country: string
};

/**
 * Sample entity (customer), on whom the validation should be done.
 */
export interface Customer {
  /**
   * First name of the customer.
   */
  firstName: string;
  /**
   * Last name of the customer.
   */
  lastName: string;
  /**
   * Customer's address.
   */
  address: Address
  /**
   * Customer's email address.
   */
  email: string
  /**
   * Customer's phone number.
   */
  phoneNumber: string
}