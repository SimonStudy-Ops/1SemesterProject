import pg from 'pg';
import dotenv from 'dotenv';
import { upload } from 'pg-upload';

// connecting to the database using the credentials from the .env file

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
// logging the current timestamp from the database and confirming the connection

const dbResult = await db.query('select now()');
console.log('Database connection established on', dbResult.rows[0].now);

//-- deleting the existing tables, to ensure that the new tables dont collide with the old ones

console.log('Dropping table if they already exist....')

await db.query(`
        
        drop table if exists trade;
        drop table if exists eggprice
    `)
       //-- create trade-table

await db.query(`
    create table trade(
        country     varchar(128),
        type        varchar(10) check (type in ('Import','Export')),
        year        integer not null,
        amount      decimal(10,2)
    )
     `)
     // Check constraint to ensure that the column type only consists of import and export

    console.log('Created trade table')

// create eggconsumption table
await db.query(`
    create table eggconsumption(
    year        integer not null,    
    kilograms   decimal(10,2),
    country     varchar(128)
)
    `)
  console.log('Created eggconsumption table')

// create eggprice table
await db.query(`
    create table eggprice(
        country     varchar(128),
        type        varchar(10) check (type in ('Import','Export')),
        year        integer not null,
        price      decimal(10,2)
    )
     `)

     console.log('Created eggprice table')

   // Insert data into trade table
console.log('Inserting data in trade...');
await upload(
    db,
    'db/eu-import-export.csv',
    'copy trade (country, type, year, amount) from stdin with csv header'
);

console.log('Data inserted.');

// insert data into eggprice table
console.log('Inserting data in eggprice...');
await upload(
    db,
    '',
    'copy trade (year, coun, year, price) from stdin with csv header'
);
//Log data was inserted
console.log('Data inserted.');