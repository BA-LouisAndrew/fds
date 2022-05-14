import { Blocking, BlockingId } from "../../routes/blocking/blocking"

export abstract class DataStore {
  static DataStore: DataStore

  abstract get(id: BlockingId): Promise<Blocking>
  abstract set(id: BlockingId, blocking: Blocking): Promise<void>
}