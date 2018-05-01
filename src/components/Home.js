import React, { Component } from 'react'
import { Link } from 'react-router-dom'

class Home extends Component {
  render() {
    return (
      <span className="Home">
        <p>Welcome to IGiS</p>
        <p>
          IGiS - Interplanetary Git Service - is a decentralized
          alternative to services like GitHub. It's built
          with <a href="https://ipfs.io">IPFS</a> and <a href="https://ipld.io">IPLD</a>.
        </p>
        <p>Take a look at the <Link to="/repo/QmViWi5az9iiPzESM6ruHf84TcmHSAVQ2KQdNveoDH7eaY">Demo Tree</Link></p>
        <p>
          NOTE: This project is still WIP and has many rough
          edges and is missing many core features. You can follow
          development at the link below
        </p>
        <p>Check out the source code at <a href="https://github.com/ipfs-shipyard/IGiS">https://github.com/ipfs-shipyard/IGiS</a></p>
        <p>..</p>
      </span>
    );
  }
}

export default Home
