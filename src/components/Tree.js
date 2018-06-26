import React from 'react'
import TreeItem from './TreeItem'
import LoadingComponent from './LoadingComponent'

function TreeContent(props) {
  return (
    <div className="Tree">
      {props.children}
    </div>
  )
}

class Tree extends LoadingComponent {
  isDataReady(props, state) {
    return !!(props.tree || {}).files
  }

  renderContent() {
    return (
      <TreeContent>
        {this.renderFiles(this.props.tree.files)}
      </TreeContent>
    )
  }

  renderFiles(files) {
    return files.sort(Tree.compareFiles).map(file =>
      <TreeItem key={file.name} repo={this.props.repo} tree={this.props.tree} file={file} />
    )
  }

  static compareFiles(a, b) {
    if(a.isDir() !== b.isDir()) {
      return a.isDir() ? -1 : 1;
    }
    if (a.name < b.name) {
      return -1;
    }
    if (a.name > b.name) {
      return 1;
    }

    return 0;
  }

  renderLoading() {
    const lengths = [...Array(Math.floor(3 + Math.random() * 3))].map(() => 2 + Math.random() * 10)
    return (
      <TreeContent>
        <div className="Loading">
          {lengths.map((l, i) => (
            <div className="item" key={i}>
              <div className="icon"></div>
              <div className="filename" style={{width: l + 'em'}}></div>
            </div>
          ))}
        </div>
      </TreeContent>
    )
  }
}

export default Tree
