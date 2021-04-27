import {SET_TEAM_LIST, SET_TEAM_PREVIEW} from "./types";

export const setTeamList = teams => dispatch => {
    dispatch({
        type: SET_TEAM_LIST,
        payload: teams
    });
}

export const setPreviewTeam = team => dispatch => {
    dispatch({
        type: SET_TEAM_PREVIEW,
        payload: team
    })
}