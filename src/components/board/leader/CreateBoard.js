import React, {Component} from 'react';
import {List, Divider, Space, Button, Input} from 'antd';
import {DragDropContext, Droppable, Draggable} from "react-beautiful-dnd";
import {CloseOutlined, SaveOutlined, CloseCircleOutlined} from '@ant-design/icons';
import axios from "axios";
import {BACKEND_URL} from "../../../constants";


class CreateBoard extends Component {
  state = {
    phases: ['backlog'],
    phaseEdit: '',
    nameEdit: '',
    nameError: undefined,
    adding: false,
    step: 1
  }

  onDragEnd = (result) => {
    console.log("drop result", result);
    const {source, destination} = result;
    if(destination === null) return;

    if(destination.index === 0) destination.index = 1;

    if(source.index === destination.index && source.droppableId === destination.droppableId) return;

    const newOrder = [...this.state.phases]
    const temp = newOrder[source.index]
    newOrder.splice(source.index, 1)
    newOrder.splice(destination.index, 0, temp)
    console.log(newOrder)

    this.setState({
      phases: newOrder
    })
  };

  create = () => {
    if(this.state.nameEdit.trim() === '') {
      this.setState({nameError: 'Board must have a name!'});
      return;
    }

    const data = {
      name: this.state.nameEdit,
      phases: this.state.phases
    }

    this.props.create(data);
  }

  remove = (index) => {
    const newPhases = Array.from(this.state.phases);
    newPhases.splice(index, 1);

    this.setState({
      phases: newPhases
    })
  }

  add = () => {
    if(this.state.phaseEdit.trim() !== '' && !this.state.phases.includes(this.state.phaseEdit)) {
      this.setState({
        phases: [...this.state.phases, this.state.phaseEdit],
        phaseEdit: ''
      })
    }

    this.cancel();
  }

  cancel = () => {
    this.setState({
      adding: false
    })
  }

  nameHandler = (e) => {
    this.setState({
      phaseEdit: e.target.value
    })
  }
  boardNameHandler = (e) => {
    this.setState({
      nameEdit: e.target.value
    })
  }


  render() {

    const items = this.state.phases.map((item, index) => (
    <Draggable
      draggableId={index.toString()}
      index={index}
      isDragDisabled={item === this.state.phases[0]}
    >
      {(provided) => (
        <div
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          ref={provided.innerRef}
        >
          <div style={{padding: '2px 0', margin: '2px 0', borderColor: 'black', borderStyle: 'solid', borderWidth: '1px 0 1px 0'}}>
            <List.Item style={{backgroundColor: 'rgba(0, 0, 0, 0.05)'}}>
              <List.Item.Meta
                title={<span>{index+1}<Divider type="vertical" />{item}</span>}
              />
              <Space align='center'>
                {item !== this.state.phases[0] &&
                <Button onClick={() => this.remove(index)}><CloseOutlined/></Button>}
              </Space>
            </List.Item>
          </div>
        </div>
      )}
    </Draggable>
    ));

    const footer = this.state.adding ? (
      <Space>
        <Input autoFocus={true} onChange={this.nameHandler} onPressEnter={this.add} value={this.state.phaseEdit}/>
        <Button onClick={this.add}><SaveOutlined/></Button>
        <Button onClick={this.cancel}><CloseCircleOutlined/></Button>
      </Space>
    ) : (
      <Button onClick={() => this.setState({adding: true})}>+ Add</Button>
    )

    return (
      <>
        <h1>Create Board</h1>
        <Divider type="horizontal" />
        <h3>Board name</h3>
        <div style={{minWidth: '300px'}}>
          <Input onChange={this.boardNameHandler} value={this.state.nameEdit} placeholder='Enter board name'/>
          {this.state.nameError && <span>{this.state.nameError}</span>}
        </div>
        <Divider type="horizontal" />
        <DragDropContext
          onDragEnd={this.onDragEnd}
        >
          <List
            style={{minWidth: '300px'}}
            header={<h1 style={{width: '100%', textAlign: 'center'}}>Phases</h1>}
            footer={footer}
            bordered
          >
            <Droppable
              droppableId='board'
            >
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  isDraggingOver={snapshot.isDraggingOver}
                >
                  {items}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </List>
        </DragDropContext>
        <Divider type="horizontal" />
        <div>
          <Button onClick={this.create}>Create</Button>
        </div>
      </>
    );
  }
}

export default CreateBoard;