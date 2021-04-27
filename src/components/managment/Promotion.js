import React, {Component} from 'react';
import {Table, Button, Popconfirm, Space, Input} from 'antd';
import {SearchOutlined} from '@ant-design/icons'
import {BACKEND_URL} from "../../constants";
import {connect} from "react-redux";
import axios from "axios";

const {Column} = Table;

class Promotion extends Component {
  state = {
    users: [],
    loading: true
  }

  getEnglish = (type) => {
    switch(type) {
      case 'koordinator':
        return 'coordinator';
      case 'voditelj':
        return 'leader';
      case 'inženjer':
        return 'engineer';
      default:
        return 'error';
    }
  }

  componentDidMount() {
    axios.get(`${BACKEND_URL}/management/promo`,
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
            users: res.data.users.map(user => {
              return {
                ...user,
                employeeType: this.getEnglish(user.employeeType),
                key: user.username
              }
            })
          });
        }
        this.setState({
          loading: false
        })
      }).catch((error) => {
      console.error(error);
    })
  }

  promote = (record) => {
    this.setState({loading: true})
    console.log('record', record);
    axios.post(`${BACKEND_URL}/management/promo`,
      {username: record.username}, {
        headers: {
          'Authorization': 'Bearer ' + this.props.user.token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        if(res.data.error) {
          alert(res.data.message);
        } else {
          const index = this.state.users.findIndex(user => user.username === record.username);
          const newUsers = Array.from(this.state.users);
          newUsers[index].employeeType = res.data.employeeType
          this.setState({
            users: newUsers
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
    filterDropdown: ({ setSelectedKeys, selectedKeys, confirm, clearFilters }) => (
      <div style={{ padding: 8 }}>
        <Input
          ref={node => {
            this.searchInput = node;
          }}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={e => setSelectedKeys(e.target.value ? [e.target.value] : [])}
          onPressEnter={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
          style={{ width: 188, marginBottom: 8, display: 'block' }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => this.handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{ width: 90 }}
          >
            Search
          </Button>
          <Button onClick={() => this.handleReset(clearFilters)} size="small" style={{ width: 90 }}>
            Reset
          </Button>
        </Space>
      </div>
    ),
    filterIcon: filtered => <SearchOutlined style={{ color: filtered ? '#1890ff' : undefined }} />,
    onFilter: (value, record) =>
      record[dataIndex]
        ? record[dataIndex].toString().toLowerCase().includes(value.toLowerCase())
        : '',
    onFilterDropdownVisibleChange: visible => {
      if (visible) {
        setTimeout(() => this.searchInput.select(), 100);
      }
    },
    render: text => text

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
    this.setState({ searchText: '' });
  };

  render() {
    const filters = [
      {
        text: 'engineer',
        value: 'engineer',
      },
      {
        text: 'leader',
        value: 'leader',
      },
      {
        text: 'coordinator',
        value: 'coordinator',
      },
    ]
    return (
      <>
        <h1 style={{textAlign: 'center'}}>Promote employees</h1>
        <Table dataSource={this.state.users} loading={this.state.loading}>
          <Column title="Name" dataIndex="name" key="name" {...this.getColumnSearchProps('name')}
                  sorter={(a, b) => a.name.localeCompare(b.name)}/>
          <Column title="Surname" dataIndex="surname" key="surname" {...this.getColumnSearchProps('surname')}
                  sorter={(a, b) => a.surname.localeCompare(b.surname)}/>
          <Column title="Username" dataIndex="username" key="username" {...this.getColumnSearchProps('username')}
                  sorter={(a, b) => a.username.localeCompare(b.username)}/>
          <Column title="Employee type" dataIndex="employeeType" key="employeeType" filters={filters}
                  onFilter={(value, record) => record.employeeType === value}/>
          <Column
            title="Action"
            key="action"
            render={(text, record) => (
              record.employeeType !== 'koordinator' && (
                <Popconfirm title="Continue?" okText="Yes" cancelText="No" onConfirm={() => this.promote(record)}>
                  <Button>Promote</Button>
                </Popconfirm>
              )
            )}
          />
        </Table>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(Promotion);