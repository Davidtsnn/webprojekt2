import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'habit_logs'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.integer('habit_id').references('id').inTable('habits')
      table.boolean('done').defaultTo(false)
      table.timestamps(true, true)
      table.date('date').notNullable()
      
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}