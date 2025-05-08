import pg from 'pg';
import dotenv from 'dotenv';
import { upload } from 'pg-upload';

dotenv.config();
console.log('Connecting to database', process.env.PG_DATABASE);
const db = new pg.Pool({
    host:     process.env.PG_HOST,
    port:     parseInt(process.env.PG_PORT),
    database: process.env.PG_DATABASE,
    user:     process.env.PG_USER,
    password: process.env.PG_PASSWORD,
    ssl:      { rejectUnauthorized: false },
});
const dbResult = await db.query('select now()');
console.log('Database connection established on', dbResult.rows[0].now);

console.log('Dropping table if they already exist....')
//-- Slet eksisterende tabeller, hvis de findes
await db.query(`
        
        drop table if exists import;
        drop table if exists export;
        
    `)
       //-- create import-table
await db.query(`
    create table import(
        year integer not null,
        country varchar(128),
        amount decimal(10,2),
    )
    `)
    console.log('Created import table')

         //-- create export-table
await db.query(`
    create table export(
        year integer not null,
        country varchar(128),
        amount decimal(10,2),
    )
    `)
    console.log('Created export table')