import { Secret } from "@/types/secret"

export const sampleSecret: Secret = {
  key: "API_KEY",
  value: "ABCD21231",
}

export const samplePrismaSecret = {
  ...sampleSecret,
  id: "",
}
