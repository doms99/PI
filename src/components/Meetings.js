import React, {Component} from 'react';
import {Button, Card, Space, List, Avatar, Badge, Tooltip} from 'antd';
import {CheckOutlined, CloseOutlined} from '@ant-design/icons';
import moment from "moment";
import {connect} from "react-redux";
import axios from "axios";
import {BACKEND_URL} from "../constants";
import {removeRequest} from '../actions/updateUserDataAction'

class Meetings extends Component {
  respondToRequest = (response, id) => {
    axios.post(`${BACKEND_URL}/calendar/confirm/${id}`, {response},
      {
        headers: {
          'Authorization': 'Bearer ' + this.props.token,
          'Accept': 'application/json',
        }
      }).then(res => {
        if(res.data.error) {
          this.alert(res.data.message)
        } else {
          this.props.removeRequest(id)
        }
    })
  }

  getStatus = (status) => {
    switch(status) {
      case 'pending': return {status: 'processing', title: 'Confirmed'};
      case 'declined': return {status: 'error', title: 'Declined'};
      case 'confirmed': return {status: 'success', title: 'Confirmed'};
    }
  }

  render() {
    return (
      <>
        <h3 style={{textAlign: 'center'}}>Meeting requests</h3>
        {this.props.meetings.map(meeting => {
          const title = <span>{`Organizer: ${meeting.organizer.name} ${meeting.organizer.surname}`}</span>;
          const day = moment.utc(meeting.time);
          return (
            <Card key={meeting.id} type='inner' title={
              <div style={{display: 'flex', justifyContent: 'space-between'}}>
                <div>
                  <strong>{meeting.name}</strong><br/>
                  {day.format('dddd YYYY-MM-DD HH:mm')}
                </div>
                <Space>
                  <Button onClick={() => this.respondToRequest(true, meeting.id)}><CheckOutlined /></Button>
                  <Button onClick={() => this.respondToRequest(false, meeting.id)}><CloseOutlined /></Button>
                </Space>
              </div>
            }>
              {meeting.attendees.length === 0 ? (
                title
              ) : (
                <List
                  header={title}
                  bordered
                >
                  {meeting.attendees.map(at => {
                    const status = this.getStatus(at.status);
                     return <List.Item key={at.username}>
                      <List.Item.Meta
                        avatar={<Avatar>{at.username.substring(0, 1)}</Avatar>}
                        title={<Tooltip title={status.title}>
                          <Badge status={status.status} text={`${at.name} ${at.surname}`}/>
                        </Tooltip>}
                      />
                    </List.Item>
                  })}
                </List>
              )}
            </Card>
          )
        })}
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    token: state.user.token,
    meetings: state.user.meetings
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    removeRequest: (id) => dispatch(removeRequest(id))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Meetings);