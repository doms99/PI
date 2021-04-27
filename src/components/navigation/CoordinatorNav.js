import React from 'react';
import Navigation from "./Navigation";
import {Menu} from "antd";

function CoordinatorNav(props) {
  console.log('coornacv', props)
  const items = <>
    <Menu.Item key='/'>
      Home
    </Menu.Item>
    <Menu.Item key='/coordinator/teams'>
      Teams
    </Menu.Item>
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

export default CoordinatorNav;