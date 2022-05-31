export interface ValidationErrorJSON {
  message: "Validation Failed"
  details: { [name: string]: unknown }
}

export interface NotFound {
  message: string
}

export interface WentWrong {
  message: string
  details: string
}
