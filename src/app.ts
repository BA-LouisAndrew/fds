// src/app.ts
import bodyParser from "body-parser"
import cors from "cors"
import express, { Request, Response } from "express"
import swaggerUi from "swagger-ui-express"

import { RegisterRoutes } from "./tsoa/routes"

export const app = express()

// Use body parser to read sent json payloads
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

RegisterRoutes(app)

/**
 * SSE -> Non-REST compliant endpoints
 */
app.get("/users", (_, response: Response) => {
  response.send("Hi!")
})
