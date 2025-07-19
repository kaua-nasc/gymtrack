import knex from 'knex';

export const testDbClient = knex({
  client: 'pg',
  connection: process.env.DATABASE_URL,
  searchPath: ['training-plan', 'identity', 'public'],
});
