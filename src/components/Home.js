import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class Home extends Component {
  render() {
    return (
      <span className="Home">
        <p>Welcome to IGiS</p>
        <p>Take a look at the <Link to="/repo/QmViWi5az9iiPzESM6ruHf84TcmHSAVQ2KQdNveoDH7eaY">Demo Tree</Link></p>
        <p>Check out the source code at <a href="https://github.com/ipfs-shipyard/IGiS">https://github.com/ipfs-shipyard/IGiS</a></p>
      </span>
    );
  }
}

export default Home
