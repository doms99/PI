import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {Divider, Avatar, Button} from "antd";
import { UserOutlined } from '@ant-design/icons';

import '../styles/UserPage.css'

class UserPage extends Component {
    constructor(props) {
        super(props);

        this.state = {
            pass: false
        };
    }

    render() {
        return (
            <>
                <Avatar icon={<UserOutlined/>} size={128} style={({marginLeft: "10%"})}/>
                <Divider orientation="left">Full name: </Divider>
                <h1 style={({marginLeft: "10%"})}>{this.props.userData.usertype === "uprava" ? this.props.userData.name : this.props.userData.name + " " + this.props.userData.surname}</h1>
                {
                    !(this.props.userData.usertype === "uprava") &&
                    <>
                        <Divider orientation="left">Username: </Divider>
                        <h1 style={({marginLeft: "10%"})}>{this.props.userData.username}</h1>
                        <Divider orientation="left">Employee Type: </Divider>
                        <h1 style={({marginLeft: "10%"})}>{this.props.userData.employeeType}</h1>
                    </>
                }
            </>
        );
    }
}

UserPage.propTypes = {
    userData: PropTypes.object.isRequired
};

const mapStateToProps = state => ({
    userData: state.user
});

export default withRouter(connect(mapStateToProps, {})(UserPage));