import React, { Component } from 'react';

class MenuEntry extends Component {
  render() {
    return (
      <div className="MenuEntry">{ this.props.children }</div>
    );
  }
}

export default MenuEntry
