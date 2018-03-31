import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class Home extends Component {
  render() {
    return (
      <p className="Home">
        Welcome to IGiS<br/>
        <br/>
        Take a look at the <Link to="/repo/z8mWaFhNutrvGaKNcybtLjgLMEC3n5tC5">Demo Tree</Link><br/>
        <br/>
        Check out the source code at <Link to="https://github.com/ipfs-shipyard">https://github.com/ipfs-shipyard</Link><br/>
        <br/>
      </p>
    );
  }
}

export default Home
