import { Body, Controller, Get, Path, Post, Route, SuccessResponse } from "tsoa"

import { User } from "./user"
import { UserCreationParams, UsersService } from "./usersService"

@Route("users")
export class UsersController extends Controller {
  @Get("{userId}")
  public async getUser(@Path() userId: number): Promise<{value: string}> {
    const value = await new UsersService().redisPOC(userId.toString())
    return { value }
  }

  @SuccessResponse("201", "Created") // Custom success response
  @Post()
  public async createUser(@Body() requestBody: UserCreationParams): Promise<User> {
    this.setStatus(201) // set return status 201
    const user = await new UsersService().create(requestBody)
    return user
  }
}
