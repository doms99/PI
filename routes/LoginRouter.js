const Router = require('./Router');
const User = require("../models/UserModel");
const Employee = require("../models/EmployeeModel");
const Token = require("../models/TokenModel");
const crypto = require('crypto');
const Meeting = require("../models/MeetingModel");

class LoginRouter extends Router {

	get services() {
		return {'POST /': 'login'};
	}

	async login(req,res,next) {
		let { username, password } = req.body;
	    try {
	        console.log("try")
	        let user = new User(username, password, null)
	        let userExists = await user.exists()
          console.log('user exists', userExists)

            if(userExists) {
                console.log("KORISNIK POSTOJI");
                await user.populateFromDatabase()
                if(user.usertype=='zaposlenik'){
                    var employee = new Employee(username, password, user.usertype ,null,null,null,null)
                    await employee.populateFromDatabase()
                }
                
                //console.log(user)
                let token = new Token(null);
                token.username=user.username;
                console.log(token);
                let tokenExists = await token.existsUsername();
                if(tokenExists){
                    console.log("TOKEN POSTOJI");
                    await token.populateWithUsername();
                    await token.delete();
                }
                let tokenValue = crypto.randomBytes(64).toString('hex');
                let newToken = new Token(tokenValue);
                newToken.username=user.username;
                await newToken.insert();
                if(user.usertype=='zaposlenik'){
                    let m = new Meeting (null,null,null,null);
                    let meetings = await m.getPendingMeetings(user.username);
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
                        name:  employee.name,
                        surname: employee.surname,
                        usertype: user.usertype,
                        employeeType: employee.employeeType,
                        token: newToken.token,
                        teamId: employee.teamID,
                        meetings: meetings
                    })
                }else{
                    res.json({
                        name:  'uprava',
                        usertype: user.usertype,
                        token: newToken.token
                    })
                }
            } else {
                console.log("else")
                res.json({
                    error: true,
                    message: "Incorrect username or password"
                })
            }
        } catch(err) {
            console.log("catch")
            console.log(err)
	        res.json({
                error: true,
              message: err.msg
            })
        }
	}
}

module.exports = LoginRouter;