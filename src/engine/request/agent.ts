import { Method, Response } from "got"
import { query } from "jsonpath"

import { GenericObject, ValidationRule } from "@/types/rule"

import { Context } from "./context"

export class Agent {
  private static context: Context

  private static get client() {
    return Agent.context.client
  }

  static setClient(context: Context) {
    this.context = context
  }

  static async fireRequest<DataType, ResponseType = any>(rule: ValidationRule, data: DataType): Promise<Response<ResponseType> | null> {
    const { endpoint, method, retryStrategy, requestBody } = rule

    try {
      const response = await this.client<ResponseType>(endpoint, {
        method: method as Method,
        retry: retryStrategy || {},
        json: this.getJSONBody(requestBody, data),
      })
      
      return response
    }  catch {
      // Handle error here
      return null
    }
  }

  private static getJSONBody(requestBody: GenericObject | undefined, data: any) {
    if (!requestBody) {
      return undefined
    }

    return Object.entries(requestBody)
      .map(([key, value]) => {
        const dataFromPath = query(data, value)[0]
        return {
          [key]: dataFromPath ?? value,
        }
      })
      .reduce((a, b) => ({ ...a, ...b }), {})
  }
}
