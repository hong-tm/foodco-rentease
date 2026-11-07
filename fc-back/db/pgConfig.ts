import env from '../env.js'

export const pgConfig = {
  database: env.PG_DATABASE,
  host: 'localhost',
  user: env.PG_USER,
  password: env.PG_PASSWORD,
  port: env.PG_PORT,
}
