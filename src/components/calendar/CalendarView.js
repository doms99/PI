import React, {Component} from 'react';
import {Calendar, Badge, Button} from 'antd';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import moment from 'moment';
import './Calendar.css';
import {BACKEND_URL} from "../../constants";
import CalendarDay from "./CalendarDay";
import {connect} from "react-redux";

const data = [

  {
    id: 1, //meeting id bi mogo bit ime jer vidim da nemamo imena u bazi
    time: "2021-01-10 16:30",
    name: 'ne vazan',
    organizer: {
      username: "voditelj2",
      name: "Luka",
      surname: "Mirtic"
    },
    attendees: [{
      username: 'inzenjer',
      name: 'Luka',
      surname: 'Kulic',
      status: 'confirmed'
    }, {
      username: 'inzenjer3',
      name: 'Milka',
      surname: 'Mikic',
      status: 'pending'
    }]
  },
  {
    id: 2, //meeting id bi mogo bit ime jer vidim da nemamo imena u bazi
    time: "2021-01-03 15:30",
    name: 'Vazan',
    organizer: {
      username: "voditelj",
      name: "Miha",
      surname: "Mihic"
    },
    attendees: [{
      username: 'inzenjer4',
      name: 'Petar',
      surname: 'Milic',
      status: 'rejected'
    }, {
      username: 'inzenjer5',
      name: 'Iva',
      surname: 'Milic',
      status: 'rejected'
    }]
  },
  {
    id: 3, //meeting id bi mogo bit ime jer vidim da nemamo imena u bazi
    time: "2021-01-12 15:30",
    name: 'jos manje vazan',
    organizer: {
      username: "voditelj2",
      name: "Luka",
      surname: "Mirtic"
    },
    attendees: [{
      username: 'inzenjer2',
      name: 'Iva',
      surname: 'Milic',
      status: 'pending'
    }, {
      username: 'inzenjer3',
      name: 'Petar',
      surname: 'Milic',
      status: 'pending'
    }]
  },{
    id: 4, //meeting id bi mogo bit ime jer vidim da nemamo imena u bazi
    time: "2021-01-03 15:30",
    name: 'Vazan',
    organizer: {
      username: "voditelj",
      name: "Miha",
      surname: "Mihic"
    },
    attendees: [{
      username: 'inzenjer4',
      name: 'Petar',
      surname: 'Milic',
      status: 'rejected'
    }, {
      username: 'inzenjer5',
      name: 'Iva',
      surname: 'Milic',
      status: 'rejected'
    }]
  },
];

class CalendarView extends Component {
  state = {
    meetings: [],
    dayView: null,
    adding: false
  }

  formatData = (meeting) => {
    let allRejected = true;
    let allConfirmed = true;

    const newAttendees = meeting.attendees.map(a => {
      if(a.status !== 'declined') allRejected = false;
      if(a.status !== 'confirmed') allConfirmed = false;

      let badgeStatus;
      if(a.status === 'declined') badgeStatus = 'error';
      else if(a.status === 'confirmed') badgeStatus = 'success'
      else badgeStatus = 'processing'

      return {
        ...a,
        badgeStatus
      }
    })

    let status;
    if(allRejected) status = 'error';
    else if(allConfirmed) status = 'success'
    else status = 'processing'

    return {
      ...meeting,
      status,
      attendees: newAttendees
    }
  }

  componentDidMount() {
    axios.get(`${BACKEND_URL}/calendar`,
      {
        headers: {
          'Authorization': 'Bearer ' + this.props.user.token,
          'Accept': 'application/json',
        }
      })
      .then((res) => {
        console.log(res.data)
        if(res.data.error) {
          alert(res.data.message);
        } else {
          this.setState({
            meetings: this.sortMeetings(res.data.meetings.map(meeting => this.formatData(meeting)))
          })
        }
      })
      .catch((error) => {
        console.error(error);
      })
  }

  sortMeetings = (meetings) => {
    return meetings.sort((a, b) => moment(a.time, 'YYYY-MM-DD HH:mm').isBefore(moment(b.time, 'YYYY-MM-DD HH:mm')) ? -1
      :
      (moment(a.time, 'YYYY-MM-DD HH:mm').isSame(moment(b.time, 'YYYY-MM-DD HH:mm')) ? 0 : 1))
  }

  getListData = (value) => {

    return this.state.meetings.filter(meeting => moment(meeting.time).isSame(value, 'day'));
  }

  dateCellRender = (value) => {
    const listData = this.getListData(value);
    return (
      <ul className="events">
        {listData.map(item => (
          <li key={item.id}>
            <Badge status={item.status} text={item.name}/>
          </li>
        ))}
      </ul>
    );
  }

  createMeeting = (name, date, time, attendees) => {
    console.log(name, date, time, attendees)
    const meetingMoment = moment.utc(`${date} ${time}`)
    console.log(meetingMoment.utcOffset(+1).utc().format())
    axios.post(`${BACKEND_URL}/calendar`,
      {
        name,
        time: meetingMoment.format(),
        attendees: attendees.map(at => this.props.user.employeeType === 'koordinator' ? at.leader.username : at.username)
      },
      {
        headers: {
          'Authorization': 'Bearer ' + this.props.user.token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        console.log(res.data)
        if(res.data.error) {
          alert(res.data.message);
        } else {
          this.setState({
            meetings: this.sortMeetings([...this.state.meetings, this.formatData({
              ...res.data.meetings,
              organizer: {
                name: this.props.user.name,
                surname: this.props.user.surname,
                username: this.props.user.username,
              }
            })])
          })
        }
      })

    this.cancel();
  }

  cancel = () => {
    this.setState({
      adding: false
    })
  }

  cancelMeeting = (id) => {
    console.log(id)
    axios.delete(`${BACKEND_URL}/calendar/${id}`,
      {
        headers: {
          'Authorization': 'Bearer ' + this.props.user.token,
          'Accept': 'application/json',
        }
      }).then(res => {
      if(res.data.error) {
        alert(res.data.message);
      } else {
        this.setState({
          meetings: this.state.meetings.filter(meeting => meeting.id !== id)
        })
      }
    }).catch(err => console.log(err))
  }

  render() {
    return (
      this.state.dayView === null ? (
        <Calendar dateCellRender={this.dateCellRender} onSelect={(value) => this.setState({dayView: value})}/>
      ) : (
        <CalendarDay meetings={this.getListData(this.state.dayView)}
                     cancelMeeting={this.cancelMeeting}
                     date={this.state.dayView}
                     back={() => this.setState({dayView: null, adding: false})}
                     add={() => this.setState({adding: true})}
                     adding={this.state.adding}
                     finish={this.createMeeting}
                     cancel={this.cancel}
        />
      )
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(withRouter(CalendarView));

