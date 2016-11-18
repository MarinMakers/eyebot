
exports.up = function(knex, Promise) {
	return knex.schema.createTable('user_data', function(table) {
		table.increments('id');
		table.string('user_id');
		table.string('username');
		table.string('server_id');
		table.integer('xp');
		table.dateTime('last_msg');
	})
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('user_data');
};
