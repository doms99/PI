const Sequelize = require('sequelize')
const db = require('../db/index')
const { Op } = require("sequelize");


const Meeting = db.define('sastanak', {
    id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        field: 'idsastanak',
        autoincrement: true
    },
    status: {
        type: Sequelize.STRING,
        allowNull: false,
        field: 'status'
    },
    time: {
        type: Sequelize.DATE,
        allowNull: false,
        field: 'datumivrijeme'
    },
    name: {
        type: Sequelize.STRING,
        allowNull: true,
        field: 'imesastanak'
    },
    organizer :{
        type: Sequelize.STRING,
        allowNull: false,
        field: 'korisnickoimepozivatelj'
    },
    attendee :{
        type: Sequelize.STRING,
        allowNull: false,
        field: 'korisnickoimepristupitelj'
    }
}, {timestamps: false, freezeTableName: true})

class MeetingModel {

    constructor(id,name,time,organizer,attendee) {
        this._name = name;
        this._time = time;
        this._organizer = organizer,
        this._attendee = attendee,
        this._id=id
    }
    set id(value){
        this._id=value
    }
    set attendee(value){
        this._attendee=value
    }
    get attendee(){
        return this._attendee
    }
    get organizer(){
        return this._organizer
    }
    get name(){
        return this._name
    }
    get time(){
        return this._time
    }

    async insert() {
        let meeting = await Meeting.create({
            id : this._id,
            name : this._name,
            status: "pending",
            time : this._time,
            organizer : this._organizer,
            attendee : this._attendee
        })
        return meeting;
    }

   

    async getAllMeetings(username) {
        return await Meeting.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('idsastanak')), 'id'],'time','organizer','name'],
            where: {
                [Op.or]: [
                    { organizer: username },
                    { attendee: username }
                  ],
                status: {[Op.ne]: 'canceled'}
            }
        })
    }

    async getAttendees(id){
        let attendees= await Meeting.findAll({
            attributes: ['attendee'],
            where: { id : id }
        })
        attendees = JSON.stringify(attendees, null, 2);
        attendees = JSON.parse(attendees)
        return attendees;
    }

    async getStatus(id,attendee){
        return await Meeting.findOne({
            attributes: ['status'],
            where: { id : id,attendee : attendee }
        })
        
    }

    async getPendingMeetings(username) {
        let d = new Date();
        d.setTime( d.getTime() - new Date().getTimezoneOffset()*60*1000 );
        console.log(d);
        return await Meeting.findAll({
            attributes: [[Sequelize.fn('DISTINCT', Sequelize.col('idsastanak')), 'id'],'time','organizer','name'],
            where: {
                time: {
                    [Op.gte]: d
                },
                attendee : username,
                status : "pending"
            }
        })
    }

    async confirm(){
        await Meeting.update(
                { 
                 status : "confirmed",
                },
                { where: { id: this._id,
                attendee: this._attendee} 
            })
    }

    async decline(){
        await Meeting.update(
          {
              status : "declined",
          },
          { where: { id: this._id,
                  attendee: this._attendee}
          })
    }

    async cancel(){
        await Meeting.update(
                { 
                 status : "canceled",
                },
                { where: { id: this._id, 
                organizer: this._organizer} 
            })
    }
    async getMaxId(){
        let maxId =await Meeting.findOne({
            attributes: [
                [Sequelize.fn('MAX', Sequelize.col('idsastanak')), 'max_id']
              ]
        })
        maxId=maxId.dataValues.max_id;
        maxId = maxId == null ? 0 : maxId;
        console.log(maxId);
        return maxId;
    }
    

}

module.exports = MeetingModel