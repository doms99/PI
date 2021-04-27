import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import axios from 'axios'
import {Form, Input, Button, Select} from 'antd';
import PropTypes from 'prop-types';
import {connect} from 'react-redux';
import {updateUserData} from "../../actions/updateUserDataAction";
import {BACKEND_URL} from "../../constants";

const {Option} = Select;

class Register extends Component {
  state = {
    name: "",
    surname: "",
    username: "",
    usernameCheck: "",
    password: "",
    passwordCheck: "",
    employeeType: "inženjer"
  };

  formRef = React.createRef();

  resetValues = () => {
    this.setState({
      name: "",
      surname: "",
      username: "",
      usernameCheck: "",
      password: "",
      passwordCheck: "",
      employeeType: "inženjer"
    });
    this.formRef.current.resetFields();
  }

  onFinish = (values) => {
    const user = {
      name: values.name,
      surname: values.surname,
      username: values.username,
      password: values.password,
      employeeType: values.employeeType
    };

    console.log(this.props.userData);

    axios.post(`${BACKEND_URL}/management/register`,
        user, {
          headers: {
            'Authorization': 'Bearer ' + this.props.userData.token,
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        })
        .then((res) => {
          console.log(res.data);
          if(!res.data.error) {
            alert(`User ${res.data.name} registered!`);
            this.resetValues();
          } else {
            alert(res.data.error);
          }
        })
        .catch((error) => {
          console.error(error);
        })
  }

  changeHandler = (changedValues, allValues) => {
    this.setState({
      ...changedValues
    })
    console.log(this.state)
  }

  render() {
    const layout = {
      labelCol: {
        span: 8,
      },
      wrapperCol: {
        span: 8,
      },
    };
    const tailLayout = {
      wrapperCol: {offset: 11, span: 10},
    };


    const validateMessages = {
      required: "${label} is required"
    };

    return (
      <div>
        <h1 style={{width: '100%', textAlign: 'center'}}>👤 Sign up</h1>
        <Form
          {...layout}
          ref={this.formRef}
          name="nest-messages"
          onFinish={this.onFinish}
          onValuesChange={this.changeHandler}
          validateMessages={validateMessages}
        >
          <Form.Item
            name="name"
            label="Name"
            rules={[{required: true}]}
          >
            <Input name="name"/>
          </Form.Item>

          <Form.Item
            name="surname"
            label="Surname"
            rules={[{required: true}]}
          >
            <Input name="surname"/>
          </Form.Item>

          <Form.Item
            name="username"
            label="Username"
            rules={[{required: true}]}
          >
            <Input name="username"/>
          </Form.Item>

          <Form.Item
            name="usernameCheck"
            label="Confirm username"
            rules={[
              {required: true},
              ({getFieldValue}) => ({
                validator(rule, value) {
                  if(!value || getFieldValue('username') === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject('Username doesn\'t match!');
                },
              })
            ]}
          >
            <Input name="usernameCheck"/>
          </Form.Item>

          <Form.Item
            name="password"
            label="Password"
            rules={[{required: true}]}
          >
            <Input.Password name="password"/>
          </Form.Item>

          <Form.Item
            name="passwordCheck"
            label="Confirm password"
            rules={[
              {required: true},
              ({getFieldValue}) => ({
                validator(rule, value) {
                  if(!value || getFieldValue('password') === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject('Passwords doesn\'t match!');
                },
              })
            ]}
          >
            <Input.Password name="passwordCheck"/>
          </Form.Item>

          <Form.Item
            name="employeeType"
            label="Employee type"
            initialValue={"inženjer"}
            hasFeedback
            rules={[{required: true, message: 'Please select type'}]}
          >
            <Select
              showSearch
              placeholder="Select employee type"
              optionFilterProp="children"
              onSearch={this.onSearch}
              filterOption={(input, option) =>
                option.children.toLowerCase().indexOf(input.toLowerCase()) >= 0
              }
            >
              <option value="inženjer">Engineer</option>
              <option value="voditelj">Team leader</option>
              <option value="koordinator">Coordinator</option>
            </Select>
          </Form.Item>

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

Register.propTypes = {
  updateUserData: PropTypes.func.isRequired,
  userData: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
  userData: state.user
});

export default withRouter(connect(mapStateToProps, {updateUserData})(Register));