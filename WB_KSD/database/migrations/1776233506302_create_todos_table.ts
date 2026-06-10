import { BaseSchema } from '@adonisjs/lucid/schema'

export default class extends BaseSchema {
  protected tableName = 'todos'

  async up() {
    this.schema.createTable(this.tableName, (table) => {
      table.increments('id')
      table.string('title').notNullable()
      table.string('category').nullable()
      table.string('priority').nullable()
      table.boolean('is_completed').defaultTo(false)
      table.string('file_path').nullable()
      table.date('due_date').nullable() 
      table.timestamps(true, true)
    })
  }

  async down() {
    this.schema.dropTable(this.tableName)
  }
}