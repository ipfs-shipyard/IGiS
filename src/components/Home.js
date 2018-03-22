import React, { Component } from 'react';
import { Link } from 'react-router-dom'

class Home extends Component {
  render() {
    return (
      <header>
        <nav>
          <ul>
            <li><Link to="/">Home</Link></li>
            <li><Link to="/repo/z8mWaFhNutrvGaKNcybtLjgLMEC3n5tC5">Demo Tree</Link></li>
          </ul>
        </nav>
      </header>
    );
  }
}

export default Home
