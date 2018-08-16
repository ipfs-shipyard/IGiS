import React from 'react'
import CommitDiffList from './CommitDiffList'
import CommitTitle from './CommitTitle'
import IGComponent from './IGComponent'
import Url from '../lib/Url'
import GitRepo from '../lib/git/GitRepo'

class Commits extends IGComponent {
  constructor(props) {
    super(props)
    this.state = {}

    const pathname = this.props.location.pathname
    const url = Url.parseCommitPath(pathname)
    this.repoCid = url.repoCid
    this.commitCid = url.commitCid
  }

  componentDidMount() {
    this.triggerPromises([
      [() => GitRepo.fetch(this.repoCid), false, 'repo'],
      [repo => repo.getObject(this.commitCid), false, 'commit'],
      [commit => commit.fetchDiff(), false, 'changes']
    ])
  }

  render() {
    return (
      <div className="Commit">
        <CommitTitle commit={this.state.commit} />
        <CommitDiffList changes={this.state.changes} />
      </div>
    )
  }
}

export default Commits
