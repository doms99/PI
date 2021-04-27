import {SET_TEAM_LIST, SET_TEAM_PREVIEW} from "../actions/types";

const initialState = {
    team: {},
    teams: []
}

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_TEAM_LIST:
            return {
                ...state,
                teams: action.payload
            };
        case SET_TEAM_PREVIEW:
            return {
                ...state,
                team: action.payload
            }
        default:
            return state;
    }
}