const Sequelize = require('sequelize')
const db = require('../db/index')

const Phase = db.define('faza', {
    id: {
        type: Sequelize.INTEGER,
        autoincrement: true,
        primaryKey: true,
        field: 'idfaze'
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'imefaze'
    },
    position: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'rednibrojfaze'
    },
    idTeam: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'idtim'
    }
}, {timestamps: false, freezeTableName: true})

class PhaseModel {

    constructor(name, position, idTeam) {
        this._name = name;
        this._position = position;
        this._idTeam = idTeam;
    }

    get id() {
        return this._id;
    }

    set id(value){
        this._id = value
    }

    get idTeam() {
        return this._idTeam;
    }

    set idTeam(value) {
        this._idTeam = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get position() {
        return this._position;
    }

    set position(value) {
        this._position = value;
    }

    async insert() {
        db.options.omitNull = true
        await Phase.create({
            name: this._name,
            position: this._position,
            idTeam: this._idTeam
        })
        db.options.omitNull = false
    }

    async getId() {
        let phase = await Phase.findOne({
            attributes: ['id'],
            where: {
                position: this._position,
                idTeam: this._idTeam
            }
        })
        this._id = phase.id;
    }

    async getPhasesByIdTeam() {
        return await Phase.findAll({
            where: {
                idTeam: this._idTeam
            }
        })
    }

    async populateFromDatabaseWithId(){
        let phase = await Phase.findOne({
            where:{
                id: this._id
            }
        })
        this._name = phase.name
        this._idTeam = phase.idTeam
        this._position = phase.position
    }


}

module.exports = PhaseModel;