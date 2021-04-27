import React, {Component} from 'react';
import {Button, Divider, Input, Popconfirm, Space, Table} from 'antd';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import {BACKEND_URL} from "../../../constants";
import {connect} from "react-redux";
import {SearchOutlined} from "@ant-design/icons";
import Highlighter from "react-highlight-words";
import {addTeamId} from "../../../actions/updateUserDataAction";

const {Column} = Table;

class AddMembers extends Component {
  state = {
    loading: false,
    engineers: [],
    members: []
  }

  componentDidMount() {
    axios.get(`${BACKEND_URL}/leader/members`,
      {
        headers: {
          'Authorization': 'Bearer ' + this.props.user.token,
          'Accept': 'application/json',
        }
      }).then((res) => {
      console.log(res.data)
      if(res.data.error) {
        alert(res.data.message);
      } else {
        this.setState({
          engineers: res.data.engineers.map(eng => {
            return {
              ...eng,
              key: eng.username
            }
          }),
          members: res.data.members.map(eng => {
            return {
              ...eng,
              key: eng.username
            }
          })
        })
      }
      this.setState({
        loading: false
      })
    }).catch((error) => {
      console.error(error);
    })
  }

  getColumnSearchProps = dataIndex => ({
    filterDropdown: ({setSelectedKeys, selectedKeys, confirm, clearFilters}) => (
      <div style={{padding: 8}}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{width: 188, marginBottom: 8, display: 'block'}}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined/>}
            size="small"
            style={{width: 90}}
          >
            Search
          </Button>
          <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{width: 90}}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{color: filtered ? '#1890ff' : undefined}}/>,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
      if(visible) {
        setTimeout(() => this.searchInput.select(), 100);
      }
    },
    render: text =>
      this.state.searchedColumn === dataIndex ? (
        <Highlighter
          highlightStyle={{backgroundColor: '#ffc069', padding: 0}}
          searchWords={[this.state.searchText]}
          autoEscape
          textToHighlight={text ? text.toString() : ''}
        />
      ) : (
        text
      ),
  });

  handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    this.setState({
      searchText: selectedKeys[0],
      searchedColumn: dataIndex,
    });
  };

  handleReset = clearFilters => {
    clearFilters();
    this.setState({searchText: ''});
  };

  add = (record) => {
    if(!this.props.finish) {
      axios.post(`${BACKEND_URL}/leader/members/add`,
        {username: record.username}, {
          headers: {
            'Authorization': 'Bearer ' + this.props.user.token,
            'Accept': 'application/json',
          }
        })
        .then((res) => {
          if(res.data.error) {
            alert(res.data.message);
          } else {
            this.setState({
              engineers: this.state.engineers.filter(eng => eng.username !== record.username),
              members: [...this.state.members, record]
            })
          }
        }).catch((error) => {
        console.error(error);
      })
    } else {
      this.setState({
        engineers: this.state.engineers.filter(eng => eng.username !== record.username),
        members: [...this.state.members, record]
      })
    }
  }

  remove = (record) => {
    if(!this.props.finish) {
      axios.delete(`${BACKEND_URL}/leader/members/remove/${record.username}`,
        {
          headers: {
            'Authorization': 'Bearer ' + this.props.user.token,
            'Accept': 'application/json',
          }
        })
        .then((res) => {
          if(res.data.error) {
            alert(res.data.message);
          } else {
            this.setState({
              members: this.state.members.filter(eng => eng.username !== record.username),
              engineers: [...this.state.engineers, record]
            })
          }
          this.setState({loading: false})
        }).catch((error) => {
        console.error(error);
      })
    } else {
      this.setState({
        members: this.state.members.filter(eng => eng.username !== record.username),
        engineers: [...this.state.engineers, record]
      })
    }
  }

  finish = () => {
    if(this.props.finish) {
      this.props.finish(this.state.members.map(eng => eng.username));
    } else {
      this.props.history.push('/board')
    }
  }

  closeProject = () => {
    axios.delete(`${BACKEND_URL}/leader/closeProject`,
      {
        headers: {
          'Authorization': 'Bearer ' + this.props.user.token,
          'Accept': 'application/json',
        }
      })
      .then(async (res) => {
        if(res.data.error) {
          alert(res.data.message);
        } else {
          await this.props.addTeamId(null);
          this.props.history.push('/createTeam')
        }
      }).catch((error) => {
      console.error(error);
    })
  }

  render() {
    return (
      <>
        <h1 style={{textAlign: 'center'}}>Add members</h1>
        <Divider type="horizontal"/>
        <Space align='start'>
          <div style={{display: 'block'}}>
            <h3 style={{textAlign: 'center'}}>Available</h3>
            <Table pagination={false} scroll={{y: 400}} size='small' dataSource={this.state.engineers}>
              <Column title="Name" dataIndex="name" key="name" {...this.getColumnSearchProps('name')}
                      sorter={(a, b) => a.name.localeCompare(b.name)}/>
              <Column title="Surname" dataIndex="surname" key="surname" {...this.getColumnSearchProps('surname')}
                      sorter={(a, b) => a.surname.localeCompare(b.surname)}/>
              <Column title="Username" dataIndex="username" key="username" {...this.getColumnSearchProps('username')}
                      sorter={(a, b) => a.username.localeCompare(b.username)}/>
              <Column
                title="Action"
                key="action"
                width={100}
                render={(text, record) => (
                  <Button onClick={() => this.add(record)}>Add</Button>
                )}
              />
            </Table>
          </div>
          <div style={{display: 'block'}}>
            <h3 style={{textAlign: 'center'}}>Added</h3>
            <Table pagination={false} scroll={{y: 400}} size='small' dataSource={this.state.members}>
              <Column title="Name" dataIndex="name" key="name" {...this.getColumnSearchProps('name')}
                      sorter={(a, b) => a.name.localeCompare(b.name)}/>
              <Column title="Surname" dataIndex="surname" key="surname" {...this.getColumnSearchProps('surname')}
                      sorter={(a, b) => a.surname.localeCompare(b.surname)}/>
              <Column title="Username" dataIndex="username" key="username" {...this.getColumnSearchProps('username')}
                      sorter={(a, b) => a.username.localeCompare(b.username)}/>
              <Column
                title="Action"
                key="action"
                width={100}
                render={(text, record) => (
                  <Button onClick={() => this.remove(record)}>Remove</Button>
                )}
              />
            </Table>
          </div>

        </Space>
        {this.props.finish ?
          <>
            <Divider type='horizontal'/>
            <div>
              <Button onClick={this.finish}>Finish</Button>
            </div>
          </>
          :
          <>
            <Divider type='horizontal'/>
            <div>
              <Popconfirm title="Are you sure you want to close this team?" okText="Yes" cancelText="No"
                          onConfirm={this.closeProject}>
                <Button type='primary' danger>Close project</Button>
              </Popconfirm>

            </div>
          </>}

      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    addTeamId: (teamId) => dispatch(addTeamId(teamId))
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(AddMembers));