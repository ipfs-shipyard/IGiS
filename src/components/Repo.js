import React, { Component } from 'react';
import { Link } from 'react-router-dom'
import Tree from "./Tree";
import Menu from "./Menu";
import MenuEntry from "./MenuEntry";
import WithMenu from "./WithMenu";

class Repo extends Component {
  render() {
    const { match: { params } } = this.props;

    return (
      <WithMenu>
        <Menu>
          <MenuEntry><Link to="/">Home</Link></MenuEntry>
          <MenuEntry><Link to={"/repo/" + params.repoCid}>Tree Root</Link></MenuEntry>
        </Menu>
        <main>
          <Tree path={params.repoCid}/>
        </main>
      </WithMenu>
    );
  }
}

export default Repo
