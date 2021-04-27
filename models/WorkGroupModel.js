const Sequelize = require('sequelize')
const db = require('../db/index')

const WorkGroup = db.define('radnaskupina', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        field: 'idskupine',
        autoincrement: true
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'imeskupine'
    },
    coordinator: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'korisnickoimekordinatora'
    }
}, {timestamps: false, freezeTableName: true})


class WorkGroupModel {
    constructor(id, name, coordinator) {
        this._id = id
        this._name = name
        this._coordinator = coordinator
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

    get coordinator() {
        return this._coordinator;
    }

    set coordinator(value) {
        this._coordinator = value;
    }

    async insert() {
        db.options.omitNull = true
        await WorkGroup.create({
            id: this._id,
            name: this._name,
            coordinator: this._coordinator
        })
        db.options.omitNull = false
    }

    async populateFromDatabaseById() {
        let workGroup = await WorkGroup.findOne({
            where: {
                id: this._id
            }
        })
        this._name = workGroup.name
        this._coordinator = workGroup.coordinator
    }

    async populateFromDatabaseByCoordinator() {
        let workGroup = await WorkGroup.findOne({
            where: {
                coordinator: this._coordinator
            }
        })
        if(workGroup === null) return;
        this._id = workGroup.id
        this._name = workGroup.name
    }

}

module.exports = WorkGroupModel;
