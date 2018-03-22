import React, { Component } from 'react';

class WithMenu extends Component {
  render() {
    return (
      <div className="WithMenu">
        {this.props.children}
      </div>
    );
  }
}

export default WithMenu
