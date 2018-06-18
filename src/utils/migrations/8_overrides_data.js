exports.up = (knex, Promise) => {
    return knex.schema.createTable('backup_overrides', (table) => {
      table.increments('override_id')
      table.integer('override_dataset')
      table.integer('override_channelid')
      table.string('override_snowflake')
      table.dateTime('override_timestamp')
      table.integer('override_type')
      table.integer('override_allow')
      table.integer('override_deny')
    })
  }
  
  exports.down = (knex, Promise) => {
    return knex.schema.dropTable('backup_overrides')
  }
  