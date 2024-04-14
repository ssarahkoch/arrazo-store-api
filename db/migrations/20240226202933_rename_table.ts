import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.renameTable('slidebar', 'slider')
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.renameTable('slider', 'slidebar')
}
