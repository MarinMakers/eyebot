
exports.up = function(knex, Promise) {
	return knex.schema.createTable('user_data', function(table) {
		table.string('user_id').primary();
		table.string('server_id');
		table.integer('xp');
		table.dateTime('last_msg');
	})
};

exports.down = function(knex, Promise) {
	return knex.schema.dropTable('user_data');
};
