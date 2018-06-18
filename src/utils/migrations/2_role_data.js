
exports.up = (knex, Promise) => {
    return knex.schema.createTable('roles', (table) => {
      table.increments('role_id')
      table.integer('server_id')
      table.dateTime('role_timestamp')
      table.string('role_snowflake')
      table.string('role_name')
      table.integer('role_color')
      table.integer('role_permissions')
    })
  }
  
  exports.down = (knex, Promise) => {
    return knex.schema.dropTable('roles')
  }
  