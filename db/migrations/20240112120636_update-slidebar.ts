import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('slidebar', (table) => {
    table.uuid('id').primary()
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('slidebar', (table) => {
    table.dropColumn('id')
  })
}
