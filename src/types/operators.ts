export const stringOperatorIds = ["eq", "starts", "incl", "ends"] as const
export const numberOperatorIds = ["gt", "gte", "lt", "lte", "eq"] as const
export const arrayOperatorIds = ["incl", "excl", "len", "empty"] as const
export const booleanOperatorIds = ["eq"] as const

export type StringOperatorIds = typeof stringOperatorIds[number];
export type NumberOperatorIds = typeof numberOperatorIds[number];
export type ArrayOperatorIds = typeof arrayOperatorIds[number];
export type BooleanOperatorIds = typeof booleanOperatorIds[number];

export type OperatorType = StringOperatorIds | NumberOperatorIds | ArrayOperatorIds | BooleanOperatorIds;
