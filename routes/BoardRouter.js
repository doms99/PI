const Router = require('./Router');
const Employee = require("../models/EmployeeModel");
const Token = require("../models/TokenModel");
const User = require("../models/UserModel");
const Team = require("../models/TeamModel");
const Phase = require("../models/PhaseModel");
const Task = require("../models/TaskModel");
const {body} = require('express-validator');
const authManagement = require('../components/checkManagement');
const authEmployee = require('../components/checkEmployeeType');
const express = require('express');
const app = express();


class BoardRouter extends Router {

    get services() {
        return {
            'GET /': 'showBoard',
            'POST /edit/:id/problem': 'addProblem',
            'POST /edit/:id/phase' : 'movePhase',
            'POST /edit/:id/worker' : 'takeTask'
        };
    }

    async showBoard(req, res, next) {
        let validationResult = this.validationResult(req)

        if (!validationResult.isEmpty()) {
            let error = '';
            validationResult.array().forEach(err => {
                error += err.msg + '\n'
            })
            console.log(error)
            res.json({error: error})
            return;
        }

        let header = req.headers['authorization'];
        let tokenValue = header && header.split(' ')[1];

        try {
            let token = new Token(tokenValue);
            await token.populateFromDatabase();

            let user = new User(token.username, null, null);
            await user.populateRoleFromDatabase();

            if (user.usertype == 'zaposlenik') {
                let emp = new Employee(token.username, null, null, null, null, null, null);
                await emp.populateFromDatabaseWithUsername();

                if(emp.teamID==null){
                    res.json({
                        error: true,
                        message: "You do not have a team."
                    })
                    return;
                }

                let columns = [];
                let tasks = []
                let team = new Team();
                team.id = emp.teamID;
                await team.populateFromDatabase();
                let phase = new Phase(null, null, team.id);
                let phases = await phase.getPhasesByIdTeam();

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
                        }else
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
                    columns: columns,
                    tasks:tasks
                });

            } else {
                res.status(401).send("Unauthorized!");
            }
            next();

        } catch (error) {
            console.log(error);
            res.json({
                error: true,
                message: "Failed to fetch data: Database error!"
            })
        }
    }

    async addProblem(req, res, next) {
        let validationResult = this.validationResult(req)

        if (!validationResult.isEmpty()) {
            let error = '';
            validationResult.array().forEach(err => {
                error += err.msg + '\n'
            })
            console.log(error)
            res.json({error: error})
            return;
        }

        try {
            let task = new Task(null, null, null, null, null)
            task.id = req.params.id;
            await task.populateWithId()
            if (task.problem == null) {
                task.problem = req.body.description;
            } else {
                task.problem = task.problem + ";" + req.body.description;
            }
            // console.log(task);
            await task.updateTask();
            res.json({
                error: false,
                message: "Successfully added a problem"
            });
        } catch (e) {
            res.json({
                error: true,
                message: "Couldn't add a problem"
            });
        }
    }

    async movePhase(req, res, next){
        let validationResult = this.validationResult(req)
        if(!validationResult.isEmpty()) {
            let error = '';
            validationResult.array().forEach(err => {
                error += err.msg + '\n'
            })
            console.log(error)
            res.json({ error: error })
            return;
        }

        let header = req.headers['authorization'];
        let tokenValue = header && header.split(' ')[1];

        try {
            let token = new Token(tokenValue)
            await token.populateFromDatabase()
            let employee = new Employee(token.username)
            await employee.populateFromDatabaseWithUsername()
            console.log(employee)

            let task = new Task(null, null, null, null, null)
            task.id = req.params.id;
            await task.populateWithId()
            console.log(task)

            let phaseBefore = new Phase()
            phaseBefore.id = task.phaseId
            await phaseBefore.populateFromDatabaseWithId()

            let phaseAfter = new Phase()
            phaseAfter.id = req.body.phaseId
            await phaseAfter.populateFromDatabaseWithId()

            if(phaseBefore.idTeam !== employee.teamID || phaseAfter.idTeam !== employee.teamID){
                res.json({
                    error: true,
                    message: "Not your team"
                })
                return;
            }

            task.phaseId = req.body.phaseId
            await task.updateTask()

            res.json({
                error: false,
                message: "Successfully changed phase"
            });
        } catch (e) {
            res.json({
                error: true,
                message: "Couldn't change phase"
            });
        }

    }

    async takeTask(req,res,next){
        let validationResult = this.validationResult(req)
        if(!validationResult.isEmpty()) {
            let error = '';
            validationResult.array().forEach(err => {
                error += err.msg + '\n'
            })
            console.log(error)
            res.json({ error: error })
            return;
        }

        let header = req.headers['authorization'];
        let tokenValue = header && header.split(' ')[1];
        try {
            let token = new Token(tokenValue)
            await token.populateFromDatabase()
            let employee = new Employee(token.username)
            await employee.populateFromDatabaseWithUsername()
            console.log(employee)

            let task = new Task(null, null, null, null, null)
            task.id = req.params.id;
            await task.populateWithId()
            console.log(task)

            let phaseBefore = new Phase()
            phaseBefore.id = task.phaseId
            await phaseBefore.populateFromDatabaseWithId()

            let phaseAfter = new Phase()
            phaseAfter.id = req.body.phaseId
            await phaseAfter.populateFromDatabaseWithId()

            if(phaseBefore.idTeam !== employee.teamID || phaseAfter.idTeam !== employee.teamID){
                res.json({
                    error: true,
                    message: "Not your team"
                })
                return;
            }

            task.worker=employee.username;
            await task.updateTask()

            res.json({
                error: false,
                message: "Successfully assigned task"
            });
        } catch (e) {
            console.log(e)
            res.json({
                error: true,
                message: "Couldn't assign task"
            });
        }


    }

    get validation() {
        return [
            authManagement(['zaposlenik']),
            authEmployee(['inženjer', 'voditelj']),
        ]
    }

}

module.exports = BoardRouter;