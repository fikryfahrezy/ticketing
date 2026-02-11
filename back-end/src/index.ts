import express from "express";
import * as swaggerUi from "swagger-ui-express";
import swaggerFile from "../dist/swagger-output.json" assert { type: "json" };
import { apiKeyAuth } from "./auth.ts";

const app = express();
const port = process.env.PORT || 3000;

app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile))

app.get("/", (_, res) => {
  res.send("Hello World!");
});

app.get(
  "/me",
  apiKeyAuth(),
  /* #swagger.security = [{"apiKeyAuth": []}] */
  (req, res) => {
    res.json({ apiKey: req.apiKey ?? null });
  }
);

app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});