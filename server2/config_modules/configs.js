const writeConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,      
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { ca: caCert }
};

const readConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_READ_USER,     
    password: process.env.DB_READ_PASSWORD,
    database: process.env.DB_NAME,
    ssl: { ca: caCert }
};