import React from 'react';
import Navigation from "./Navigation";
import {Menu} from "antd";
import {useSelector} from "react-redux";

function LeaderNav(props) {
  const teamId = useSelector(state => state.user.teamId)
  console.log('mannacv', props)
  const items = <>
    <Menu.Item key='/'>
      Home
    </Menu.Item>
    {teamId !== null ? (
      <>
        <Menu.Item key='/board'>
          Board
        </Menu.Item>
        <Menu.Item key='/team'>
          Team
        </Menu.Item>
      </>
      ) : (
      <Menu.Item key='/createTeam'>
        Create team
      </Menu.Item>
    )}
    <Menu.Item key='/calendar'>
      Calendar
    </Menu.Item>
    <Menu.Item key='/progfile'>
      Profile
    </Menu.Item>
  </>

  return (
    <Navigation items={items}>
      {props.children}
    </Navigation>
  );
}

export default LeaderNav;