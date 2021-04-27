import {UPDATE_USER_DATA, LOGOUT, ADD_TEAM_ID, UNCONFIRMED_MEETINGS, REMOVE_REQUEST} from "./types";
import axios from "axios";
import {BACKEND_URL} from "../constants";

export const updateUserData = userData => dispatch => {
  dispatch({
    type: UPDATE_USER_DATA,
    payload: userData
  });
}

export const logout = () => dispatch => {
  stopMeetingUpdate();
  dispatch({
    type: LOGOUT
  })
}

export const addTeamId = (teamId) => dispatch => {
  console.log('add team id');
  dispatch({
    type: ADD_TEAM_ID,
    payload: teamId
  })
}
export const removeRequest = (id) => dispatch => {
  console.log('add team id');
  dispatch({
    type: REMOVE_REQUEST,
    payload: id
  })
}


let interval = null;

export const updateUnconfirmedMeetings = (token) => {
  console.log('interval', interval)
  return (dispatch) => {
    if(interval == null) {
      console.log('interval start')
      interval = setInterval(() => {
        axios.get(`${BACKEND_URL}/calendar/pending`,
          {
            headers: {
              'Authorization': 'Bearer ' + token,
              'Accept': 'application/json'
            }
          }).then(res => {
          console.log("pending meetings", res)
          if(!res.data.error) {
            dispatch({
              type: UNCONFIRMED_MEETINGS,
              payload: res.data.meetings
            })
          }
        }).catch(err => {
          console.log('Sync error', err);
        })
      }, 60000)
    }
  }
}

export const stopMeetingUpdate = () => {
  console.log('interval clear', interval)
  clearInterval(interval);
  interval = null;
  console.log(interval)
}

