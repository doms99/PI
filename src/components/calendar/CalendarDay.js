import React, {Component} from 'react';
import {
  Button,
  Collapse,
  List,
  Avatar,
  Badge,
  TimePicker,
  DatePicker,
  AutoComplete,
  Space,
  Divider,
  Tooltip,
  Card, Input
} from "antd";
import {SaveOutlined, PlusCircleOutlined, CloseCircleOutlined, CloseOutlined} from '@ant-design/icons';
import moment from 'moment';
import {withRouter} from 'react-router-dom';
import axios from "axios";
import {BACKEND_URL} from "../../constants";
import {connect} from "react-redux";
import FormItemLabel from "antd/es/form/FormItemLabel";

const { Option } = AutoComplete;
const {Panel} = Collapse;

const initState = {
  time: null,
  attendees: [],
  searched: '',
  name: ''
}

class CalendarDay extends Component {
  constructor(props) {
    super(props);
    console.log(props)
  }
  state = {
    ...initState,
    date: this.props.date,
    employees: [],
    result: []
  }


  componentDidMount() {
    let path;
    if(this.props.user.employeeType === 'koordinator') path = '/coordinator/viewWorkGroup';
    else if(this.props.user.employeeType === 'voditelj') path = '/leader/members'
    else return;

    axios.get(`${BACKEND_URL}${path}`,
      {
        headers: {
          'Authorization': 'Bearer ' + this.props.user.token,
          'Accept': 'application/json',
        }
      }).then((res) => {
      console.log(res.data)
      if(res.data.error) {
        alert(res.data.message);
      } else {
        const employees = res.data.members.map(item => {
          console.log(item)
          let eng ;
          if(this.props.user.employeeType === 'koordinator') eng = item.leader;
          else eng = item;

          console.log(eng)

          return {
            ...item,
            option: `${eng.name} ${eng.surname} - ${eng.username}`
          }
        })
        this.setState({
          employees: employees,
          result: employees
        })
      }
    }).catch((error) => {
      console.error(error);
    })
  }

  handleSearch = (value) => {
    console.log('value', value)
    let res = this.state.employees.filter(emp => emp.option.includes(value))

    this.setState({result: res, searched: value});
  };

  add = async (value) => {
    const newAttendees = [...this.state.attendees, ...this.state.employees.filter(emp => emp.option === (value ? value : this.state.searched))];
    await this.setState({
      attendees: newAttendees,
      searched: '',
      result: this.state.employees.filter(eng => !newAttendees.includes(eng))
    })
    console.log(this.state)
  }

  remove = (username) => {
    const newAttendees = this.state.attendees.filter(eng => eng.username !== username);
    const newResult = [...this.state.result, ...this.state.employees.filter(eng => eng.username === username)]
    this.setState({
      attendees: newAttendees,
      result: newResult
    })
  }

  finish = () => {
    if(this.state.time === null || this.state.date === null) {
      alert("Time and date can't be null");
      return;
    } else if(this.state.attendees.length === 0) {
      alert("No attendees were added");
      return;
    } else if(this.state.name.trim() === '') {
      alert("Name can't be empty");
      return;
    }

    this.setState({
      ...initState,
      result: this.state.employees
    })
    this.props.finish(this.state.name.trim(), this.state.date.format('YYYY-MM-DD'), this.state.time.format('HH:mm'), this.state.attendees);
  }

  render() {
    return (
      <>
        <h3 style={{textAlign: 'center'}}>Day {this.props.date.format('YYYY-MM-DD')} {this.props.date.format('dddd')}</h3>
        <div style={{display: 'flex', justifyContent: 'space-between'}}>
          <Button onClick={this.props.back}>Back</Button>
          {!this.props.adding && (this.props.user.employeeType === 'koordinator' || this.props.user.employeeType === 'voditelj') && <Button onClick={this.props.add}>New meeting</Button>}
        </div>
        <Collapse>
          {this.props.meetings.map(meeting => {
            const dayMoment = moment.utc(meeting.time);
            const passed = dayMoment.isBefore(moment());
            return (
              <Panel header={
                <div style={{display: 'flex', justifyContent: 'space-between'}}>
                  <Space>
                    <Badge status={meeting.status} text={`${dayMoment.format('HH:mm')}${passed ? ' Passed' : ''}`}/>
                    <Divider type='vertical'/>
                    <span>{meeting.name}</span>
                  </Space>
                  {!passed && meeting.organizer.username === this.props.user.username && <Button onClick={() => this.props.cancelMeeting(meeting.id)}>Cancel</Button>}
                </div>
                } key={meeting.id}>
                <List itemLayout="horizontal" header={<strong>{`Organizer: ${meeting.organizer.username}`}</strong>}>
                  {meeting.attendees.map(at => {
                    return (
                      <List.Item key={at.username}>
                        <List.Item.Meta
                          avatar={<Avatar>{at.username.substr(0, 1)}</Avatar>}
                          title={
                            <Tooltip title={at.status}>
                              <Badge status={at.badgeStatus} text={`${at.name} ${at.surname}`}/>
                            </Tooltip>
                          }
                        />
                      </List.Item>
                    )
                  })}
                </List>
              </Panel>
            )
          })}
        </Collapse>
        {this.props.adding && (
          <Card title={
            <>
              <Input value={this.state.name}
                     addonBefore={<label>Meeting name:</label>}
                     onChange={(e) => this.setState({name: e.target.value})}
              />
              <br/>
              <br/>
              <DatePicker
                onChange={(date) => this.setState({date})}
                format={'YYYY-MM-DD'} allowClear={true}
                disabledDate={(date) => date.isBefore(moment().startOf('day'))}
                value={this.state.date}
              />
              <TimePicker value={this.state.time}
                          format={'HH:mm'} minuteStep={5}
                          onChange={(time) => this.setState({time})}
              />
            </>
          }>
            <span>Attendees:</span>
            <Divider type='horizontal'/>
            <List size='small' itemLayout="horizontal" >
              {this.state.attendees.map(at => {
                const nameObject = this.props.user.employeeType === 'koordinator' ? at.leader : at;
                console.log('nameObject', nameObject)
                return (
                  <List.Item>
                    <List.Item.Meta
                      avatar={<Avatar>{nameObject.username.substr(0, 1)}</Avatar>}
                      title={<>
                        <Space>
                          <span>{`${nameObject.name} ${nameObject.surname}`}</span>
                          <Button onClick={() => this.remove(nameObject.username)}><CloseOutlined/></Button>
                        </Space>
                      </>}
                    />
                  </List.Item>
                )
              })}
              <Space>
                <AutoComplete
                  style={{
                    width: 200,
                  }}
                  onChange={this.handleSearch}
                  onSelect={(value) => this.add(value)}
                  value={this.state.searched}
                >
                  {this.state.result.map(item => {
                    const eng = this.props.user.employeeType === 'koordinator' ? item.leader : item;
                    return <Option key={eng.username} value={item.option}>
                      {item.option}
                    </Option>;
                  })}
                </AutoComplete>
                <Button onClick={this.add}><PlusCircleOutlined /></Button>
              </Space>
              <Divider type='horizontal'/>
              <Space>
                <Button type='primary' onClick={this.finish}><SaveOutlined/></Button>
                <Button onClick={this.props.cancel}><CloseCircleOutlined /></Button>
              </Space>
            </List>
          </Card>
        )}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(withRouter(CalendarDay));