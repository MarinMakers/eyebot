exports.up = (knex, Promise) => {
    return knex.schema.createTable('backup_guilds', (table) => {
      table.increments('guild_id')
      table.string('guild_snowflake')
      table.string('guild_name')
    })
  }
  
  exports.down = (knex, Promise) => {
    return knex.schema.dropTable('backup_guilds')
  }
  