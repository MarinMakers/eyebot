exports.up = (knex, Promise) => {
    return knex.schema.createTable('overrides', (table) => {
      table.increments('override_id')
      table.integer('override_channelid')
      table.integer('override_snowflake')
      table.dateTime('override_timestamp')
      table.integer('override_type')
      table.integer('override_allow')
      table.integer('override_deny')
    })
  }
  
  exports.down = (knex, Promise) => {
    return knex.schema.dropTable('overrides')
  }
  