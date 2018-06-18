exports.up = (knex, Promise) => {
    return knex.schema.createTable('backup_datasets', (table) => {
      table.increments('dataset_id')
      table.integer('dataset_guild')
      table.dateTime('dataset_timestamp').defaultTo(knex.fn.now())
    })
  }
  
  exports.down = (knex, Promise) => {
    return knex.schema.dropTable('backup_datasets')
  }
  