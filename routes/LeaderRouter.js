const Router = require('./Router');
const Team = require("../models/TeamModel");
const Employee = require("../models/EmployeeModel");
const { body } = require('express-validator');
const authManagement = require('../components/checkManagement');
const authEmployee = require('../components/checkEmployeeType');
const Token = require('../models/TokenModel');
const Phase = require('../models/PhaseModel');
const Task = require('../models/TaskModel');
const WorkGroup = require("../models/WorkGroupModel");

class LeaderRouter extends Router {
    

	get services() {
        return {'POST /createTeam': 'createTeam',
                'GET /members/available' : 'addMemberGET',
                'POST /members/add' : 'addMemberPOST',
                'POST /addTask' : 'addTask',
                'DELETE /editTask/:id' : 'deleteTask',
                'POST /editTask/:id' : 'editTask',
                'GET /members' : 'updateMembersGET',
                'DELETE /members/remove/:username' : 'removeMemberPOST',
                'DELETE /closeProject' : 'closeProject'
            };
	}

	async createTeam(req,res,next) {
	    console.log(req.body)
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

        let{name,phases,members} = req.body
        let header = req.headers['authorization'];
        let tokenValue = header && header.split(' ')[1];
        
        try {
            if(members.length < 4 || members.length > 6 ){
                res.json({
                    error : true,
                    message : "Forbidden number of members."
                })
                return;
            }
            let token = new Token(tokenValue);
            await token.populateFromDatabase();
            let employee = new Employee(token.username,null,null,null,null,null,null);
            await employee.populateFromDatabaseWithUsername();
            if(employee.teamID != null){
                res.json({
                    error : true,
                    message : "You already have a team."
                })
                return;
            }
            let team = new Team(name);
            let idTim = await team.insert();
            employee.teamID=idTim;
            await employee.updateTeam();
            for(let i = 0; i<phases.length ; i++){
                console.log(phases[i]);
                let phase = new Phase(phases[i],i+1,idTim);
                await phase.insert();
            }
            for(let i = 0; i<members.length ; i++){
                console.log(members[i]);
                let engineer = new Employee(members[i],null,null,null,null,null,null)
                engineer.teamID=idTim;
                await engineer.updateTeam();
            }
            res.json({
                error: false,
                message: "Team created.",
                teamId: idTim
            })
        } catch (err) {
            console.log(err)
            res.json({
                error: true,
                message: "Database error!"
            });
        }
    }
    
    async addMemberGET(req,res,next){
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
        try{
            let token = new Token(tokenValue);
            await token.populateFromDatabase();
            let employee = new Employee(token.username,null,null,null,null,null,null);
            await employee.populateFromDatabaseWithUsername();
            let engineers = await employee.findFreeEngineers();
            console.log(engineers);
            res.json({
                error : false,
                engineers : engineers
            })
        } catch (err) {
            res.json({error: true, message: "Database error!"});
        }
    }

    async addMemberPOST(req,res,next){
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
        try{
            let token = new Token(tokenValue);
            await token.populateFromDatabase();
            let leader = new Employee(token.username,null,null,null,null,null,null);
            await leader.populateFromDatabaseWithUsername();
            console.log(leader);
            let teamID = leader.teamID
            console.log(teamID);
            let employee = new Employee(req.body.username,null,null,null,null,null,null);
            await employee.populateFromDatabaseWithUsername();

            let teamMembers = await leader.findTeamEngineers();
            if(teamMembers.length >= 6){
                res.json({
                    error: true,
                    message: "Maximum number of team members is 7"
                })
                return;
            }

            if(employee.teamID == null){
                employee.teamID=teamID;
                await employee.updateTeam();
                res.json({
                    error: false,
                    message: "Engineer added to team!"
                })
            }else{
                res.json({
                    error: true,
                    message: "Engineer is already in a team!"
                })
            }

        } catch (err) {
            res.json({error: true, message: "Database error!"});
        }
    }

    async addTask(req,res,next){
	    console.log(req.body)
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
        let{name,description,priority,deadline} = req.body;
        let header = req.headers['authorization'];
        let tokenValue = header && header.split(' ')[1];
        try{
            let token = new Token(tokenValue);
            await token.populateFromDatabase();
            let leader = new Employee(token.username, null, null, null, null, null, null);
            await leader.populateFromDatabaseWithUsername();
            let teamID = leader.teamID
            console.log(teamID);
            let backlog = new Phase(null, 1, teamID);
            await backlog.getId();
            console.log(backlog.id);
            if (priority == null) priority = 4;
            let task;
            if (deadline == null) task = new Task(name, description, priority, null, backlog.id);
            else task = new Task(name, description, priority, new Date(deadline), backlog.id);
            task = await task.insert();
            if (task.problem === null)
                task.problems = []
            else
                task.problems = task.problem.split(";")
            res.json({error: false, message: "Task added", task: task});
        }
        catch(err){
            console.log(err)
            res.json({error : true ,message : "Database error!"});
        }
    }

    async deleteTask(req,res,next){
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
        try{
            let id = req.params.id;
            let task = new Task(null,null,null,null,null);
            task.id=id;
            await task.delete();
            res.json({error: false, message: "Task deleted!"});
        } catch (err) {
            res.json({error: true, message: "Database error!"});
        }

    }
    
    async editTask(req,res,next){
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
        let{name,description,deadline,priority} = req.body
        try{
            let id = req.params.id;
            let task = new Task(null,null,null,null,null);
            task.id=id;
            await task.populateWithId();
            if(name){ task.name = name}
            if(description){task.description=description}
            if(deadline){task.deadline=deadline}
            if(priority){task.priority=priority}
            await task.updateTask();
            res.json({error: false, message: "Task edited!"});
        } catch (err) {
            res.json({error: true, message: "Database error!"});
        }

    }

    async updateMembersGET(req,res,next){
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
        try{
            let token = new Token(tokenValue);
            await token.populateFromDatabase();
            let employee = new Employee(token.username,null,null,null,null,null,null);
            await employee.populateFromDatabaseWithUsername();
            let engineers = await employee.findFreeEngineers();
            let team = employee._teamID === null ? [] : await employee.findTeamEngineers();
            console.log(engineers);
            res.json({
                error : false,
                engineers : engineers,
                members : team
            })
        } catch (err) {
            res.json({error: true, message: "Database error!"});
        }
    }

    async removeMemberPOST(req,res,next){
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
        try{
            let token = new Token(tokenValue);
            await token.populateFromDatabase();
            let leader = new Employee(token.username,null,null,null,null,null,null);
            await leader.populateFromDatabaseWithUsername();
            console.log(leader);
            let teamID = leader.teamID
            console.log(teamID);
            let employee = new Employee(req.params.username,null,null,null,null,null,null);
            await employee.populateFromDatabaseWithUsername();

            let teamMembers =await employee.findTeamEngineers();
            console.log(teamMembers)
            if(teamMembers.length <= 4){
                res.json({
                    error: true,
                    message: "Minimum number of team members is 5"
                })
                return;
            }

            if(employee.teamID == teamID){
                employee.teamID=null;
                console.log(employee);
                await employee.removeFromTeam(employee.username);
                let task= new Task(null,null,null,null,null);
                task.worker=employee.username;
                await task.removeWorker();
                res.json({
                    error: false,
                    message: "Engineer removed from team!"
                })
            }else{
                res.json({
                    error: true,
                    message: "Engineer is not in your team!"
                })
            }

        } catch (err) {
            res.json({error: true, message: "Database error!"});
        }
    }

    async closeProject(req,res,next){
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
        try{
            let token = new Token(tokenValue);
            await token.populateFromDatabase();
            let leader = new Employee(token.username,null,null,null,null,null,null);
            await leader.populateFromDatabaseWithUsername();
            //console.log(leader);
            let teamID = leader.teamID;
            if(teamID ==null){
                res.json({
                    error : true,
                    message : "You don't have a team."
                })
                return;
            }
            let team = new Team(null);
            team.id=teamID;
            await team.populateFromDatabase()

            if(team.groupId!==null){
                team.groupId = null
                await team.updateTeamGroup()
            }

            await team.closeTeam();
            await leader.closeTeam();
            res.json({
                error: false,
                message: "Team closed"
            })
        } catch (err) {
            res.json({error: true, message: "Database error!"});
        }
    }

	get validation() {
        return [
            authManagement(['zaposlenik']),
            authEmployee(['voditelj']),
        ]
    }

}

module.exports = LeaderRouter;