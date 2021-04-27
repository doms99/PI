import React from 'react';
import {Droppable} from 'react-beautiful-dnd'
import Task from "./Task";

const Column = (props) => {
  console.log("column props", props)

  const emptyTask =
    <Task editing={true}
          save={(task) => props.addTask(task)}
          cancel={() => props.addTask()}
          key={'adding'}
          task={props.emptyTask}
          index={props.tasks.length}
    />;
  return (
    <div>
      <Droppable
        droppableId={props.column.id}
      >
        {(provided, snapshot) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            isDraggingOver={snapshot.isDraggingOver}
            style={{minHeight: '100px'}}
          >
            {props.tasks.map((task, index) => <Task key={task.id} task={task} index={index}/>)}
            {props.adding && emptyTask}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </div>
  );
}

export default Column;