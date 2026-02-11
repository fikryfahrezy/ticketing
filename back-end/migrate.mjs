import postgres from "postgres";
import shift from "postgres-shift";
import { fileURLToPath } from "url";

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
} = process.env;

const sql = postgres({
  host: POSTGRES_HOST,
  port: POSTGRES_PORT,
  db: POSTGRES_DB,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
});

shift({
  sql,
  path: fileURLToPath(new URL("migrations", import.meta.url)),
  before: ({ migration_id, name }) => {
    console.log("Migrating", migration_id, name);
  },
})
  .then(() => {
    console.log("All good");
    process.exit(0);
  })
  .catch((err) => {
    console.error("Failed", err);
    process.exit(1);
  });
