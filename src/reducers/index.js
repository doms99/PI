import {combineReducers} from "redux";
import userDataReducer from "./userDataReducer";
import boardReducer from "./boardReducer";
import teamReducer from "./teamReducer";

export default combineReducers({
    user: userDataReducer,
    board: boardReducer,
    teamData: teamReducer
});