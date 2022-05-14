import { Blocking, BlockingId } from "../routes/blocking/blocking"

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

export class RulesEngine {
  blockings: Blocking[]

  constructor() {
    this.blockings = []
  }

  private _getBlocking(id: BlockingId): Blocking | undefined {
    console.log(this.blockings)
    return this.blockings.find((blocking) => blocking.id === id)
  }

  public getBlocking(id: BlockingId): Blocking | undefined {
    const blocking = this._getBlocking(id)
    return blocking
  }

  public createBlocking(id: BlockingId) {
    const newBlocking: Blocking = { id, value: 0 }
    this.blockings.push(newBlocking)
    this.createBlockerThread(newBlocking)

    return newBlocking
  }

  deleteBlocking(id: BlockingId) {
    const blocking = this.getBlocking(id)

    if (blocking) {
      this.blockings = this.blockings.filter((blocking) => blocking.id === id)
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
      console.log(`Blocker on ${id}. Index: ${index}`)
      if(blocking) {
        blocking.value++
      }
    }
  }
}
