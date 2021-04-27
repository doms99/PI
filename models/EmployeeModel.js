const Sequelize = require('sequelize')
const db = require('../db/index')
const User = require("../models/UserModel");

const Employee = db.define('zaposlenik', {
    username: {
        type: Sequelize.STRING,
        allowNull: false,
        primaryKey: true,
        field: 'korisnickoime',
        references: {
            model: 'korisnik',
            key: 'korisnickoime'
        }
    },
    name: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'ime'
    },
    surname: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'prezime'
    },
    employeeType: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'vrstazaposlenika'
    },
    teamId: {
        type: Sequelize.INTEGER,
        field: 'idtim',
        allowNull: true,
    }
}, {timestamps: false, freezeTableName: true})

class EmployeeModel extends User {

    constructor(username, password, usertype, name, surname, employeeType, teamID) {
        super(username, password, usertype);
        this._username = username;
        this._name = name;
        this._surname = surname;
        this._employeeType = employeeType;
        this._teamID = teamID;
    }


    get username() {
        return this._username;
    }

    set username(value) {
        this._username = value;
    }

    get name() {
        return this._name;
    }

    set name(value) {
        this._name = value;
    }

    get surname() {
        return this._surname;
    }

    set surname(value) {
        this._surname = value;
    }

    get employeeType() {
        return this._employeeType;
    }

    set employeeType(value) {
        this._employeeType = value;
    }

    get teamID() {
        return this._teamID;
    }

    set teamID(value) {
        this._teamID = value;
    }

    async populateFromDatabase() {
        await super.populateFromDatabase()
        let employee = await Employee.findOne({
            where: {
                username: this._username
            }
        })
        this._employeeType = employee.employeeType
        this._name = employee.name
        this._surname = employee.surname
        this._teamID = employee.teamId
    }

    async populateRoleFromDatabase() {
        let employee = await Employee.findOne({
            where: {
                username: this._username
            }
        })
        this._employeeType = employee.employeeType
    }

    async populateFromDatabaseWithUsername() {
        let employee = await Employee.findOne({
            where: {
                username: this._username
            }
        })
        this._employeeType = employee.employeeType
        this._name = employee.name
        this._surname = employee.surname
        this._teamID = employee.teamId
    }


    async insert() {
        await Employee.create({
            username: this._username,
            name: this._name,
            surname: this._surname,
            employeeType: this._employeeType,
            teamId: this._teamID
        })
    }

    async updateTeam() {
        await Employee.update(
            {teamId: this._teamID},
            {where: {username: this._username}}
        )
    }

    async updateEmployeeType() {
        await Employee.update(
            {employeeType: this._employeeType},
            {where: {username: this._username}}
        )
    }

    async removeFromTeam(username) {
        let employee = await Employee.findOne({
            where: {
                username: username
            }
        })
        //console.log(employee);
        employee.teamId = null;
        console.log(employee);
        await employee.save(['teamId']);
    }

    async findFreeEngineers() {
        let employees = await Employee.findAll({
            attributes: ['username', 'name', 'surname'],
            where: {
                teamId: null,
                employeeType: 'inženjer'
            }
        })
        employees = JSON.stringify(employees, null, 2);
        employees = JSON.parse(employees)
        return employees;
    }

    async findFreeEmployees() {
        let employees = await Employee.findAll({
            where: {
                teamId: null,
                employeeType: ['voditelj', 'inženjer']
            }
        })
        employees = JSON.stringify(employees, null, 2);
        employees = JSON.parse(employees)
        return employees;
    }

    async findTeamEngineers() {
        let employees = await Employee.findAll({
            attributes: ['username', 'name', 'surname'],
            where: {
                teamId: this._teamID,
                employeeType: 'inženjer'
            }
        })
        employees = JSON.stringify(employees, null, 2);
        employees = JSON.parse(employees)
        return employees;
    }

    async closeTeam() {
        await Employee.update(
            {teamId: null},
            {where: {teamId: this._teamID}}
        )
    }

    async findTeamLeader() {
        let leader = await Employee.findOne({
            attributes: ['username', 'name', 'surname'],
            where: {
                teamId: this._teamID,
                employeeType: 'voditelj'
            }
        })
        leader = JSON.stringify(leader, null, 2);
        leader = JSON.parse(leader)
        return leader;
    }
}

module.exports = EmployeeModel