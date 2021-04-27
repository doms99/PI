import React, {Component} from 'react';
import {Button, Divider, Input, Popconfirm, Space, Table} from 'antd';
import axios from 'axios';
import {withRouter} from 'react-router-dom';
import {BACKEND_URL} from "../../constants";
import {connect} from "react-redux";
import {SearchOutlined} from "@ant-design/icons";
import Highlighter from "react-highlight-words";

const {Column} = Table;

class TeamView extends Component {
  state = {
    loading: false,
    teams: [],
    workgroup: []
  }

  componentDidMount() {
    axios.get(`${BACKEND_URL}/coordinator/teams`,
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
          teams: res.data.teams.map(team => {
            return {
              ...team,
              key: team.id
            }
          }),
          workgroup: res.data.workgroup.map(team => {
            return {
              ...team,
              key: team.id
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
    const data = {teamId: record.id};
    console.log(data)

      axios.post(`${BACKEND_URL}/coordinator/teams/add`,
        data ,{
          headers: {
            'Authorization': 'Bearer ' + this.props.user.token,
            'Accept': 'application/json',
          }
        })
        .then((res) => {
          console.log(res.data)
          if(res.data.error) {
            alert(res.data.message);
          } else {
            this.setState({
              teams: this.state.teams.filter(team => team.id !== record.id),
              workgroup: [...this.state.workgroup, record]
            })
          }
        }).catch((error) => {
        console.error(error);
      })
  }

  remove = (record) => {
    console.log(record)
      axios.delete(`${BACKEND_URL}/coordinator/teams/remove/${record.id}`,
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
              workgroup: this.state.workgroup.filter(team => team.id !== record.id),
              teams: [...this.state.teams, record]
            })
          }
        }).catch((error) => {
        console.error(error);
      })
    }

  render() {
    return (
      <>
        <h1 style={{textAlign: 'center'}}>Add workgroup</h1>
        <Divider type="horizontal"/>
        <Space align='start'>
          <div style={{display: 'block'}}>
            <h3 style={{textAlign: 'center'}}>Available</h3>
            <Table pagination={false} scroll={{y: 400}} size='small' dataSource={this.state.teams}>
              <Column width={50} title="Id" dataIndex="id" key="id" sorter={(a, b) => a - b}/>
              <Column title="Name" dataIndex="name" key="name"/>
              <Column title="Status" dataIndex="status" key="status"/>
              <Column
                title="Action"
                key="action"
                render={(text, record) => (
                  <Button onClick={() => this.add(record)}>Add</Button>
                )}
              />
            </Table>
          </div>
          <div style={{display: 'block'}}>
            <h3 style={{textAlign: 'center'}}>Added</h3>
            <Table pagination={false} scroll={{y: 400}} size='small' dataSource={this.state.workgroup}>
              <Column width={50} title="Id" dataIndex="id" key="id" sorter={(a, b) => a - b}/>
              <Column title="Name" dataIndex="name" key="name" {...this.getColumnSearchProps("name")}/>
              <Column title="Status" dataIndex="status" key="status"/>
              <Column
                title="Action"
                key="action"
                render={(text, record) => (
                  <Space>
                    <Button onClick={() => this.remove(record)}>Remove</Button>
                    <Button onClick={() => this.props.history.push(`/coordinator/board/${record.id}`)}>Board</Button>
                  </Space>
                )}
              />
            </Table>
          </div>
        </Space>
      </>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user
  }
}

export default connect(mapStateToProps)(withRouter(TeamView));