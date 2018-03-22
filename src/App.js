import React, { Component } from 'react'
import { Switch, Route } from 'react-router-dom'
import Home from './components/Home'
import Repo from './components/Repo'
import Panic from './components/Panic'
import StatusBar from "./components/StatusBar";

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
            <Route path="/repo/:repoCid" component={Repo}/>
          </Switch>
        </main>
      </div>
    );
  }
}

export default App;
