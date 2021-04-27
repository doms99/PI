import React, {Component} from 'react';
import {Draggable} from 'react-beautiful-dnd';
import './Task.css';
import {Card, Avatar, Input, Button, DatePicker, Popover, Space} from "antd";
import {EditOutlined, DownOutlined, UpOutlined, PlusCircleOutlined, IssuesCloseOutlined} from '@ant-design/icons';
import {updateTask, addWorker, addDeadline, addProblem} from '../../actions/boardAction';
import {connect} from "react-redux";
import axios from 'axios';
import moment from 'moment';
import {BACKEND_URL} from "../../constants";

const {TextArea} = Input;

const transparent = {
  backgroundColor: 'rgba(255,255,255, 0.1)',
  border: 'none',
  color: 'white'
}

class Task extends Component {
  state = {
    editing: this.props.editing,
    hovering: false,
    descriptionEdit: this.props.task.description,
    nameEdit: this.props.task.name,
    ...this.props.task,
    expanded: this.props.task.descriptionShort === undefined,
    adding: false,
    onlyViewing: this.props.user.usertype === 'uprava' || this.props.user.employeeType === 'koordinator'
  }

  updateFetch = (data, path) => {
    return axios.post(`${BACKEND_URL}/${path}`,
      data, {
        headers: {
          'Authorization': 'Bearer ' + this.props.user.token,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
  }

  save = () => {
    if(this.state.descriptionEdit.trim() === '') {
      alert("Description can't be empty");
      this.setState({descriptionEdit: this.state.description});
      return;
    } else if(this.state.nameEdit.trim() === '') {
      alert("Name can't be empty");
      this.setState({nameEdit: this.state.name});
      return;
    }

    if(this.props.save) {
      this.props.save(this.getValues());
    } else {
      this.updateFetch(this.getValues(), `leader/editTask/${this.state.id}`)
        .then((res) => {
          if(res.data.error) {
            alert(res.data.message)
          } else {
            this.props.updateTask(this.state.id, this.state.descriptionEdit, this.state.nameEdit)
            this.setState({
              editing: false,
              description: this.state.descriptionEdit,
              name: this.state.nameEdit
            })
          }
        }).catch((error) => {
        console.error(error)
      })
    }
  }

  cancel = () => {
    if(this.props.cancel)
      this.props.cancel();
    else
      this.setState({editing: false});
  }

  problemHandler = (e) => {
    const value = e.target.value;
    console.log(value);
    if(value === '') return;

    this.updateFetch({description: value}, `board/edit/${this.state.id}/problem`)
      .then((res) => {
        if(res.data.error) {
          alert(res.data.message)
        } else {
          this.props.addProblem(this.state.id, value);
          this.setState({
            problems: [...this.state.problems, value],
            adding: false
          })
        }
      }).catch((error) => {
      console.error(error)
    })
  }

  descriptionUpdateHandler = (e) => {
    this.setState({
      descriptionEdit: e.target.value
    })
  }

  nameHandler = (e) => {
    this.setState({
      nameEdit: e.target.value
    })
  }

  assignTask = () => {
    this.updateFetch({}, `board/edit/${this.state.id}/worker`)
      .then((res) => {
        if(res.data.error) {
          alert(res.data.message)
        } else {
          this.props.addWorker(this.state.id, this.props.user.username);
          this.setState({worker: this.props.user.username})
        }
      }).catch((error) => {
      console.error(error)
    })
  }

  dateHandler = async (date, dateString) => {
    this.props.addDeadline(this.state.id, dateString);
    this.setState({deadline: dateString})

  }

  getValues = () => {
    return {
      id: parseInt(this.state.id, 10),
      name: this.state.nameEdit,
      description: this.state.descriptionEdit,
      worker: this.state.worker === '' ? undefined : this.state.worker,
      deadline: this.state.deadline === '' ? undefined : this.state.deadline,
      problems: this.state.problems,
      priority: this.state.priority
    }
  }

  render() {
    console.log('props task', this.props)
    console.log('state task', this.state)

    const editCard = <TextArea onChange={this.descriptionUpdateHandler} onPressEnter={this.save}
                               autoSize={{minRows: 3, maxRows: 7}} value={this.state.descriptionEdit}/>;
    let showCard;
    if(this.state.descriptionShort) {
      if(this.state.expanded) {
        showCard = <div>
          <p style={{margin: '0'}}>{this.state.description}</p>
          <div style={{textAlign: 'center', cursor: 'pointer'}}
               onClick={() => {
                 this.setState({expanded: false})
               }}
          >
            <UpOutlined/>
          </div>
        </div>
      } else {
        showCard = <div>
          <p style={{margin: '0'}}>{this.state.descriptionShort}</p>
          <div style={{textAlign: 'center', cursor: 'pointer'}}
               onClick={() => {
                 this.setState({expanded: true})
               }}
          >
            <DownOutlined/>
          </div>
        </div>
      }
    } else {
      showCard = <p>{this.state.description}</p>
    }
    const problemsContent =
      <div>
        <div>{this.state.problems.map(prob => <p>{prob}</p>)}</div>
        {!this.state.onlyViewing && (this.state.adding ? <Input autoFocus={true} onPressEnter={this.problemHandler}/> :
            <Button style={{backgroundColor: 'transparent', border: 'none'}}
                    onClick={() => this.setState({adding: true})}>+ Add</Button>)}
      </div>
    ;
    const mainPart = (
      <div className={this.state.editing || this.state.adding ? 'editing' : ''}
      >
        <Card size='small'
              style={{
                backgroundColor: 'Aquamarine',
                textAlign: 'left',
                textOverflow: 'ellipsis',
                zIndex: this.state.editing || this.state.adding ? '1000' : '100'
              }}
              onMouseEnter={this.props.user.employeeType === 'voditelj' ? () => this.setState({hovering: true}) : undefined}
              onMouseLeave={this.props.user.employeeType === 'voditelj' ? () => this.setState({hovering: false}) : undefined}
              title={this.state.editing ?
                <Input onChange={this.nameHandler} value={this.state.nameEdit}/> : this.state.name}
        >
          {(!this.state.editing && this.state.hovering) ? (
              <Button style={{
                position: 'absolute',
                top: '0',
                right: '0',
                backgroundColor: 'rgba(0, 0, 0, 0.05)',
                border: 'none'
              }}
                      onClick={() => this.setState({
                        editing: true,
                        hovering: false
                      })}><EditOutlined/></Button>)
            :
            ''
          }
          <div style={{
            overflowY: 'hidden',
            width: '100%',
            textOverflow: 'ellipsis'
          }}>
            {this.state.editing ? editCard : showCard}
          </div>
          <div style={{
            display: 'flex',
            width: '100%',
            backgroundColor: 'Indigo',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}>
            <div style={{textAlign: 'left'}}>
              {this.state.worker ?
                <Avatar size='small'>{this.state.worker.substring(0, 1)}</Avatar>
                :
                (!this.state.onlyViewing && <Button style={transparent} onClick={this.assignTask}><PlusCircleOutlined/></Button>)
              }
            </div>
            <div>
              <Popover content={problemsContent} title="Problems" trigger="click">
                <Button style={transparent}><IssuesCloseOutlined/></Button>
              </Popover>
            </div>
            {this.state.editing ? (
              <DatePicker
                onChange={this.dateHandler}
                format={'YYYY-MM-DD'} allowClear={true}
                value={this.state.deadline !== '' && this.state.deadline !== undefined ? moment(this.state.deadline, 'YYYY-MM-DD') : undefined}
                disabledDate={(date) => date.isBefore(moment().startOf('day'))}
              />
            ) : (
              this.state.deadline !== '' &&
              <div style={{
                textAlign: 'right',
                backgroundColor: 'HoneyDew',
                padding: '2px',
                borderRadius: '3px'
              }}>
                <span>{this.state.deadline}</span>
              </div>
            )}
          </div>
          {this.state.editing ? (
            <Space>
              <Button onClick={this.save}>Save</Button>
              <Button onClick={this.cancel} danger>Cancel</Button>
            </Space>
          ) : ''}
        </Card>
      </div>
    );

    return (
      <Draggable
        draggableId={this.state.id}
        index={this.props.index}
        isDragDisabled={!(this.state.worker === this.props.user.username) || this.state.editing}
      >
        {(provided) => (
          <div
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            ref={provided.innerRef}
          >
            {mainPart}
          </div>
        )}
      </Draggable>
    )
  }
}

const mapDispatchToProps = (dispatch) => {
  return {
    updateTask: (id, newDescription, newName) => dispatch(updateTask(id, newDescription, newName)),
    addWorker: (id, worker) => dispatch(addWorker(id, worker)),
    addDeadline: (id, deadline) => dispatch(addDeadline(id, deadline)),
    addProblem: (id, problem) => dispatch(addProblem(id, problem))
  }
}

const mapStateToProps = (state) => {
  return {
    user: state.user,
    getTask: (id) => state.board.tasks[id],
    empty: state.board.tasks.empty
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Task);
