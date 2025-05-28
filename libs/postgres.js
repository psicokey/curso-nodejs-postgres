const { Client } = require ('pg');

async function getConnection (){
const client = new Client({
    host:'localhost',
    port: 5432,
    user: 'key',
    password: 'admin123',
    database: 'mydb'
});

await client.connect();
return client;
} 

module.exports = getConnection