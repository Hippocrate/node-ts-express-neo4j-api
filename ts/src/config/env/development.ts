
export default {
	env: "development",
	authentication: {
		clientID: "1220614731312073",
		clientSecret: "f7c32a64f17bbbda02d138c97ad376b8",
		callbackURL: "http://localhost:3000/authentication/login/facebook/return"
	},
	neo4j: "http://neo4j:neo4j@localhost:7474",
	mongodb: "mongodb://localhost/[DB]",
	jwtSecret: "0a6b944d-d2fb-46fc-a85e-0295c986cd9f",
	port: 3000
};
