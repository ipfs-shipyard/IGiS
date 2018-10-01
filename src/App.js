import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import Home from './components/Home'
import Repo from './components/Repo'
import Commit from './components/Commit'
import Commits from './components/Commits'
import Compare from './components/Compare'
import PullRequest from './components/PullRequest'
import PullRequests from './components/PullRequests'
import Panic from './components/Panic'
import StatusBar from "./components/StatusBar";
import NewRepo from "./components/NewRepo";

class App extends Component {
  render() {
    if(!window.ipfs) {
      return (
        <Panic message="No window.ipfs available, install ipfs-companion and enable it!" />
      )
    }

    return (
      <div className="App sans-serif">
        <header>
          <StatusBar/>
        </header>
        <main>
          <Switch>
            <Route exact path="/" component={Home}/>
            <Route exact path="/new/repo" component={NewRepo}/>
            <Route path="/repo/:repoCid/commit/:commitCid" component={Commit}/>
            <Route path="/repo/:repoCid/commits/:branch" component={Commits}/>
            <Route path="/repo/:repoCid/compare/:branch...:branch" component={Compare}/>
            <Route path="/repo/:repoCid/pulls" component={PullRequests}/>
            <Route path="/repo/:repoCid/pull/:prid" component={PullRequest}/>
            <Route path="/repo/:repoCid" component={Repo}/>
          </Switch>
        </main>
      </div>
    );
  }
}

export default App;
