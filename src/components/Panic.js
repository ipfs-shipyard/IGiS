import React, { Component } from 'react'

class Panic extends Component {
  render() {
    return (
      <main>
        {this.props.message}
      </main>
    );
  }
}

export default Panic
