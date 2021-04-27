import React from 'react';
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom';
import {Button, Layout, Menu, Badge} from 'antd';
import {logout, updateUnconfirmedMeetings} from "../../actions/updateUserDataAction";

const {Sider, Content} = Layout;

function Navigation(props) {
  console.log('navigation render')
  if(props.user.logged) {
    props.updateUnconfirmedMeetings(props.user.token)
  }
  return (
    <Layout style={{height: '100%', padding: '30px 0 30px 15px'}}>
      <Sider>
        <Menu theme='dark'
              onClick={(item) => props.history.push(item.key)}
              selectedKeys={[props.location.pathname]}
        >
          {props.user.logged ? (
            <>
              {props.items}
              {props.user.meetings && props.user.meetings.length !== 0 &&
              <Menu.Item key='/meetings'>
                <Badge size="small" count={props.user.meetings.length} overflowCount={9} offset={[8, 0]}>
                  <div style={{color: 'white'}}>
                    Meeting requests
                  </div>
                </Badge>
              </Menu.Item>}
            </>
          ) : (
            <>
              <Menu.Item key='/'>
                Home
              </Menu.Item>
              <Menu.Item key='/login'>
                Login
              </Menu.Item>
            </>
          )}
          {
            props.user.logged &&
            <Button style={{
              position: 'absolute',
              bottom: '0',
              left: '0',
              width: '100%',
              backgroundColor: 'transparent',
              color: 'white',
              border: 'none',
              textAlign: 'left'
            }}
            onClick={() => {
              props.logout();
              props.history.push('/')
            }
            }>Logout</Button>
          }
        </Menu>
      </Sider>
      <Content style={{height: '100%', overflowY: 'auto'}}>
        {props.children}
      </Content>
    </Layout>
  );
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    employeeType: state.user.usertype === 'uprava' ? undefined : state.user.employeeType,
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    logout: () => dispatch(logout()),
    updateUnconfirmedMeetings: (token) => dispatch(updateUnconfirmedMeetings(token)),
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Navigation));
