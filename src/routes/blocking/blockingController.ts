// src/users/usersController.ts
import { Body, Controller, Get, Path, Post, Route, SuccessResponse } from "tsoa"

import { adder } from "@/utils/adder"

import { Blocking, BlockingId } from "./blocking"
import { BlockingService } from "./blockingService"

@Route("blocking")
export class BlockingController extends Controller {
  @Get("{blockingId}")
  public async getBlocking(@Path() blockingId: number): Promise<Blocking> {
    return new BlockingService().get(blockingId)
  }

  @SuccessResponse("201", "Created") // Custom success response
  @Post()
  public async createUser(@Body() body: { id: BlockingId }): Promise<Blocking> {
    this.setStatus(201)
    return new BlockingService().create(body.id)
  }

  @Get()
  public async getAdder(): Promise<number> {
    return adder(1, 2)
  }
}