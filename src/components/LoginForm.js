import Avatar from './Avatar'
import Button from './Button'
import React, { Component } from 'react'
import Auth from '../lib/Auth'

class LoginForm extends Component {
  constructor(props) {
    super(props)
    this.state = {
      show: !this.props.loginCTA
    }
  }

  render() {
    if (!this.state.show) {
      return (
        <div className="LoginForm">
          <div className="cta">
            <Button isLink={true} onClick={() => this.setState({ show: true })}>{this.props.loginCTA}</Button>
          </div>
        </div>
      )
    }

    const avatarUser = {
      username: this.state.username,
      avatar: this.state.avatar
    }
    return (
      <div className={"LoginForm " + (this.props.dialog ? "dialog" : '')}>
        <div className="content">
          <div className="title">Create User</div>
          <Avatar user={avatarUser} />
          <div className="fields">
            <input type="text" placeholder="Username" onBlur={ e => this.setState({ username: e.target.value }) } />
            <input type="text" placeholder="Name (optional)" onBlur={ e => this.setState({ name: e.target.value }) } />
            <input type="text" placeholder="Avatar URL (optional)" onBlur={ e => this.setState({ avatar: e.target.value }) } />
            <div className="error">{this.state.error}</div>
            <div className="button-container">
              <Button onClick={this.handleCancel.bind(this)}>Cancel</Button>
              <Button isLink={true} onClick={this.handleSubmit.bind(this)}>Submit</Button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  handleCancel() {
    this.props.onCancel && this.props.onCancel()
    this.setState({ show: !this.props.loginCTA })
  }

  handleSubmit() {
    const props = {
      username: this.state.username,
      name: this.state.name,
      avatar: this.state.avatar
    }
    Auth.login(props).catch(e => {
      this.setState({ error: e.message })
      setTimeout(() => this.setState({ error: '' }), 2000)
    })
  }
}

export default LoginForm
