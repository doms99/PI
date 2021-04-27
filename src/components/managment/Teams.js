import React, {Component} from 'react';
import {withRouter} from 'react-router-dom';
import axios from 'axios'
import {connect} from "react-redux";
import {setTeamList} from "../../actions/teamActions";
import {BACKEND_URL} from "../../constants";

import '../../styles/Teams.css'
import {Button, Input, Space, Table} from "antd";
import {SearchOutlined} from "@ant-design/icons";
import Highlighter from "react-highlight-words";

const {Column} = Table;

class Teams extends Component {
  state = {
    teams: []
  }

  componentDidMount() {
    axios.get(`${BACKEND_URL}/management/teams`, {
      headers: {
        'Authorization': 'Bearer ' + this.props.userData.token,
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    })
      .then((res) => {
        console.log(res.data);
        if(res.data.error) {
          alert(res.data.message);
        } else {
          this.setState({
            teams: res.data.teams.map(team => {
              return {
                ...team,
                status: this.props.status ? "Finished" : "Unfinished"
              }
            })
          });
        }
      })
      .catch((error) => {
        console.error(error)
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
    this.setState({ searchText: '' });
  };

  render() {
    const filters = [
      {
        text: 'Finished',
        value: 'Finished',
      },
      {
        text: 'Unfinished',
        value: 'Unfinished',
      }
    ]
    return (
      <>
        <h1>Teams</h1>
        <Table pagination={false} scroll={{y: 400}} size='small' dataSource={this.state.teams}>
          <Column title="Name" dataIndex="name" key="name" {...this.getColumnSearchProps("name")}
                  sorter={(a, b) => a.name.localeCompare(b.name)}/>
          <Column title="Id" dataIndex="id" key="id" sorter={(a, b) => a.id - b.id}/>
          <Column title="Status" dataIndex="status" key="status" filters={filters} onFilter={(value, record) => record.name.includes(value)}/>
          <Column title="Group name" dataIndex="groupName" key="groupName" {...this.getColumnSearchProps("groupName")}
                  sorter={(a, b) => a.groupName === null ? (b.groupName === null ? 0 : -1) : (b.groupName === null ? 1 : a.groupName.localeCompare(b.groupName))}/>
          <Column title="Group ID" dataIndex="groupId" key="groupId" sorter={(a, b) => a.groupId - b.groupId}/>
          <Column
            title="Action"
            key="action"
            width={100}
            render={(text, record) => (
              <Space>
                <Button onClick={() => this.props.history.push(`/management/board/${record.id}`)}>Board</Button>
              </Space>
            )}
          />
        </Table>
      </>
    );
  }
}

// Teams.propTypes = {
//     setTeamList: PropTypes.func.isRequired,
//     userData: PropTypes.object.isRequired,
//     teams: PropTypes.array.isRequired
// }

const mapStateToProps = state => ({
  userData: state.user,
  teams: state.teamData.teams
});

export default withRouter(connect(mapStateToProps, {setTeamList})(Teams));