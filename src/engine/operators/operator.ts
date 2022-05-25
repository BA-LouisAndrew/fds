type OperateFunction<T, V = T> = (value: T, receivedValue: V) => boolean;

export class Operator<ValueType = any, IdentifierType extends string = string, ReceivedValueType = ValueType> {
  private identifier: IdentifierType
  private operateFunction: OperateFunction<ValueType, ReceivedValueType>
  protected validateFunction: (value: any) => boolean

  constructor(
    identifier: IdentifierType,
    operateFunction: OperateFunction<ValueType, ReceivedValueType>,
  ) {
    this.identifier = identifier
    this.operateFunction = operateFunction
  }

  // TODO
  validate(value: any): boolean {
    return this.validateFunction(value)
  }
  
  setValidateFunction(validateFunction: (value: any) => boolean) {
    this.validateFunction = validateFunction
    return this // Method chaining
  }

  operate(value: ValueType, receivedValue: ReceivedValueType): boolean {
    const isValid = this.validate(value)
    if (!isValid) {
      return this.handleInvalidValue(value)
    }

    return this.operateFunction(value, receivedValue)
  }

  // TODO
  handleInvalidValue(value: any) {
    return false
  }
}

// operators are using the `flyweight` pattern: https://refactoring.guru/design-patterns/flyweight