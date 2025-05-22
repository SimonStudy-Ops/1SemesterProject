import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config(); // read .env file
console.log('Connecting to database', process.env.PG_DATABASE);
const db = new pg.Pool({
    host:     process.env.PG_HOST,
    port:     parseInt(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user:     process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl:      { rejectUnauthorized: false },
});
const dbResult = await db.query('select now() as now');
console.log('Database connection established on', dbResult.rows[0].now);

import express from 'express';

console.log('Initialising webserver...');
const port = 3001;
const server = express();
server.use(express.static('Website'));
server.use(onEachRequest)
server.get('/api/trade', onGetTrade);
server.get('/api/eggconsumption', onGetEggconsumption);
server.get('/api/howManyChickensEU', onGetHowManyChickensEU);
server.listen(port, onServerReady);

 async function onEachRequest(request, response, next) {
    console.log(new Date(), request.method, request.url);
    next();
}

function onServerReady() {
    console.log('Webserver running on port', port);
}
// Defines the async function that handles the request from trade. And the async function allows other task to be done while the data finishes running. 
async function onGetTrade(request, response) {
    // Sends a query from country, type, year and amount from trade. 
    // The await function pauses and send the information to the database.  
    const dbResult = await db.query(`select country, type, year, amount from trade`)
    response.setHeader("Content-Type", "application/json");
    // Sends the rows of data back into the browser as a JSON object. 
    response.json(dbResult.rows);
}
async function onGetEggconsumption(request, response) {
    const dbResult = await db.query(`select year, kilograms, country from eggconsumption`)
    response.setHeader("Content-Type", "application/json");
    response.json(dbResult.rows);
}
async function onGetHowManyChickensEU(request, response) {
    const dbResult = await db.query(`select areaCode, country, year, value from howManyChickensEU`)
    response.setHeader("Content-Type", "application/json");
    response.json(dbResult.rows);
}