import React, { Component } from 'react'
import { Link } from 'react-router-dom'
import Button from './Button'

class StatusBar extends Component {
  render() {
    return (
      <div className="StatusBar">
        <div className="title">
          IGiS
        </div>
        <div className="menu">
          <Link to="/repo/QmViWi5az9iiPzESM6ruHf84TcmHSAVQ2KQdNveoDH7eaY">Demo Repository</Link>
          <Button>
            <Link to="/new/repo">New Repository</Link>
          </Button>
        </div>
      </div>
    );
  }
}

export default StatusBar