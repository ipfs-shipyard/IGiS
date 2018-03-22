import React, { Component } from 'react';

class Menu extends Component {
  render() {
    return (
      <aside className="Menu bg-navy pa1">
        { this.props.children }
      </aside>
    );
  }
}

export default Menu
