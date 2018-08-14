import EventEmitter from 'events'
import { User } from './crdt/CRDT'

const LOCAL_STORAGE_KEY = 'igis.user.cid'

class Auth extends EventEmitter {
  constructor() {
    super()
    // Preload
    this.userPromise = this.fetchUser()
  }

  loggedIn() {
    return !!localStorage.getItem(LOCAL_STORAGE_KEY)
  }

  async getUser() {
    this.userPromise = this.userPromise || this.fetchUser()
    return (await this.userPromise)
  }

  fetchUser() {
    const cid = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (!cid) return null

    return User.fetch(cid)
  }

  async login(props) {
    const user = await User.create(props)
    localStorage.setItem(LOCAL_STORAGE_KEY, user.cid.toBaseEncodedString())
    this.emit('login', user)
    return user
  }
}

const singleton = new Auth()
export default singleton
