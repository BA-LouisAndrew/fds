export interface Config {
  enableCache: boolean;
  dataStore: "redis" | "in-memory";
}
