export const stringOperators = ["eq", "starts", "incl", "ends"] as const
export const numberOperators = ["gt", "gte", "lt", "lte", "eq"] as const
export const arrayOperators = ["incl", "excl", "len", "empty"] as const
export const booleanOperators = ["eq"] as const

export type StringOperators = typeof stringOperators[number];
export type NumberOperators = typeof numberOperators[number];
export type ArrayOperators = typeof arrayOperators[number];
export type BooleanOperators = typeof booleanOperators[number];

export type Operator = StringOperators | NumberOperators | ArrayOperators | BooleanOperators;
