
exports.up = (knex, Promise) => {
  return knex.schema.createTable('backup_members', (table) => {
    table.increments('member_id')
    table.integer('member_dataset')
    table.string('member_snowflake')
    table.string('member_username')
    table.string('member_tag')
    table.string('member_nickname')
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('backup_members')
}
