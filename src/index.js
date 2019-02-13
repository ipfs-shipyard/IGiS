import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'
import App from './App';
import Ipfs from 'ipfs';
import './styles/css/main.css';

window.ipfs = new Ipfs()
window.ipfs.on('ready', async () => {
  ReactDOM.render((
    <HashRouter>
      <App />
    </HashRouter>
  ), document.getElementById('root'));
})
