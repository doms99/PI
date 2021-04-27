const Router = require('./Router');
const authManagement = require('../components/checkManagement');
const authEmployee = require('../components/checkEmployeeType');
const Employee = require("../models/EmployeeModel");
const Token = require("../models/TokenModel");
const Meeting = require("../models/MeetingModel");

class CalendarRouter extends Router {

    get services() {
        return {
            'POST /': 'addMeeting',
            'GET /' : 'allMeetings',
            'POST /confirm/:id' : 'confirmMeeting',
            'DELETE /:id' : 'cancelMeeting',
            'GET /pending' : 'pendingMeetings',
            'DELETE /confirm/:id' : 'declineMeeting'
        };
    }


    async addMeeting(req, res, next) {
        console.log(req.body)
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

        try{
            let token = new Token(tokenValue);
            await token.populateFromDatabase();

            let emp = new Employee(token.username, null, null, null, null, null, null);
            await emp.populateFromDatabaseWithUsername();

            if(emp.employeeType=='inzenjer'){
                    res.json({
                        error: true,
                        message: "You do not have permission for this."
                    })
                    return;
            }
            let {time,attendees,name} = req.body;
            let organizer = token.username;
            let d = new Date(time);
            console.log(d)
            let meeting = new Meeting(null,null,null,null,null);
            let id = await meeting.getMaxId();
            id = id+1;
            // d.setTime( d.getTime() - new Date().getTimezoneOffset()*60*1000 );
            for(let i=0;i<attendees.length; i++){
                //console.log(new Date(dateTime));
                meeting = new Meeting(id,name,d,organizer,attendees[i]);
                await meeting.insert();
            }
            for(let i=0;i<attendees.length; i++){
                let attendee = new Employee(attendees[i], null, null, null, null, null, null);
                await attendee.populateFromDatabaseWithUsername();
                attendees[i]={
                    name: attendee.name,
                    surname: attendee.surname,
                    username: attendee.username,
                    status : "pending"
                };
            }
            let exit={ 
                id : meeting.id,
                name : meeting.name,
                time : meeting.time,
                organizer : meeting.organizer,
                attendees : attendees
            }
            res.json({
                error: false,
                meetings : exit
            })
        }catch(error){
            console.log(error);
            res.json({
                error: true,
                message: "Failed to fetch data: Database error!"
            })
        }
    }

    async allMeetings(req, res, next) {
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

        try{
            let token = new Token(tokenValue);
            await token.populateFromDatabase();

            let m = new Meeting (null,null,null,null);
            let meetings = await m.getAllMeetings(token.username);
            for(let i=0;i<meetings.length; i++){
                let id = meetings[i].id;
                meetings[i].time = new Date(meetings[i].time);
                meetings[i].time.setTime(meetings[i].time.getTime() - new Date().getTimezoneOffset()*60*1000 );
                console.log(id);
                let attendeeList = await m.getAttendees(id);
                let attendees=[];
                for(let j=0; j < attendeeList.length ; j++){
                    let attendee = new Employee(attendeeList[j].attendee, null, null, null, null, null, null);
                    await attendee.populateFromDatabaseWithUsername();
                    let status = await m.getStatus(id,attendee.username);
                    console.log(status);
                    attendees[j]={
                        name: attendee.name,
                        surname: attendee.surname,
                        username: attendee.username,
                        status : status.status
                    };
                }
                console.log(attendees);
                meetings[i].dataValues.attendees=attendees;
                let organizer = new Employee(meetings[i].organizer, null, null, null, null, null, null);
                await organizer.populateFromDatabaseWithUsername();
                meetings[i].organizer={
                    name: organizer.name,
                    surname: organizer.surname,
                    username: organizer.username
                };
                
            }
            res.json({
                error: false,
                meetings : meetings
            })
        }catch(error){
            console.log(error);
            res.json({
                error: true,
                message: "Failed to fetch data: Database error!"
            })
        }
    }

    async confirmMeeting(req,res,next){
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
        let id = req.params.id;
        let value = req.body.response
        try{
            let token = new Token(tokenValue);
            await token.populateFromDatabase();

            let m = new Meeting (id,null,null,null,token.username);
            let msg;
            if(value) {
                await m.confirm();
                msg = "Meeting confirmed";
            } else {
                await m.decline();
                msg = "Meeting declined";
            }
            res.json({
                error: false,
                message : msg
            })
        }catch(error){
            console.log(error);
            res.json({
                error: true,
                message: "Failed to fetch data: Database error!"
            })
        }
    }

    async cancelMeeting(req,res,next){
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
        let id = req.params.id;
        try{
            let token = new Token(tokenValue);
            await token.populateFromDatabase();

            let m = new Meeting (id,null,null,token.username,null);
            await m.cancel();
            res.json({
                error: false,
                message : "Meeting canceled"
            })
        }catch(error){
            console.log(error);
            res.json({
                error: true,
                message: "Failed to fetch data: Database error!"
            })
        }
    }

    async pendingMeetings(req, res, next) {
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

        try{
            let token = new Token(tokenValue);
            await token.populateFromDatabase();

            let m = new Meeting (null,null,null,null);
            let meetings = await m.getPendingMeetings(token.username);
            for(let i=0;i<meetings.length; i++){
                let id = meetings[i].id;
                meetings[i].time = new Date(meetings[i].time);
                meetings[i].time.setTime(meetings[i].time.getTime() - new Date().getTimezoneOffset()*60*1000 );
                console.log(id);
                let attendeeList = await m.getAttendees(id);
                let attendees=[];
                for(let j=0; j < attendeeList.length ; j++){
                    let attendee = new Employee(attendeeList[j].attendee, null, null, null, null, null, null);
                    await attendee.populateFromDatabaseWithUsername();
                    let status = await m.getStatus(id,attendee.username);
                    console.log(status);
                    attendees[j]={
                        name: attendee.name,
                        surname: attendee.surname,
                        username: attendee.username,
                        status : status.status
                    };
                }
                console.log(attendees);
                meetings[i].dataValues.attendees=attendees;
                let organizer = new Employee(meetings[i].organizer, null, null, null, null, null, null);
                await organizer.populateFromDatabaseWithUsername();
                meetings[i].organizer={
                    name: organizer.name,
                    surname: organizer.surname,
                    username: organizer.username
                };
                
            }
            res.json({
                error: false,
                meetings : meetings
            })
        }catch(error){
            console.log(error);
            res.json({
                error: true,
                message: "Failed to fetch data: Database error!"
            })
        }
    }

    async declineMeeting(req,res,next){
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
        let id = req.params.id;
        try{
            let token = new Token(tokenValue);
            await token.populateFromDatabase();

            let m = new Meeting (id,null,null,null,token.username);
            await m.decline();
            res.json({
                error: false,
                message : "Meeting declined"
            })
        }catch(error){
            console.log(error);
            res.json({
                error: true,
                message: "Failed to fetch data: Database error!"
            })
        }
    }

    

    get validation() {
        return [
            authManagement(['zaposlenik']),
            authEmployee(['inženjer', 'voditelj','koordinator']),
        ]
    }


}
 
module.exports = CalendarRouter;