export type ApiErrorResponse = {
  error: {
    message: string
    details?: string
  }
  data: null
}

export type ApiSuccessResponse<T> = {
  data: T
  error: null
}

export type ApiResponse<T> = ApiErrorResponse | ApiSuccessResponse<T>

export type ServiceValidationReturnType = { isValid: boolean; message: string }
