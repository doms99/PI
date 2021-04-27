import {createStore, applyMiddleware, compose} from "redux";
import thunk from "redux-thunk";
import rootReducer from "./reducers"
import storage from 'redux-persist/lib/storage'
import {persistReducer, persistStore} from "redux-persist"; // defaults to localStorage for web
import {updateUnconfirmedMeetings} from './actions/updateUserDataAction'

const initialState = {};

const persistConfig = {
  key: 'root',
  storage
}

const persistedReducer = persistReducer(persistConfig, rootReducer);
const store = createStore(
  persistedReducer,
  initialState,
  compose(
    applyMiddleware(thunk)
  )
)
let persistor = persistStore(store)

export {store, persistor};
