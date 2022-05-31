// src/app.ts

import bodyParser from "body-parser"
import cors from "cors"
import express, { NextFunction, Request, Response } from "express"
import swaggerUi from "swagger-ui-express"
import { ValidateError } from "tsoa"

import { subscribeToValidationProgress } from "./routes/validation/validationController"
import { RegisterRoutes } from "./tsoa/routes"

export const app = express()

app.use(
  bodyParser.urlencoded({
    extended: true,
  }),
)
app.use(bodyParser.json())
app.use(cors())

app.use("/docs", swaggerUi.serve, async (_req: Request, res: Response) => {
  return res.send(swaggerUi.generateHTML(await import("./tsoa/swagger.json")))
})

app.get("/api/v1/validate/:validationId/subscribe", subscribeToValidationProgress)

RegisterRoutes(app)

app.use((_req, res: Response) => {
  // Catch all route handler
  res.status(404).send({
    message: "Not Found",
  })
})

app.use((err: unknown, req: Request, res: Response, next: NextFunction): Response | void => {
  // Error handler
  if (err instanceof ValidateError) {
    return res.status(422).json({
      message: "Validation Failed",
      details: err?.fields,
    })
  }

  if (err instanceof Error) {
    return res.status(500).json({
      message: "Internal Server Error",
    })
  }

  next()
})
