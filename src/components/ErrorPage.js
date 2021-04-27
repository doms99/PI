import React from 'react'
import '../styles/ErrorPage.css';
import '../App.css';
import { withRouter } from 'react-router-dom'

class ErrorPage extends React.Component {
    constructor(props) {
        super(props);

        this.redirectHome = this.redirectHome.bind(this);
    }

    redirectHome = () => {
        this.props.history.push('/')
    }

    render() {
        return (
            <div className={"err-container"}>
                <div className={"big-text"}>{this.props.code ? this.props.code : '404'}</div>
                <div className={"medium-text"}>{this.props.title ? this.props.title : 'Page not found'}</div>
                <div className={"small-text"}>{this.props.message ? this.props.message : `Looks like that page doesn't exist`}</div>
                <button className={"button"} type={"button"} onClick={this.redirectHome}>GO TO HOMEPAGE</button>
            </div>
        );
    }
}

export default withRouter(ErrorPage);