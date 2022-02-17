const {Pool} = require("pg");

interface Credentials {
    user: string;
    host: string;
    database: string;
    password: string;
    port: number;
}

const credentials: Credentials = {
    user: "read_write_user",
    host: "localhost",
    database: "dashboard",
    password: "password_1",
    port: 5432
};

export const pool = new Pool(credentials);