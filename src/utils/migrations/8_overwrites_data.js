exports.up = (knex, Promise) => {
    return knex.schema.createTable('backup_overwrites', (table) => {
      table.increments('overwrite_id')
      table.integer('overwrite_dataset')
      table.integer('overwrite_targetid')
      table.integer('overwrite_channelid')
      table.string('overwrite_type')
      table.integer('overwrite_allow')
      table.integer('overwrite_deny')
    })
  }
  
  exports.down = (knex, Promise) => {
    return knex.schema.dropTable('backup_overwrites')
  }
  