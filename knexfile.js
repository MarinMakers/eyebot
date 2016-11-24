module.exports = {
	development: {
		client: 'pg',
		connection: { 
			database: 'bot_data',
		},
		useNullAsDefault: true
	},
	production: { client: 'pg', connection: process.env.DATABASE_URL }
};
