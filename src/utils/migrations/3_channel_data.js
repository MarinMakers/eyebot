exports.up = (knex, Promise) => {
    return knex.schema.createTable('channels', (table) => {
      table.increments('channel_id')
      table.integer('channel_parentid')
      table.string('server_id')
      table.dateTime('channel_timestamp')
      table.string('channel_snowflake')
      table.string('channel_name')
      table.integer('channel_position')
    })
  }
  
  exports.down = (knex, Promise) => {
    return knex.schema.dropTable('channels')
  }
  