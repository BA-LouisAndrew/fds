// src/users/usersController.ts
import { Body, Controller, Get, Path, Post, Query, Route, SuccessResponse } from "tsoa"

import { User } from "./user"
import { UserCreationParams, UsersService } from "./usersService"

@Route("users")
export class UsersController extends Controller {
  @Get("{userId}")
  public async getUser(@Path() userId: number, @Query() name?: string): Promise<User> {
    return new UsersService().get(userId, name)
  }

  @SuccessResponse("201", "Created") // Custom success response
  @Post()
  public async createUser(@Body() requestBody: UserCreationParams): Promise<User> {
    this.setStatus(201) // set return status 201
    return new UsersService().create(requestBody)
  }
}
