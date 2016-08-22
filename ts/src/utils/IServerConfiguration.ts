export interface IServerConfiguration {
    env: string;
    authentication: any;
    neo4j: string;
    mongodb: any;
    port: number;
    jwtSecret: string;
} 