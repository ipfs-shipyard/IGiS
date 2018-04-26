import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import Home from './components/Home'
import Repo from './components/Repo'
import Commit from './components/Commit'
import Commits from './components/Commits'
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
            <Route path="/repo/:repoCid/commits" component={Commits}/>
            <Route path="/repo/:repoCid" component={Repo}/>
            <Route path="/commit/:commitCid" component={Commit}/>
          </Switch>
        </main>
      </div>
    );
  }
}

export default App;
