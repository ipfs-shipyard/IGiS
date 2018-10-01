import Auth from '../lib/Auth'
import IGComponent from './IGComponent'
import LoginForm from './LoginForm'
import React from 'react'

class AuthRequired extends IGComponent {
  constructor(props) {
    super(props)
    this.state = {}
  }

  componentDidMount() {
    super.componentDidMount()

    const onGotUser = user => this.runThen(user, 'user')
    Auth.loggedIn() ? Auth.getUser().then(onGotUser) : Auth.on('login', onGotUser)
  }

  componentWillUnmount() {
    super.componentWillUnmount()
    Auth.removeAllListeners('login')
  }

  render() {
    if(this.state.user) {
      return React.cloneElement(this.props.children, { author: this.state.user })
    }
    if (Auth.loggedIn()) {
      // If the user is logged in, just show nothing while we wait for
      // the user to load
      return null
    }
    return <LoginForm {...this.props} />
  }
}

export default AuthRequired
