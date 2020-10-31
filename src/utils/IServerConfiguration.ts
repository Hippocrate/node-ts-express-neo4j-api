export interface IServerConfiguration {
    env: string;
    neo4jUrl: string;
    neo4jUsername: string;
    neo4jPassword: string;

    mongodb: any;
    port: number;
    jwtSecret: string;
} 