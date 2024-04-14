import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.alterTable('products', (table) => {
    table
      .text('subtitle')
      .notNullable()
      .defaultTo('Default Subtitle')
      .after('title')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.alterTable('products', (table) => {
    table.dropColumn('subtitle')
  })
}
