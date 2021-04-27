const Sequelize = require('sequelize')
const db = require('../db/index')

const Team = db.define('tim', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        field: 'idtim',
        autoincrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'imeprojekta'
    },
    status: {
        type: Sequelize.BOOLEAN,
        allowNull: false,
        field: 'status'
    },
    groupId: {
        type: Sequelize.INTEGER,
        allowNull: true,
        field: 'idskupine'
    }
}, {timestamps: false, freezeTableName: true})

class TeamModel {

    constructor(name) {
        this._name = name;
    }

    get id() {
        return this._id;
    }

    set id(value) {
        this._id = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get status() {
        return this._status;
    }

    set status(value) {
        this._status = value;
    }

    get groupId() {
        return this._groupId;
    }

    set groupId(value) {
        this._groupId = value;
    }

    async insert() {
        db.options.omitNull = true
        let tim = await Team.create({
            name : this._name,
            status: true,
            groupId : null
        })
        db.options.omitNull = false
        return tim.dataValues.id;
    }

    async countActive() {
        return await Team.count({
            where: {
                status: true
            }
        })
    }

    async getAllActive() {
        return await Team.findAll({
            where: {
                status: true
            }
        })
    }

    async populateFromDatabase() {
        let team = await Team.findOne({
            where: {
                id: this._id
            }
        })
        this._name = team.name
        this._status = team.status
        this._groupId = team.groupId
    }

    async getTeamsByGroupId() {
        return await Team.findAll({
            where: {
                groupId: this._groupId
            }
        })
    }

    async updateTeamGroup() {
        await Team.update(
            {groupId: this._groupId},
            {where: {id: this._id}}
        )
    }
    async closeTeam(){
        await Team.update(
            {status: false},
            {where: {id: this._id}}
        )
    }

}

module.exports = TeamModel