// src/users/usersService.ts
import { DataStore } from "@/engine/data/dataStore"

import { User } from "./user"

// A post request should not contain an id.
export type UserCreationParams = Pick<User, "email" | "name" | "phoneNumbers">;

export class UsersService {
  public get(id: number, name?: string): User {
    return {
      id,
      email: "jane@doe.com",
      name: name ?? "Jane Doe",
      status: "Happy",
      phoneNumbers: [],
    }
  }

  public async create(userCreationParams: UserCreationParams): Promise<User> {
    const id = Math.floor(Math.random() * 10000)
    await DataStore.getInstance().set(id.toString(), userCreationParams.name)
    return {
      id, 
      status: "Happy",
      ...userCreationParams,
    }
  }

  public redisPOC(id: string): Promise<string> {
    return DataStore.getInstance().get(id)
  }
}