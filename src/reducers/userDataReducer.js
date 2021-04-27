import {ADD_TEAM_ID, LOGOUT, UPDATE_USER_DATA, UNCONFIRMED_MEETINGS, REMOVE_REQUEST} from "../actions/types";

const initialState = {
  logged: false
}

export default function (state = initialState, action) {

  console.log('user reducer')
  switch (action.type) {
    case UPDATE_USER_DATA:
      return {
        logged: true,
        ...action.payload
      };
    case LOGOUT:
      return {
        logged: false
      }
    case ADD_TEAM_ID:
      return {
        ...state,
        teamId: action.payload
      }
    case UNCONFIRMED_MEETINGS:
      return {
        ...state,
        meetings: action.payload
      }
    case REMOVE_REQUEST:
      return {
        ...state,
        meetings: state.meetings.filter(meeting => meeting.id !== action.payload)
      }
    default:
      return state;
  }
}