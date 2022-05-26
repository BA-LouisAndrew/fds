/**
 * Types are heavily inspired by
 * https://github.com/CacheControl/json-rules-engine/blob/master/docs/rules.md#constructorobject-optionsstring-json
 */

import { OperatorType } from "./operators"

/**
 * Model for the validation rule that would be stored in the database and evaluated during runtime.
 */
export interface ValidationRule {
  /**
   * Retry strategy if the endpoint is not accessible.
   */
  retryStrategy?: RetryStrategy | null;
  /**
   * Used to determine the parameter on the endpoint URL. (e.g. endpointUrl: 'http://localhost/validate/{user}/{city}')
   * Only available when the endpoint URL contains a URL parameter.
   * @example { user: "$.firstName", city: "$.city" }
   */
  requestUrlParameter?: GenericObject;
  /**
   * Determine whether the specific validation rule should be skipped.
   */
  skip: boolean;
  /**
   * Request body to be passed to the external endpoint. Only available on `POST` and `PUT` HTTP methods.
   * @example { user: "$.firstName", city: "$.city" }
   */
  requestBody?: GenericObject;
  /**
   * Condition/-s, with which the rule should be evaluated to determine
   * whether the validation passes.
   */
  condition: Condition | BooleanCondition;
  /**
   * HTTP method to be used to call the external check endpoint.
   */
  method: string; // TODO: validate possible HTTP method
  /**
   * Amount of score that should be incremented to the resulting fraud score if
   * the validation failed.
   * @isFloat
   * @minimum 0
   * @maximum 1
   */
  failScore: number;
  /**
   * URL of the external check endpoint.
   * @example 'http://localhost:3000/address-validation'
   */
  endpoint: string;
  /**
   * Priority of the validation rule. Determines the priority of the rule evaluation.
   * Rules with higher priority will be run first.
   * @isInt
   * @default 0
   */
  priority: number;
  /**
   * Unique identifier of the rule.
   */
  name: string;
}

export type GenericObject = { [key: string]: any };

export type ConditionType = "string" | "number" | "array" | "boolean";

/**
 * Condition of a rule, to determine whether the validation passes.
 */
export type Condition = {
  /**
   * Path to the attribute that should be evaluated. Path is evaluated using a json-path syntax.
   * Please take a look into: https://github.com/dchester/jsonpath#jsonpath-syntax for the detailed
   * information.
   * @example '$.statusCode' | '$.validAddress'
   */
  path: string;
  /**
   * Name of the operator that should be used$.validAddress to evaluate the condition.
   * @example 'equals' | 'contains'
   */
  operator: OperatorType;
  /**
   * Type of the attribute to be validated.
   */
  type: ConditionType;
  /**
   * Value, with which the condition should be evaluated.
   * @example true | 200 | 'success'
   */
  value: any;
  /**
   * Message to be returned if the condition fails
   */
  failMessage: string;
};

/**
 * Boolean condition ('any' | 'all') that wraps an array of conditions.
 *  'any': The validation passes if at least one of the condition is true.
 *  'all': The validation passes ONLY if ALL of the conditions are true.
 */
export type BooleanCondition = {
  all?: Condition[];
  any?: Condition[];
};

/**
 * Retry strategy if the endpoint is not accessible. Will be passed into `got`'s
 * `retry` option.
 * TODO: Refine
 *
 * More info:
 * https://github.com/sindresorhus/got/blob/2ac07e1b60f59e2219bd6c2809a9e40f56b146b6/documentation/7-retry.md
 */
export type RetryStrategy = {
  /**
   * @isInt
   * @minimum 1
   * @maximum 3
   */
  limit: number;
  statusCodes: number[]; // TODO: validate possible HTTP status codes
};
