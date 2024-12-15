import knex from 'knex';

const db = knex({
    client: 'pg',
    connection: {
        user: 'user',
        host: '64.52.80.190',
        database: 'czi_db',
        password: ':>F)P9G6qEfW*XjSee$XXukxUcXEPf',
        port: 5432,
    },
});

export default db;