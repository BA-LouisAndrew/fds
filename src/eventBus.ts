import { TinyEmitter } from "tiny-emitter"

export class EventBus extends TinyEmitter {
  private static instance = new TinyEmitter()
  
  static on = this.instance.on
  static off = this.instance.off
  static emit = this.instance.emit
  static once = this.instance.once
  
  static readonly EVENTS = {
    VALIDATION_EVENT_UPDATE: "validation_event:update",
    VALIDATION_DONE: "validation_done"
  }
}