import { PrismaClientKnownRequestError } from "@prisma/client/runtime"

import { Database } from "@/engine/database/database"
import { ApiErrorResponse, ApiResponse, ApiSuccessResponse } from "@/types/api"
import { Secret } from "@/types/secret"

export class SecretsService {
  /**
   * Only to be used internally!
   */
  static async listSecrets(): Promise<{ [key: string]: string }> {
    try {
      const secrets = await Database.secret.findMany()
      return secrets.map(({ key, value }) => ({ [key]: value })).reduce((a, b) => ({ ...a, ...b }), {})
    } catch {
      return {}
    }
  }

  static async listSecretKeys(): Promise<ApiSuccessResponse<string[]>> {
    try {
      const secrets = await Database.secret.findMany()
      return {
        data: secrets.map(({ key }) => key),
        error: null,
      }
    } catch {
      return {
        data: [],
        error: null,
      }
    }
  }

  static async createSecretEntry(secret: Secret): Promise<ApiResponse<true>> {
    try {
      await Database.secret.create({
        data: secret,
      })
      return {
        data: true,
        error: null,
      }
    } catch (e) {
      return this.handleError(e, secret)
    }
  }

  static async updateSecretValue(secret: Secret): Promise<ApiResponse<true>> {
    try {
      await Database.secret.update({
        where: {
          key: secret.key,
        },
        data: {
          value: secret.value,
        },
      })

      return {
        data: true,
        error: null,
      }
    } catch (e) {
      return this.handleError(e, secret)
    }
  }

  static async deleteSecretEntry(secretKey: string): Promise<ApiResponse<true>> {
    try {
      await Database.secret.delete({
        where: {
          key: secretKey,
        },
      })

      return {
        data: true,
        error: null,
      }
    } catch (e) {
      return this.handleError(e)
    }
  }

  private static handleError(e: unknown, payload: any = {}): ApiErrorResponse {
    if (e instanceof PrismaClientKnownRequestError) {
      if (e.meta?.cause) {
        return {
          error: {
            message: e.meta.cause as string,
          },
          data: null,
        }
      }

      switch (e.code) {
        case "P2002":
          return {
            error: {
              message: `Secret with name '${payload?.key}' already exists!`,
            },
            data: null,
          }
        case "P2025":
          return {
            error: {
              message: `Secret with name '${payload?.key}' doesn't exist`,
            },
            data: null,
          }
        default:
          return {
            error: {
              message: e.message,
            },
            data: null,
          }
      }
    }

    return {
      error: {
        message: "",
      },
      data: null,
    }
  }
}
