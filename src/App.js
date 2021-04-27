import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import {Provider} from 'react-redux'
import {PersistGate} from 'redux-persist/integration/react'

import './App.css';
import 'antd/dist/antd.css';

// Redux
import {store, persistor} from "./store"
import Routes from "./routes/Routes";

function App() {
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <BrowserRouter>
          <div className="App">
           <Routes/>
          </div>
        </BrowserRouter>
      </PersistGate>
    </Provider>
  );
}

export default App;

