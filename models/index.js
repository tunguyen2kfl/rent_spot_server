"use strict"

const fs = require("fs")
const { Sequelize } = require('sequelize');
const path = require("path")
const basename = path.basename(__filename)
require('dotenv').config();

const db = {}
const sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PASSWORD, {
    host: process.env.DB_HOST,
    dialect: 'mysql',
    logging: false,
});


try {
 sequelize.authenticate();
    console.log('Connection to the database has been established successfully.');
} catch (error) {
    console.error('Unable to connect to the database:', error);
}



sequelize
    .sync({
        alter: true,
        // force: true,
    })
    .then((data) => {
        console.log("DB is successfully synced.")
    })
    .catch((e) => {
        console.log("Error when syncing: ", e)
    })

fs.readdirSync(__dirname)
    .filter((file) => {
        return (
            file.indexOf(".") !== 0 && file !== basename && file.slice(-3) === ".js"
        )
    })
    .forEach((file) => {
        const model = require(path.join(__dirname, file))(
            // const model = require(path.join(process.cwd() + "/models", file))(
            sequelize,
            Sequelize.DataTypes
        )
        db[model.name] = model
    })

Object.keys(db).forEach((modelName) => {
    if (db[modelName].associate) {
        db[modelName].associate(db)
    }
})

module.exports = db