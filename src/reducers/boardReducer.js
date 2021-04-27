import {
  ADD_TASK,
  MOVE_TASK,
  UPDATE_TASK,
  ADD_WORKER,
  LOGOUT,
  ADD_DEADLINE,
  ADD_PROBLEM,
  CREATE_BOARD, ADD_TEAM_ID
} from "../actions/types";

const initialState = {
  tasks: {
    empty: {
      id: '',
      name: '',
      description: '',
      deadline: '',
      worker: '',
      problems: []
    }
  },
  columns: {
    backlog: {
      id: '1',
      name: 'backlog',
      taskIds: []
    }
  },
  columnOrder: ['backlog']
}

const boardReducer = (state = initialState, action) => {
  console.log('board reducer')
  switch (action.type) {
    case ADD_TASK: {
      return {
        ...state,
        ...addTask(action.payload, state)
      };
    }
    case MOVE_TASK: {
      return {
        ...state,
        ...moveTask(action.payload, state)
      };
    }
    case UPDATE_TASK: {
      return {
        ...state,
        ...updateTask(action.payload, state)
      }
    }
    case ADD_WORKER: {
      return {
        ...state,
        ...addWorker(action.payload, state)
      }
    }
    case ADD_DEADLINE:
      return {
        ...state,
        ...addDeadline(action.payload, state)
      }
    case ADD_PROBLEM:
      return {
        ...state,
        ...addProblem(action.payload, state)
      }
    case CREATE_BOARD:
      return {
        ...state,
        ...createBoard(action.payload, state)
      }
    case LOGOUT:
      return initialState;
    default:
      return state;
  }
}

export default boardReducer;

const moveTask = (data, state) => {
  console.log("board state", state, "data", data)
  const {taskId, srcId, srcIndex, destId, destIndex} = data;
  if (srcId === destId) {
    return sameColumnMove({taskId, columnId: srcId, srcIndex, destIndex}, state);
  }

  const sourceColumn = state.columns[srcId];
  const destColumn = state.columns[destId];

  const sourceTaskIds = Array.from(sourceColumn.taskIds);
  let destTaskIds = Array.from(destColumn.taskIds);

  sourceTaskIds.splice(srcIndex, 1);
  destTaskIds.splice(destIndex, 0, taskId);

  return {
    columns: {
      ...state.columns,
      [srcId]: {
        ...sourceColumn,
        taskIds: sourceTaskIds
      },
      [destId]: {
        ...destColumn,
        taskIds: destTaskIds
      }
    }
  }
}

const sameColumnMove = (data, state) => {
  const {taskId, columnId, srcIndex, destIndex} = data;
  const column = state.columns[columnId];

  const newTaskIds = Array.from(column.taskIds);

  newTaskIds.splice(srcIndex, 1);
  newTaskIds.splice(destIndex, 0, taskId);

  return {
    columns: {
      ...state.columns,
      [columnId]: {
        ...column,
        taskIds: newTaskIds
      },
    }
  }
}

const addTask = (data, state) => {
  const {id, phaseId} = data;
  const newTask = {
    ...data,
    id: id.toString(),
    columnId: undefined
  };

  const column = state.columns[phaseId.toString()];
  const newTaskIds = [...column.taskIds, newTask.id]
  return {
    tasks: {
      ...state.tasks,
      [newTask.id]: newTask
    },
    columns: {
      ...state.columns,
      [phaseId.toString()]: {
        ...column,
        taskIds: newTaskIds
      }
    }
  };
}

const shortDescription = (description) => {
  if(description.length > 80) {
    return {
      descriptionShort: description.substr(0, 60)
    }
  } else {
    return {}
  }
}

const updateTask = (data, state) => {
  const {id, description, name} = data;

  return {
    tasks: {
      ...state.tasks,
      [id]: {
        ...state.tasks[id],
        description,
        name,
        ...shortDescription(description)
      }
    }
  }
}

const addWorker = (data, state) => {
  const {id, worker} = data;

  return {
    tasks: {
      ...state.tasks,
      [id]: {
        ...state.tasks[id],
        worker
      }
    }
  }
}

const addDeadline = (data, state) => {
  const {id, deadline} = data;

  return {
    tasks: {
      ...state.tasks,
      [id]: {
        ...state.tasks[id],
        deadline
      }
    }
  }
}

const addProblem = (data, state) => {
  const {id, problem} = data;

  return {
    tasks: {
      ...state.tasks,
      [id]: {
        ...state.tasks[id],
        problems: [...state.tasks[id].problems, problem]
      }
    }
  }
}

const createBoard = (data, state) => {
  return {
    ...data,
    tasks: {
      ...state.tasks,
      ...data.tasks
    }
  }
}