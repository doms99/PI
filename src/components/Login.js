import React, {Component} from 'react';
import {withRouter} from 'react-router-dom'
import axios from 'axios'
import {Form, Input, Button} from 'antd';
import {connect} from 'react-redux'
import {updateUserData} from "../actions/updateUserDataAction";
import {BACKEND_URL} from "../constants";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      username: "",
      password: ""
    };

    if(this.props.user.logged) this.props.history.push('/')
  }

  onFinish = async (values) => {
    const user = {
      username: values.username,
      password: values.password
    };

    axios.post(`${BACKEND_URL}/login`,
      user, {
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        console.log(res);
        if (res.data.error) {
          alert(res.data.message)
        } else {
          console.log(res.data)
          this.props.updateUserData({
            username: user.username,
            ...res.data,
          })

          this.props.history.push('/')
        }
      })
      .catch((error) => {
        console.error(error)
      })

    console.log('submit')
  };

  changeHandler = (changedValues) => {
    this.setState({
      ...changedValues
    })
  }

  render() {
    const layout = {
      labelCol: {span: 8},
      wrapperCol: {span: 8},
    };
    const tailLayout = {
      wrapperCol: {offset: 10, span: 10},
    };

    const validateMessages = {
      required: "${label} is necessary"
    };

    return (
      <div>
        <h1 style={{width: '100%', textAlign: 'center'}}>👤 Log in</h1>
        <Form
          {...layout}
          name="nest-messages"
          initialValues={{remember: true}}
          onFinish={this.onFinish}
          onValuesChange={this.changeHandler}
          validateMessages={validateMessages}
        >
          <Form.Item
            label="Username"
            name="username"
            rules={[{required: true}]}
          >
            <Input/>
          </Form.Item>

          <Form.Item
            label="Password"
            name="password"
            rules={[{required: true}]}
          >
            <Input.Password/>
          </Form.Item>

          {/*<Form.Item {...tailLayout} name="remember" valuePropName="checked">*/}
          {/*  <Checkbox>Remember me</Checkbox>*/}
          {/*</Form.Item>*/}

          <Form.Item {...tailLayout}>
            <Button type="primary" htmlType="submit">
              Submit
            </Button>
          </Form.Item>
        </Form>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  user: state.user
});

const mapDispatchToProps = (dispatch) => {
  return {
    updateUserData: (userData) => dispatch(updateUserData(userData))
  }
}

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(Login));
