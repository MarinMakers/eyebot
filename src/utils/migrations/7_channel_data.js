exports.up = (knex, Promise) => {
    return knex.schema.createTable('backup_channels', (table) => {
      table.increments('channel_id')
      table.integer('channel_dataset')
      table.integer('channel_parentid')
      table.boolean('channel_nsfw')
      table.integer('channel_position')
      table.string('channel_topic')
      table.string('channel_type')
      table.string('channel_snowflake')
      table.string('channel_name')
    })
  }
  
  exports.down = (knex, Promise) => {
    return knex.schema.dropTable('backup_channels')
  }