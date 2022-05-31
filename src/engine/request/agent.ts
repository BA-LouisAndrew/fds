import { Method, Response as GotResponse } from "got"
import jp from "jsonpath"

import { ApiResponse } from "@/types/api"
import { GenericObject, ValidationRule } from "@/types/rule"

import { Context } from "./context"

type FireRequestReturnType = ApiResponse<
  Pick<GotResponse, "statusCode" | "statusMessage" | "rawBody" | "retryCount"> & { body: any }
>

export class Agent {
  private static context: Context

  private static get client() {
    return Agent.context.client
  }

  static setClient(context: Context) {
    this.context = context
  }

  static async fireRequest<DataType, ResponseType = string>(
    rule: ValidationRule,
    data: DataType,
  ): Promise<FireRequestReturnType> {
    const { endpoint, method, retryStrategy } = rule

    try {
      const response = await this.client<ResponseType>(endpoint, {
        method: method as Method,
        retry: retryStrategy || {},
        json: this.getJSONBody(rule, data),
      })

      const { statusCode, statusMessage, body, rawBody, retryCount } = response

      return {
        error: null,
        data: {
          statusCode,
          statusMessage,
          rawBody,
          retryCount,
          body: this.parseResponseBody(body),
        },
      }
    } catch (e) {
      console.log(e)
      // Handle error here
      return {
        error: {
          message: e,
        },
        data: null,
      }
    }
  }

  private static parseResponseBody(body: any) {
    try {
      if (typeof body === "string") {
        return JSON.parse(body)
      }
    } catch {
      //
    }

    return body
  }

  private static getJSONBody({ requestBody, method }: ValidationRule, data: any) {
    if (method === "GET" || !requestBody) {
      return undefined
    }

    return Object.entries(requestBody)
      .map(([key, value]) => {
        const dataFromPath = jp.query(data, value)[0]
        return {
          [key]: dataFromPath ?? value,
        }
      })
      .reduce((a, b) => ({ ...a, ...b }), {})
  }
}
