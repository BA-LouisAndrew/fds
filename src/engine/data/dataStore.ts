import { Blocking, BlockingId } from "../../routes/blocking/blocking"

export abstract class DataStore {
  static instance: DataStore

  abstract get(id: BlockingId): Promise<Blocking>
  abstract set(id: BlockingId, blocking: Blocking): Promise<void>
  abstract delete(id: BlockingId): Promise<void>

  validate(object: any): boolean {
    return object && object.id !== undefined && object.value !== undefined
  }
}