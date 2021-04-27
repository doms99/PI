import {
  ADD_TASK,
  MOVE_TASK,
  UPDATE_TASK,
  ADD_WORKER,
  ADD_DEADLINE,
  ADD_PROBLEM,
  CREATE_BOARD
} from "./types";

export const addTask = data => dispatch => {
  console.log('addTask');
  dispatch({
    type: ADD_TASK,
    payload: data
  });
}

export const moveTask = data => dispatch => {
  console.log('moveTask');
  dispatch({
    type: MOVE_TASK,
    payload: data
  });
}

export const updateTask = (id, description, name) => dispatch => {
  console.log('updateTask');
  dispatch({
    type: UPDATE_TASK,
    payload: {
      id,
      description,
      name
    }
  });
}

export const addWorker = (id, worker) => dispatch => {
  console.log('add worker');
  dispatch({
    type: ADD_WORKER,
    payload: {
      id,
      worker
    }
  })
}

export const addDeadline = (id, deadline) => dispatch => {
  console.log('add deadline');
  dispatch({
    type: ADD_DEADLINE,
    payload: {
      id,
      deadline
    }
  })
}

export const addProblem = (id, problem) => dispatch => {
  console.log('add problem');
  dispatch({
    type: ADD_PROBLEM,
    payload: {
      id,
      problem
    }
  })
}

export const createBoard = (data) => dispatch => {
  console.log('create board');
  dispatch({
    type: CREATE_BOARD,
    payload: data
  })
}
