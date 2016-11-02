
export default {
	env: "production",
	mongodb: process.env.MONGODB_URL,
	neo4j: process.env.NEO4J_URL,
	port: process.env.PORT,
	jwtSecret: process.env.SECRET
};