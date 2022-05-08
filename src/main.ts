import cors from "cors"
import express, { Request, Response } from "express"

const app = express()

app.use(cors())
app.use(express.json())

app.get("/", (req: Request, res: Response) => {
  res.send("Application works!")
})

app.listen(3000, () => {
  console.log("Application started on port 3000!")
})