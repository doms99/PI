const Sequelize = require('sequelize')
const db = require('../db/index')

const Task = db.define('zadatak', {
    id: {
        type: Sequelize.INTEGER,
        autoincrement: true,
        primaryKey: true,
        field: 'idzadatka'
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'naziv'
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'opis'
    },
    priority: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'prioritet'
    },
    deadline: {
        type: Sequelize.DATE,
        field: 'rokzavrsetka',
        allowNull : true,
    },
    phaseId: {
        type: Sequelize.INTEGER,
        allowNull: false,
        field: 'idfaze'
    },
    worker: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'korisnickoimeinzenjera'
    },
    problem: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'problem'
    }
}, {timestamps: false, freezeTableName: true})

class TaskModel {

    constructor(name, description, priority, deadline, phaseId) {
        this._name = name;
        this._description = description;
        this._priority = priority;
        this._deadline = deadline;
        this._phaseId = phaseId;
    }

    get id() {
        return this._id;
    }
    get problem() {
        return this._problem;
    }
    set id(value){
        this._id = value;
    }
    set problem(value) {
        this._problem = value;
    }
    set name(value){
        this._name = value;
    }
    set description(value){
        this._description = value;
    }
    set priority(value){
        this._priority = value;
    }
    set deadline(value){
        this._deadline = value;
    }

    set phaseId(value) {
        this._phaseId = value;
    }

    get phaseId() {
        return this._phaseId;
    }
    get worker(){
        return this._worker;
    }
    set worker(value){
        this._worker=value;
    }

    async insert() {
        db.options.omitNull = true
        let task = await Task.create({
            name: this._name,
            description: this._description,
            priority: this._priority,
            deadline: this._deadline,
            phaseId: this._phaseId
        })
        db.options.omitNull = false
        return task.dataValues;
    }


    async getTasksByPhaseId() {
        return await Task.findAll({
            where: {
                phaseId: this._phaseId
            }
        })
    }
    async delete(){
        await Task.destroy({
            where: {
              id: this._id
            }
          });
    }
    async populateWithId(){
        let task =  await Task.findOne({
            where: {
                id:this._id
            }
        })
        this._name = task.name
        this._description = task.description
        this._priority = task.priority
        this._deadline = task.deadline
        this._phaseId = task.phaseId
        this._worker = task.worker
        this._problem = task.problem
    }
    
    async updateTask(){
        await Task.update(
            { name: this._name,
             description: this._description,
             priority : this._priority,
             deadline : this._deadline,
             phaseId : this._phaseId,
             worker : this._worker,
             problem : this._problem
            },
            { where: { id: this._id } }
          )
    }
    
    async removeWorker(){
        await Task.update(
            { 
             worker : null,
            },
            { where: { worker: this._worker } }
          )
    }


}

module.exports = TaskModel;