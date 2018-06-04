import React, { Component } from 'react'
import Highlight from 'react-highlight'

class NewRepo extends Component {
  render() {
    return (
      <span className="NewRepo">
        <p>Creating new repository</p>

        <h3>0. Note that these instructions are outdated</h3>

        <p>1. Install <a href="https://ipfs.io/docs/install/">go-ipfs</a> and <a href="https://github.com/magik6k/git-remote-ipld">git-remote-ipld</a></p>

        <p>2. Setup git plugin for go-ipfs, see <a href="https://github.com/ipfs/go-ipfs/blob/master/docs/plugins.md">this guide</a></p>

        <p>3. Initialize new repository</p>
        <Highlight className="sh">{
`$ git init
Initialized empty Git repository in [...]/.git/`
        }</Highlight>

        <p>4. Add and commit some files</p>
        <Highlight className="sh">{
`$ echo hello world > README.md
Initialized empty Git repository in [...]/.git/

$ git add README.md

$ git commit -m "Initial commit"
[master (root-commit) 882dca6] Initial commit
 1 file changed, 1 insertion(+)
 create mode 100644 README.md`
        }</Highlight>

        <p>5. Push to IPFS!</p>
        <Highlight className="sh">{
`$ git push ipld:: master
Processsing tasks
push: 3/3 3b18e512dba79e4c8300dd08aeb37f8e728b8dad z8mWaG3QEPogCJCjUTK7GQsmMjjQZEwPr
Pushed to IPFS as ipld::882dca602648861fbb2a1b9e68c5aa3ad2ee3008
Head CID is z8mWaH7gkboMYf4k222wgMdYNzbvfnmL3
To ipld::
 * [new branch]      master -> master
`
        }</Highlight>

        <p>6. Go to your repo!</p>
        <p>Copy the Head CID (z8mWa..) and go to #/repo/[head cid] (see demo tree url)</p>

        {/*TODO: Link creator*/}
        {/*TODO/IPNS: It will be a bit different for ipns repos*/}

      </span>
    );
  }
}

export default NewRepo
