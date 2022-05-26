import { Method, Response as GotResponse } from "got"
import { query } from "jsonpath"

import { ApiResponse } from "@/types/api"
import { GenericObject, ValidationRule } from "@/types/rule"

import { Context } from "./context"

type FireRequestReturnType<ResponseType> = ApiResponse<GotResponse<ResponseType>>;

export class Agent {
  private static context: Context

  private static get client() {
    return Agent.context.client
  }

  static setClient(context: Context) {
    this.context = context
  }

  static async fireRequest<DataType, ResponseType = any>(
    rule: ValidationRule,
    data: DataType,
  ): Promise<FireRequestReturnType<ResponseType>> {
    const { endpoint, method, retryStrategy, requestBody } = rule

    try {
      const response = await this.client<ResponseType>(endpoint, {
        method: method as Method,
        retry: retryStrategy || {},
        json: this.getJSONBody(requestBody, data),
      })

      return {
        error: null,
        data: response,
      }
    } catch (e) {
      // Handle error here
      return {
        error: {
          message: e
        },
        data: null,
      }
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
