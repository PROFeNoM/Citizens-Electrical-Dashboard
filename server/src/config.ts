const devMode = process.env.NODE_ENVIRONMENT === 'development'

export const config = {
	webServer: {
		port: devMode ? 5000 : 80,
	},
	database: {
		host: process.env.DATABASE_HOST ?? 'localhost',
		port: parseInt(process.env.DATABASE_PORT ?? '5432', 10),
		username: process.env.DATABASE_USERNAME ?? 'postgres',
		password: process.env.DATABASE_PASSWORD ?? 'postgres',
		database: process.env.DATABASE_NAME ?? 'postgres',
	}
};