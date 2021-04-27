import React from 'react';
import {Route, Switch} from "react-router-dom";
import {withRouter} from 'react-router-dom';
import Home from "../components/Home";
import Login from "../components/Login";
import Board from "../components/board/Board";
import Promotion from "../components/managment/Promotion";
import Register from "../components/managment/Register";
import {connect} from "react-redux";
import ErrorPage from "../components/ErrorPage";
import ManagementNav from "../components/navigation/ManagementNav";
import EngineerNav from "../components/navigation/EngineerNav";
import CoordinatorNav from "../components/navigation/CoordinatorNav";
import LeaderNav from "../components/navigation/LeaderNav";
import BoardSetup from "../components/board/leader/BoardSetup";
import AddMembers from "../components/board/leader/AddMembers";
import UserPage from "../components/UserPage";
import Teams from "../components/managment/Teams";
import TeamView from "../components/coordinator/TeamView";
import CalendarView from "../components/calendar/CalendarView";
import Meetings from '../components/Meetings'

// export const routes = {
//   management: {
//     promotion: '/management/promotion',
//     register: '/management/register',
//     board: '/management/board/:id',
//   },
//   coordinator: {
//     teams: '/coordinator/teams',
//     board: '/coordinator/board/:id'
//   },
//   team: '/team',
//   home: '/',
//   login: '/login',
//   board: '/board',
//   error: '/error',
//   createTeam: '/createTeam',
//   progfile: '/progfile',
//   calendar: '/calendar'
// }

function Routes(props) {
  let Nav;
  if(props.user.usertype === 'uprava') {
    Nav = ManagementNav;
  } else {
    switch(props.user.employeeType) {
      case "inženjer": {
        Nav = EngineerNav;
        break;
      }
      case "koordinator": {
        Nav = CoordinatorNav;
        break;
      }
      case "voditelj": {
        Nav = LeaderNav;
        break;
      }
      default: {
        Nav = EngineerNav;
        break;
      }
    }
  }
  return (
    <Nav>
      <Switch>
        <Route exact path="/" component={Home}/>
        <Route path="/login" component={Login}/>
        {props.user.logged && (
          <>
            <Route path="/progfile" component={UserPage}/>
            <Route path="/calendar" component={CalendarView}/>
            <Route path="/management/promotion" component={Promotion}/>
            <Route path="/management/register" component={Register}/>
            <Route path="/management/board/:id" component={Board}/>
            <Route path="/teams" component={Teams}/>
            <Route path="/coordinator/teams" component={TeamView}/>
            <Route path="/coordinator/board/:id" component={Board}/>
            <Route path="/createTeam" component={BoardSetup}/>
            <Route path="/board" component={Board}/>
            <Route path="/team" component={AddMembers}/>
            <Route path="/meetings" component={Meetings}/>
          </>
        )}
        <Route path="*" component={ErrorPage}/>

        {/*<Route exact path="/" component={Home}/>*/}
        {/*<Route path="/login" component={Login}/>*/}
        {/*<Route path="progfile" component={UserPage}/>*/}
        {/*<Route path="/calendar" component={CalendarView}/>*/}

        {/*{props.user.usertype === "uprava" && (*/}
        {/*  <>*/}
        {/*    <Route path="/management/promotion" component={Promotion}/>*/}
        {/*    <Route path="/management/register" component={Register}/>*/}
        {/*    <Route path="/management/board/:id" component={Board}/>*/}
        {/*    <Route path="/teams" component={Teams}/>*/}
        {/*  </>*/}
        {/*)}*/}
        {/*{props.user.employeeType === "koordinator" && (*/}
        {/*  <>*/}
        {/*    <Route path="/coordinator/teams" component={TeamView}/>*/}
        {/*    <Route path="/coordinator/board/:id" component={Board}/>*/}
        {/*  </>*/}
        {/*)}*/}
        {/*{props.user.employeeType === "voditelj" && (*/}
        {/*  props.user.teamId === null ? (*/}
        {/*    <>*/}
        {/*      <Route path="/creatBoard" component={BoardSetup}/>*/}
        {/*    </>*/}
        {/*  ) : (*/}
        {/*    <>*/}
        {/*      <Route path="/board" component={Board}/>*/}
        {/*      <Route path="/team" component={AddMembers}/>*/}
        {/*    </>*/}
        {/*  )*/}
        {/*)}*/}
        {/*{props.user.employeeType === "inženjer" && props.user.teamId !== null && (*/}
        {/*    <Route path="/board" component={Board}/>*/}
        {/*)}*/}
        {/*<Route path="/meetings" component={Meetings}/>*/}
        {/*<Route path="/error" component={ErrorPage}/>*/}
      </Switch>
    </Nav>
  )
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(withRouter(Routes));
