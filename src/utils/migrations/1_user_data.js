
exports.up = (knex, Promise) => {
  return knex.schema.createTable('users', (table) => {
    table.increments('id')
    table.string('user_id')
    table.string('username')
    table.string('server_id')
    table.integer('quest_xp')
    table.integer('message_xp')
    table.dateTime('last_msg')
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('users')
}
