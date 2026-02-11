import express from "express";
import * as swaggerUi from "swagger-ui-express";
import swaggerFile from "../dist/swagger-output.json" assert { type: "json" };
import ticketsRouter from "./tickets/representational.ts";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.get("/", (_, res) => {
  res.send("Hello World!");
});
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerFile));
app.use("/tickets", ticketsRouter);
app.listen(port, () => {
  console.log(`Listening on port ${port}...`);
});