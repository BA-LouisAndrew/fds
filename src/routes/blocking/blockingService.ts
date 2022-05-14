import { RulesEngine } from "../../engine/rulesEngine"
import { Blocking, BlockingId } from "./blocking"


export class BlockingService {
  private static rulesEngine: RulesEngine = new RulesEngine()

  public async create(id: BlockingId): Promise<Blocking> {
    return await BlockingService.rulesEngine.createBlocking(id)
  }

  public async get(id: BlockingId): Promise<Blocking> {
    return BlockingService.rulesEngine.getBlocking(id)
  }
}