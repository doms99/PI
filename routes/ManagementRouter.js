const Router = require('./Router');
const User = require("../models/UserModel");
const Employee = require("../models/EmployeeModel");
const Team = require("../models/TeamModel")
const Phase = require('../models/PhaseModel');
const Task = require('../models/TaskModel');
const WorkGroup = require("../models/WorkGroupModel");
const authManagement = require('../components/checkManagement');

class ManagementRouter extends Router {

    get services() {
        return {
            'GET /promo': 'promoGET',
            'POST /promo': 'promoPOST',
            'POST /register': 'register',
            'GET /teams': 'getTeams',
            'GET /board/:id': 'getTeamBoard'
        };
    }

    async promoGET(req, res, next) {
        let validationResult = this.validationResult(req)

        if (!validationResult.isEmpty()) {
            let error = "Not management";
            res.status(401).send(error)
            return;
        }

        try {
            let employee = new Employee(null)
            let user = await employee.findFreeEmployees()
            console.log(user)

            res.json({
                users: user
            })

        } catch (err) {
            console.log(err)
            res.json({
                error: true, message: err.msg
            })
        }
    }

    async promoPOST(req, res, next) {
        let validationResult = this.validationResult(req)

        if (!validationResult.isEmpty()) {
            let error = "Not management";
            res.status(401).send(error)
            return;
        }

        let {username} = req.body;

        try {
            let user = new User(username, null, null)

            await user.populateRoleFromDatabase()

            if (user.usertype === 'uprava') {
                res.json({
                    error: true,
                    message: "User can't be promoted"
                })
                return
            }

            var employee = new Employee(username, null, user.usertype, null, null, null, null)
            await employee.populateFromDatabaseWithUsername()

            if (employee.teamID != null) {
                res.json({
                    error: true,
                    message: "User can't be promoted"
                })
                return
            } else if (employee.employeeType === 'voditelj') {
                employee.employeeType = 'koordinator'
                let workGroup = new WorkGroup(null, employee.name + "'s workgroup", employee.username)
                await employee.updateEmployeeType()
                await workGroup.insert()
            } else if (employee.employeeType === 'inženjer') {
                employee.employeeType = 'voditelj'
                await employee.updateEmployeeType()
            } else {
                res.json({
                    error: true, message: "User can't be promoted"
                })
                return
            }

            res.json({
                error: false,
                message: "Promotion successful",
                employeeType: employee.employeeType
            })

        } catch (err) {
            console.log(err)
            res.json({
                error: true,
                message: err.msg
            })
        }
    }

    async register(req, res, next) {
        let validationResult = this.validationResult(req)
        let validationResult2 = this.registerValidation(req);

        let error = '';
        validationResult2.forEach(msg => {
            if (msg !== '') {
                error += msg + '\n'
            }
        })
        if (error !== '') {
            res.json({error: error})
            return;
        }

        if (!validationResult.isEmpty()) {
            error += 'Not management\n'
            res.status(401).send(error)
            return;
        }

        let {username, password, name, surname, employeeType} = req.body
        try {
            let user = new User(username, password)
            let userExists = await user.exists()

            console.log('userExists:', userExists)

            if (!userExists) {

                await user.insert()
                let employee = new Employee(user.username, user.password, user.usertype, name, surname, employeeType)
                await employee.insert()

                if (employeeType === 'koordinator') {
                    let workGroup = new WorkGroup(null, name + "'s work group", user.username)
                    await workGroup.insert()
                }

                res.json({
                    name: employee.name,
                    surname: employee.surname,
                    employeeType: employee.employeeType
                })
            } else {
                res.json({error: 'That username already exists'})
            }
        } catch (err) {
            console.log('\n', err)
            res.json({error: err.msg})
        }

    }

    async getTeams(req, res, next) {
        let validationResult = this.validationResult(req)

        if (!validationResult.isEmpty()) {
            let error = "Not management";
            res.status(401).send(error)
            return;
        }

        try {
            let team = new Team(null)
            let number = await team.countActive();
            let teams = await team.getAllActive();

            for (let i = 0; i < number; i++) {
                teams[i] = teams[i].dataValues
                if (teams[i].groupId !== null) {
                    let workgroup = new WorkGroup(teams[i].groupId)
                    await workgroup.populateFromDatabaseById()
                    teams[i].groupName = workgroup.name
                }else
                    teams[i].groupName = null
            }
            res.json({
                teams: teams
            })
            console.log(teams)

        } catch (err) {
            console.log(err)
            res.json({
                error: err.msg
            })
        }
    }

    async getTeamBoard(req, res, next) {
        console.log("am here")
        let validationResult = this.validationResult(req)

        if (!validationResult.isEmpty()) {
            let error = "Not management";
            res.status(401).send(error)
            return;
        }

        let teamId = req.params.id;
        console.log(teamId)

        try {
            let columns = [];
            let tasks = []
            let team = new Team(null)
            team.id = teamId
            await team.populateFromDatabase()
            let phase = new Phase(null, null, team.id)
            let phases = await phase.getPhasesByIdTeam()

            for (let i = 0; i < phases.length; i++) {
                phases[i] = phases[i].dataValues;
                let task = new Task(null, null, null, null, phases[i].id)
                phases[i].tasks = await task.getTasksByPhaseId()
                phases[i].taskIds = []

                for (let j = 0; j < phases[i].tasks.length; j++) {
                    phases[i].tasks[j] = phases[i].tasks[j].dataValues;
                    phases[i].taskIds.push(phases[i].tasks[j].id)
                    if (phases[i].tasks[j].problem != null) {
                        phases[i].tasks[j].problems = phases[i].tasks[j].problem.split(";");
                        console.log(phases[i].tasks[j].problems)
                        console.log(phases[i].tasks[j])
                    } else
                        phases[i].tasks[j].problems = []

                    tasks.push(phases[i].tasks[j])
                }
                columns.push({
                    id: phases[i].id,
                    name: phases[i].name,
                    position: phases[i].position,
                    taskIds: phases[i].taskIds
                });
            }

            res.json({
                teamName: team.name,
                teamId: team.id,
                columns: columns,
                tasks: tasks
            });


        } catch (err) {
            console.log(err)
            res.json({
                error: err.msg
            })
        }
    }


    registerValidation(req) {
        let message1 = req.body.username.length < 5 ? 'Username must be at least 5 characters long' : ''
        let message2 = req.body.password.length < 8 ? 'Password must be at least 8 symbols long' : ''
        let message3 = req.body.name.length < 1 ? 'Name can\'t be empty' : ''
        let message4 = req.body.surname.length < 1 ? 'Surname can\'t be empty' : ''

        return [message1, message2, message3, message4]
    }

    get validation() {
        return [
            authManagement(['uprava'])
        ]
    }
}


module.exports = ManagementRouter;