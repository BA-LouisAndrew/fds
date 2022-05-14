import { RulesEngine } from "../../engine/rulesEngine"
import { Blocking, BlockingId } from "./blocking"


export class BlockingService {
  private static rulesEngine: RulesEngine = new RulesEngine()

  public create(id: BlockingId): Blocking {
    return BlockingService.rulesEngine.createBlocking(id)
  }

  public get(id: BlockingId): Blocking {
    return BlockingService.rulesEngine.getBlocking(id)
  }
}