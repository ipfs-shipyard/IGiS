import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'
import App from './App';
import Ipfs from 'ipfs';
import './styles/css/main.css';

window.ipfs = new Ipfs({
  EXPERIMENTAL: {
    pubsub: true
  },
  config: {
    Addresses: {
      Swarm: [
        // Use IPFS dev signal server
        // '/dns4/star-signal.cloud.ipfs.team/wss/p2p-webrtc-star',
        '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star',
        // Use local signal server
        // '/ip4/0.0.0.0/tcp/9090/wss/p2p-webrtc-star',
      ]
    },
  }
})
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
