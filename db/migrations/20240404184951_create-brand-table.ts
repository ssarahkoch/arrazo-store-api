import { Knex } from 'knex'

export async function up(knex: Knex): Promise<void> {
  await knex.schema.createTable('brand', (table) => {
    table.uuid('id').primary()
    table.text('title').notNullable().unique()
  })

  await knex.schema.table('products', (table) => {
    table.uuid('brand_id').references('id').inTable('brand').onDelete('CASCADE')
  })
}

export async function down(knex: Knex): Promise<void> {
  await knex.schema.table('products', (table) => {
    table.dropColumn('brand_id')
  })

  await knex.schema.dropTable('brand')
}
