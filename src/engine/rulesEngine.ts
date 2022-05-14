import { Blocking, BlockingId } from "../routes/blocking/blocking"
import { DataStore } from "./data/dataStore"

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export class RulesEngine {
  private async _getBlocking(id: BlockingId): Promise<Blocking> {
    return await DataStore.instance.get(id)
  }

  private async _setBlocking(id: BlockingId, blocking: Blocking | null): Promise<void> {
    if (!blocking) {
      return await DataStore.instance.delete(id)
    }

    return await DataStore.instance.set(id, blocking)
  }

  public async getBlocking(id: BlockingId): Promise<Blocking> {
    const blocking = this._getBlocking(id)
    return blocking
  }

  public async createBlocking(id: BlockingId) {
    const newBlocking: Blocking = { id, value: 0 }
    await this._setBlocking(id, newBlocking)
    this.createBlockerThread(newBlocking)

    return newBlocking
  }

  async deleteBlocking(id: BlockingId) {
    const blocking = await this.getBlocking(id)

    if (blocking) {
      return await this._setBlocking(id, null)
    }
  }

  async createBlockerThread(blocking: Blocking) {
    await this.blocker(blocking)
    const { id } = blocking
    console.log(`blocker for ${id} done`)
    this.deleteBlocking(id)
  }

  async blocker(blocking: Blocking) {
    const { id } = blocking
    const total = 10
    for (let index = 0; index < total; index++) {
      await delay(5000) // Example -> publish message to MQ
      const { value } = await this.getBlocking(id)
      await this._setBlocking(id, { id, value: value + 1 })
      console.log(`Blocker on ${id}. Index: ${index}. value: ${value}`)
    }
  }
}
