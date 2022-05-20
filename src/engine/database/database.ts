import { PrismaClient } from "@prisma/client"

import { Context } from "./context"

export class Database {
  private static context: Context

  constructor(context: Context) {
    Database.context = context
  }

  private static get prisma(): PrismaClient {
    return this.context.prisma
  }
  
  static get validationRule() {
    return this.prisma.validationRule
  }

  async init() {
    await Database.prisma.$connect()
    console.log("> Database is up")
  }
}
