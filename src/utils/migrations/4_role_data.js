
exports.up = (knex, Promise) => {
    return knex.schema.createTable('backup_roles', (table) => {
      table.increments('role_id')
      table.integer('role_dataset')
      table.string('role_snowflake')
      table.string('role_name')
      table.integer('role_color')
      table.integer('role_permissions')
    })
  }
  
  exports.down = (knex, Promise) => {
    return knex.schema.dropTable('backup_roles')
  }
  