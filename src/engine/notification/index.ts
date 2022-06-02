import { Channel, connect } from "amqplib"

import { Config } from "@/types/config"

export class Notification {
  static URL = "amqp://localhost"
  static EXCHANGE = "FDS"

  private static channel: Channel | null = null

  async init(notificationUrl: Config["notificationUrl"] = "") {
    if (notificationUrl) {
      Notification.URL = notificationUrl
    }

    try {
      const connection = await connect(Notification.URL)
      const channel = await connection.createChannel()
      await channel.assertExchange(Notification.EXCHANGE, "fanout", { durable: false })

      Notification.channel = channel

      if (process.env.NODE_ENV !== "test") {
        console.log("> Notification channel is connected")
      }
    } catch (err) {
      console.error(err)
    }
  }

  static async publish(content: string) {
    this.channel?.publish(Notification.EXCHANGE, "", Buffer.from(content))
  }
}
