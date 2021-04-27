import React, {Component} from 'react';
import Column from "./Column";
import {DragDropContext} from "react-beautiful-dnd";
import {connect} from "react-redux";
import {withRouter} from 'react-router-dom';
import {addTask, moveTask, createBoard} from '../../actions/boardAction'
import {Button} from "antd";
import axios from "axios";
import {BACKEND_URL} from "../../constants";

class Board extends Component {
  constructor(props) {
    super(props);
    if(!this.props.user.logged)
      this.props.history.push('/login')

    this.state = {
      adding: false
    }
  }

  componentDidMount() {
    console.log(this.props)
    let path;
    if(this.props.user.employeeType === 'koordinator') path = `/coordinator/board/${this.props.match.params.id}`;
    else if(this.props.user.usertype === 'uprava') path = `/management/board/${this.props.match.params.id}`;
    else path = '/board';

    axios.get(`${BACKEND_URL}${path}`,
      {
        headers: {
          'Authorization': 'Bearer ' + this.props.user.token,
          'Accept': 'application/json',
        }
      })
      .then((res) => {
        console.log(res);
        if(res.data.error) {
          alert(res.data.message);
          if(this.props.user.employeeType === 'voditelj') this.props.history.push('/createBoard');
          else this.props.history.push('/');
        } else {
          const boardData = {
            ...res.data,
            columns: res.data.columns.map(column => {
              return {
                ...column,
                id: column.id.toString(),
                taskIds: column.taskIds.map(id => id.toString())
              }
            }),
            tasks: res.data.tasks.map(task => {
              return {
                ...task,
                deadline: task.deadline === null ? '' : task.deadline,
                worker: task.worker === null ? '' : task.worker,
                id: task.id.toString()
              }
            })
          }
          let columnOrder = boardData.columns.map(column => column.id);
          let columns = {}
          for(let column of boardData.columns) {
            console.log("column cdm", column)
            columns[column.id] = column
          }
          let tasks = {}
          for(let task of boardData.tasks) {
            console.log("task cdm", task)
            tasks[task.id] = task
          }
          this.props.createBoard({
            ...boardData,
            columns: {...columns},
            tasks: {...tasks},
            columnOrder
          });
        }
      })
      .catch((error) => {
        console.error(error)
      })
  }

  onDragEnd = (result) => {
    console.log("drop result", result);
    const {source, destination, draggableId} = result;
    if (destination === null) return;
    if (source.index === destination.index && source.droppableId === destination.droppableId) return;

    this.props.moveTask({
      taskId: draggableId,
      srcId: source.droppableId,
      destId: destination.droppableId,
      srcIndex: source.index,
      destIndex: destination.index
    })

    axios.post(`${BACKEND_URL}/board/edit/${draggableId}/phase`,
      {phaseId: parseInt(destination.droppableId, 10)}, {
      headers: {
          'Authorization': 'Bearer ' + this.props.user.token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        if(res.data.error) {
          this.props.moveTask({
            taskId: draggableId,
            srcId: destination.droppableId,
            destId: source.droppableId,
            srcIndex: destination.index,
            destIndex: source.index
          })
          alert(res.data.message);
        }
      }).catch((error) => {
        console.log(error)
    });
  };

  addTask = async (task) => {
    console.log(this.props)

    if(task === undefined) {
      this.setState({adding: false});
      return;
    }

    const {description} = task;
    if(description === '') {
      alert("Description can't be empty");
      return;
    }

    axios.post(`${BACKEND_URL}/leader/addTask`,
      task, {
        headers: {
          'Authorization': 'Bearer ' + this.props.user.token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      }).then((res) => {
        console.log('res', res)
        if(res.data.error) {
          alert(res.data.message);
        } else {
          const result = {
            ...res.data.task,
            deadline: res.data.deadline === null ? '' : res.data.deadline,
            worker: res.data.worker === null ? '' : res.data.worker,
            id: res.data.task.id.toString()
          }
          this.props.addTask(result);
          this.setState({adding: false})
        }
    }).catch((error) => {
      console.error(error)
    })
  }

  render() {
    console.log('board props', this.props)
    return (
      <DragDropContext
        onDragEnd={this.onDragEnd}
      >
        <div style={{padding: '10px 0 10px 10px', width: '100%', overflowX: 'auto', height: '100%', display: 'flex'}}>
          {this.props.columnOrder.map(columnId => {
            const column = this.props.columns[columnId];
            const tasks = column.taskIds.map(taskId => this.props.tasks[taskId])
            return (
              <div key={column.id} style={{flex: '0 0 30%', padding: '0 1.5%', display: 'flex', flexDirection: 'column'}}>
                <h3>{column.name}</h3>
                <div style={{border: 'solid black 2px', flex: '0 1 auto', overflowY: 'auto'}}>
                  <Column key={column.id}
                          column={column}
                          tasks={tasks}
                          emptyTask={column.name === 'backlog' ? this.props.tasks.empty : undefined}
                          adding={this.state.adding && column.name === 'backlog'}
                          addTask={this.addTask}
                  />
                </div>
                {this.props.user.employeeType === 'voditelj' && column.name === 'backlog' ?
                  <Button onClick={() => this.setState({adding: true})}>Add</Button> : ''}
              </div>
            )
          })}
        </div>
      </DragDropContext>
    );
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    moveTask: (data) => dispatch(moveTask(data)),
    addTask: (task) => dispatch(addTask(task)),
    createBoard: (data) => dispatch(createBoard(data))
  }
}
const mapStateToProps = (state) => {
  return {
    ...state.board,
    user: state.user
  }
}


export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Board));