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

//-- delete the existing tables

await db.query(`
        
        drop table if exists trade;
    `)
       //-- create trade-table
       
await db.query(`
    create table trade(
        country     varchar(128),
        type        varchar(20) check (type in ('Import','Export')),
        year        integer not null,
        amount      decimal(10,2)
    )
     `)
     // Check constraint to ensure that the column type only consists of import and export

    console.log('Created trade table')

   // Insert data into trade table
console.log('Inserting data in trade...');
await upload(
    db,
    'db/eu-import-export.csv',
    'copy trade (country, type, year, amount) from stdin with csv header'
);

console.log('Data inserted.');