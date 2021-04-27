import React from 'react';
import Navigation from "./Navigation";
import {Menu} from "antd";

function ManagementNav(props) {
  console.log('mannacv', props)
  const items = <>
    <Menu.Item key='/'>
      Home
    </Menu.Item>
    <Menu.Item key='/management/register'>
      Register
    </Menu.Item>
    <Menu.Item key='/teams'>
      Teams
    </Menu.Item>
    <Menu.Item key='/management/promotion'>
      Promote
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

export default ManagementNav;