module.exports = {
	development: {
		client: 'pg',
		connection: { user: 'me', database: 'bot_data' }
	},
	production: { client: 'pg', connection: process.env.DATABASE_URL }
};
