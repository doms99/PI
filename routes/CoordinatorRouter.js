const Router = require('./Router');
const Token = require('../models/TokenModel');
const WorkGroup = require("../models/WorkGroupModel");
const Employee = require("../models/EmployeeModel");
const Team = require("../models/TeamModel")
const Phase = require('../models/PhaseModel');
const Task = require('../models/TaskModel');
const authManagement = require('../components/checkManagement');
const authEmployee = require('../components/checkEmployeeType');

class CoordinatorRouter extends Router {

    get services() {
        return {
            'GET /viewWorkGroup': 'viewWorkGroup',
            'GET /teams': 'viewAvailableTeams',
            'POST /teams/add': 'addTeam',
            'DELETE /teams/remove/:id': 'removeTeam',
            'GET /board/:id': 'viewBoard'
        };
    }

    async viewWorkGroup(req, res, next) {
        console.log("viewWorkGroup")
        let validationResult = this.validationResult(req)

        if (!validationResult.isEmpty()) {
            let error = "Not coordinator";
            res.status(401).send(error)
            return;
        }

        let header = req.headers['authorization'];
        let tokenValue = header && header.split(' ')[1];

        try {
            let token = new Token(tokenValue);
            await token.populateFromDatabase();

            let coordinator = new Employee(token.username, null, 'zaposlenik', null, null, 'koordinator', null)
            await coordinator.populateRoleFromDatabase()

            let workGroup = new WorkGroup(null, null, coordinator.username)
            await workGroup.populateFromDatabaseByCoordinator()

            console.log(workGroup)

            let team = new Team(null)
            team.groupId = workGroup.id
            let teams = await team.getTeamsByGroupId()

            for(let i = 0 ; i < teams.length ; i++){
                console.log(teams[i].id);
                let leader =  new Employee(null, null, null, null, null, null, null);
                leader.teamID = teams[i].id;
                teams[i].dataValues.leader = await leader.findTeamLeader();
            }

            res.json({
                members: teams
            })


        } catch (err) {
            console.log(err)
            res.json({
                error: err.msg
            })
        }

    }

    async viewAvailableTeams(req, res, next) {
        let validationResult = this.validationResult(req)

        if (!validationResult.isEmpty()) {
            let error = "Not coordinator";
            res.status(401).send(error)
            return;
        }

        let header = req.headers['authorization'];
        let tokenValue = header && header.split(' ')[1];

        try {
            let token = new Token(tokenValue);
            await token.populateFromDatabase();

            let coordinator = new Employee(token.username, null, 'zaposlenik', null, null, 'koordinator', null)
            await coordinator.populateRoleFromDatabase()
            let workGroup = new WorkGroup(null, null, coordinator.username)
            await workGroup.populateFromDatabaseByCoordinator()

            let team = new Team(null)
            let teams = await team.getAllActive()
            let availableTeams = []
            let workgroup = []
            console.log(teams)

            for (let i = 0; i < teams.length; i++) {
                teams[i] = teams[i].dataValues
                if (teams[i].groupId === null) {
                    availableTeams.push(teams[i])
                }else if(teams[i].groupId === workGroup.id){
                    workgroup.push(teams[i])
                }
            }

            console.log(availableTeams)
            console.log(workgroup)

            res.json({
                teams: availableTeams,
                workgroup: workgroup
            })

        } catch (err) {
            console.log(err)
            res.json({
                error: err.msg
            })
        }
    }

    async addTeam(req, res, next) {
        let validationResult = this.validationResult(req)

        if (!validationResult.isEmpty()) {
            let error = "Not coordinator";
            res.status(401).send(error)
            return;
        }

        let header = req.headers['authorization'];
        let tokenValue = header && header.split(' ')[1];
        let {teamId} = req.body;

        console.log(teamId)

        try {
            let token = new Token(tokenValue);
            await token.populateFromDatabase();

            let coordinator = new Employee(token.username, null, 'zaposlenik', null, null, 'koordinator', null)
            await coordinator.populateRoleFromDatabase()

            let workGroup = new WorkGroup(null, null, coordinator.username)
            await workGroup.populateFromDatabaseByCoordinator()

            let team = new Team(null)
            team.id = teamId
            await team.populateFromDatabase()

            if (team.groupId != null) {
                let error = "Team already has a workgroup";
                res.status(400).message(error)
                return;
            }

            team.groupId = workGroup.id
            console.log(team.groupId, workGroup.id)
            await team.updateTeamGroup()

            res.json({
                message: "Successfully added"
            })

        } catch (err) {
            console.log(err)
            res.json({
                error: err.msg
            })
        }

    }

    async removeTeam(req, res, next) {
        console.log("removeTeam")
        let validationResult = this.validationResult(req)

        if (!validationResult.isEmpty()) {
            let error = "Not coordinator";
            res.status(401).send(error)
            return;
        }

        let header = req.headers['authorization'];
        let tokenValue = header && header.split(' ')[1];
        let teamId = req.params.id;

        try {
            let token = new Token(tokenValue);
            await token.populateFromDatabase();

            let coordinator = new Employee(token.username, null, 'zaposlenik', null, null, 'koordinator', null)
            await coordinator.populateRoleFromDatabase()

            let workGroup = new WorkGroup(null, null, coordinator.username)
            await workGroup.populateFromDatabaseByCoordinator()

            console.log(workGroup)

            let team = new Team(null)
            team.id = teamId
            await team.populateFromDatabase()

            if (team.groupId !== workGroup.id) {
                let error = "Team is not in your workgroup";
                res.status(400).send(error)
                return;
            }

            team.groupId = null
            await team.updateTeamGroup()

            res.json({
                message: "Successfully removed"
            })


        } catch (err) {
            console.log(err)
            res.json({
                error: err.msg
            })
        }
    }

    async viewBoard(req, res, next) {
        let validationResult = this.validationResult(req)

        if (!validationResult.isEmpty()) {
            let error = "Not a coordinator";
            res.status(401).send(error)
            return;
        }

        let header = req.headers['authorization'];
        let tokenValue = header && header.split(' ')[1];
        let teamId = req.params.id;
        console.log(teamId)


        try {
            let token = new Token(tokenValue);
            await token.populateFromDatabase();

            let coordinator = new Employee(token.username, null, 'zaposlenik', null, null, 'koordinator', null)
            await coordinator.populateRoleFromDatabase()

            let workGroup = new WorkGroup(null, null, coordinator.username)
            await workGroup.populateFromDatabaseByCoordinator()

            let team = new Team(null)
            team.id = teamId
            await team.populateFromDatabase()

            if (team.groupId !== workGroup.id) {
                let error = "Team is not in your workgroup";
                res.status(400).send(error)
                return;
            }

            let columns = [];
            let tasks = []
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
                teamName: team.name,
                teamId: team.id,
                columns: columns,
                tasks:tasks
            });

        } catch (err) {
            console.log(err)
            res.json({
                error: err.msg
            })
        }
    }

    get validation() {
        return [
            authManagement(['zaposlenik']),
            authEmployee(['koordinator'])
        ]
    }
}

module.exports = CoordinatorRouter;