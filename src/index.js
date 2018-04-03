import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'
import App from './App';
import Ipfs from 'ipfs';
import './styles/css/main.css';

if(!window.ipfs) {
  //TODO: This more than likely requires something more
  window.ipfs = new Ipfs()
}
window.ipfs.on('ready', async () => {
  try {
    await window.ipfs.swarm.connect("/dns4/ipfs.devtty.eu/wss/ipfs/QmVGX47BzePPqEzpkTwfUJogPZxHcifpSXsGdgyHjtk5t7")
  } catch(e) {
  	console.error(e)
  }

  ReactDOM.render((
    <HashRouter>
      <App />
    </HashRouter>
  ), document.getElementById('root'));
})
