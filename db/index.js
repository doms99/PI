const Sequelize = require('sequelize')
const {dbConst} = require('../constants')

const {user, host, database, password} = dbConst;

const db = new Sequelize('dc3aln8dabpvrh', 'duqecnnovxyknd', '99c533eea77e9f3c3552c3adac529bb693264aa4ec6464865579530b35b545e7', {
     host: 'ec2-54-228-250-82.eu-west-1.compute.amazonaws.com',
     dialect: 'postgres',
    protocol: 'postgres',
    dialectOptions:{
         ssl: {
             require: true,
             rejectUnauthorized: false
         }
    },
//
// const db = new Sequelize('progi', 'postgres', '1946', {
//   host: 'localhost',
//   dialect: 'postgres',

    pool: {
        max: 5,
        min: 0,
        acquire: 30000,
        idle: 10000
    }
});

db.authenticate()
    .then(() => console.log("Connected"))
    .catch(err => console.log(err))

module.exports = db