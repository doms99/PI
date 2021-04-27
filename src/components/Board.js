import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';

class Board extends Component {
    render() {
        console.log(this.props)
        return (
            <div className="full-height">
                <div className="vertical-center container">
                    <div className="avatar"></div>
                    <span className="title">{ this.props.userData.name + ' ' + this.props.userData.surname }</span><br/>
                    <span className="subtitle">{ this.props.userData.employeeType }</span>
                </div>

            </div>
        )
    }
}

Board.propTypes = {
    updateUserData: PropTypes.func,
    userData: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    userData: state.user.userData
});

export default withRouter(connect(mapStateToProps, {})(Board));
