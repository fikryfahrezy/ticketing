import postgres from "postgres";

const {
  POSTGRES_HOST,
  POSTGRES_PORT,
  POSTGRES_DB,
  POSTGRES_USER,
  POSTGRES_PASSWORD,
} = process.env;

const sql = postgres({
  host: POSTGRES_HOST,
  port: POSTGRES_PORT ? Number(POSTGRES_PORT) : undefined,
  db: POSTGRES_DB,
  user: POSTGRES_USER,
  password: POSTGRES_PASSWORD,
});

export default sql;
