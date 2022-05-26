import got, { Got } from "got"
import { mock, MockProxy } from "vitest-mock-extended"

export type Context = {
  client: Got;
};

export type MockContext = MockProxy<Context>

export const createContext = (): Context => {
  return {
    client: got,
  }
}

export const createMockContext = (): MockContext => mock<MockContext>()
