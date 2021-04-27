const Sequelize = require('sequelize')
const db = require('../db/index')

const User = db.define('korisnik', {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        field: 'korisnickoime'
    },
    password: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'lozinka'
    },
    usertype: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'vrstakorisnika'
    }
}, {timestamps: false, freezeTableName: true})

class UserModel {

    constructor(username, password, usertype) {
        this._username = username;
        this._password = password;
        this._usertype = usertype;
    }

    get usertype() {
        return this._usertype;
    }

    set usertype(value) {
        this._usertype = value;
    }

    get username() {
        return this._username;
    }

    set username(value) {
        this._username = value;
    }

    get password() {
        return this._password;
    }

    async exists(){
        return await User.count({
            where: {
                username: this.username,
                password: this.password
            }
        }) > 0
    }

    async populateFromDatabase(){
        let user =  await User.findOne({
            attributes: ['username', 'usertype'],
            where: {
                username: this._username,
                password: this._password
            }
        })
        this._usertype = user.usertype
    }
    async populateRoleFromDatabase(){
        let user =  await User.findOne({
            attributes: ['username', 'usertype'],
            where: {
                username: this._username,
            }
        })
        this._usertype = user.usertype
    }

    async insert(){
        await User.create({
            username : this._username,
            password: this._password,
            usertype: 'zaposlenik'
        })
    }
    
}

module.exports = UserModel