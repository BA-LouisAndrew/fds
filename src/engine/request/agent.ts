import { HTTPError, Method, Response as GotResponse } from "got"
import jp from "jsonpath"

import { ApiResponse } from "@/types/api"
import { ValidationRule } from "@/types/rule"

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
    const { method, retryStrategy } = rule

    try {
      const response = await this.client<ResponseType>(this.getUrl(rule, data), {
        method: method as Method,
        retry: retryStrategy || {},
        headers: this.getHeader(rule, data),
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
      if (e instanceof HTTPError) {
        const { statusCode, body, statusMessage, rawBody, retryCount } = e.response
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
      }

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
      .map((entry) => this.accessDataFromPath(entry, data))
      .reduce((a, b) => ({ ...a, ...b }), {})
  }

  private static getHeader({ requestHeader }: ValidationRule, data: any) {
    if (!requestHeader) {
      return undefined
    }

    return Object.entries(requestHeader)
      .map((entry) => this.accessDataFromPath(entry, data))
      .reduce((a, b) => ({ ...a, ...b }), {})
  }

  private static getUrl({ endpoint, requestUrlParameter }: ValidationRule, data: any) {
    return Object.entries(requestUrlParameter || {})
      .map((entry) => {
        const [key] = entry
        return [key, this.accessDataFromPath(entry, data)[key]]
      })
      .reduce((a, [key, value]) => a.replace(`$${key}`, value), endpoint)
  }

  private static accessDataFromPath([key, value]: [string, any], data: any) {
    if (typeof value !== "string") {
      return {
        [key]: value,
      }
    }

    const SEPARATOR = " "
    const splitted = value.split(SEPARATOR)
    return {
      [key]: splitted
        .map((chunk) => {
          try {
            const dataFromPath = jp.query(data, chunk)[0]
            return dataFromPath ?? chunk
          } catch {
            return chunk
          }
        })
        .join(SEPARATOR),
    }
  }
}
