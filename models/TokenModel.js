const Sequelize = require('sequelize')
const db = require('../db/index')

const Token = db.define('token', {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        field: 'korisnickoime'
    },
    token: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'token'
    },
    createdAt: {
        type: Sequelize.DATE,
        field: 'trenutak_stvaranja'
    }
}, { timestamps: false, freezeTableName: true })

class TokenModel {

    constructor(token) {
        this._token = token;
    }
    

    get token() {
        return this._token;
    }

    set token(value) {
        this._token = value;
    }
    get createdAt(){
        return this._createdAt;
    }
    get username(){
        return this._username;
    }
    set username(value){
        this._username = value;
    }

    async exists(){
        return await Token.count({
            where: {
                token: this.token
            }
        }) > 0
    }
    async existsUsername(){
        return await Token.count({
            where: {
                username: this.username
            }
        }) > 0
    }

    async populateFromDatabase(){
        let token =  await Token.findOne({
            attributes: ['token','username','createdAt'],
            where: {
                token: this._token
            }
        })
        this._username = token.username
        this._createdAt = token.createdAt;
    }

    async insert(){
        await Token.create({
            username : this._username,
            token: this._token,
            createdAt : Date.now()
        })
    }
    async delete(){
        await Token.destroy({
            where: {
              token: this.token
            }
          });
    }
    async populateWithUsername(){
        let token =  await Token.findOne({
            attributes: ['token','username','createdAt'],
            where: {
                username: this._username
            }
        })
        this._token = token.token;
        this._createdAt = token.createdAt;
    }
}
module.exports = TokenModel;