
exports.up = (knex, Promise) => {
  return knex.schema.createTable('backup_memberroles', (table) => {
    table.increments('memberrole_id')
    table.integer('memberrole_dataset')
    table.string('user_id')
    // table.string('username')
    table.string('role_id')
  })
}

exports.down = (knex, Promise) => {
  return knex.schema.dropTable('backup_memberroles')
}
