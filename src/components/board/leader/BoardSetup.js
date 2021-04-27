import React, {Component} from 'react';
import CreateBoard from "./CreateBoard";
import AddMembers from "./AddMembers";
import axios from "axios";
import {BACKEND_URL} from "../../../constants";
import {connect} from "react-redux";
import {addTeamId} from '../../../actions/updateUserDataAction'
import {Button, Divider} from "antd";

class BoardSetup extends Component {
  constructor(props) {
    super(props);
    this.state = {
      name: '',
      phases: [],
      members: [],
      addingMembers: false
    }

    if(props.user.teamId !== null) props.history.push('/board')
  }


  create = (data) => {
    this.setState({
      ...data,
      addingMembers: true
    })
  }

  addMember = (username) => {
    if(this.state.members.includes(username)) return;

    this.setState({
      members: [...this.state.members, username]
    })
  }

  finish = (members) => {
    if(members.length < 4 || members.length > 6) {
      alert("Team must consist of 4 to 6 engineers");
      return false;
    }
    const data = {
      ...this.state,
      members
    }
    axios.post(`${BACKEND_URL}/leader/createTeam`,
      data, {headers: {
          'Authorization': 'Bearer ' + this.props.user.token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then(async (res) => {
      if(res.data.error) {
        alert(res.data.message);
      } else {
        await this.props.addTeamId(res.data.teamId);
        this.props.history.push('/board')
      }
    })
    return true;
  }

  render() {
    return (
      <div style={{padding: '0 10px', display: 'flex', flexDirection: 'column', alignItems: 'center'}}>
        {!this.state.addingMembers ? <CreateBoard create={this.create}/> : <AddMembers finish={this.finish} addMemeber={this.addMember}/>}
      </div>
    )
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addTeamId: (teamId) => dispatch(addTeamId(teamId))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(BoardSetup);