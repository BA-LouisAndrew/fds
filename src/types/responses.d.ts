export interface ValidationErrorJSON {
  message: "Validation Failed";
  details: { [name: string]: unknown };
}

export interface NotFound {
  message: string;
}
