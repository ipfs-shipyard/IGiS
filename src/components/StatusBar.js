import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class StatusBar extends Component {
  render() {
    return (
      <div className="StatusBar">
        <div className="title">
          IGiS
        </div>
        <div className="menu">
          <Link to="/repo/QmViWi5az9iiPzESM6ruHf84TcmHSAVQ2KQdNveoDH7eaY">Demo Tree</Link>
          <Link to="/new/repo">New Repository</Link>
        </div>
      </div>
    );
  }
}

export default StatusBar