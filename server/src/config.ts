export const config = {
	webServer: {
		port: process.env.NODE_ENV === 'production' ? 80 : 5000,
	},
	database: {
		host: process.env.DATABASE_HOST ?? 'localhost',
		port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
		username: process.env.DATABASE_USERNAME ?? 'postgres',
		password: process.env.DATABASE_PASSWORD ?? 'postgres',
		database: process.env.DATABASE_NAME ?? 'postgres',
	}
};
