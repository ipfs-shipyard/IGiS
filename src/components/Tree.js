import React, { Component } from 'react';

class Tree extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    let parts = this.props.path.split('/')
    let cid = parts[0]
    parts.shift()

    let self = this
    window.ipfs.dag.get(`${cid}/tree/${parts.join('/')}`).then(files => {
      self.setState({files: files})
    })
  }

  render() {
    if(!this.state.files) {
      return <div>Loading</div>
    }

    return (
      <div>
        {this.renderFiles()}
      </div>
    )
  }

  renderFiles() {
    return Object.keys(this.state.files.value).map(file =>
      <div>
        > {file}
      </div>
    )
  }
}

export default Tree
