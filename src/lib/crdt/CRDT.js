import md5 from 'md5'
import moment from 'moment'
import OrbitDB from 'orbit-db'
import PeerStar from 'peer-star-app'
import CID from 'cids'
import Fetcher from '../Fetcher'
import Auth from '../Auth'

class CRDTManager {
  constructor() {
    this.dbs = {}
    this.listening = {}
  }

  async getDB(dbName) {
    this.dbs[dbName] = this.dbs[dbName] || await this.createDB(dbName)
    return await this.dbs[dbName]
  }

  async onChange(dbName, cb) {
    if (this.listening[dbName]) return

    this.listening[dbName] = true
    const db = await this.getDB(dbName)
    this.addChangeListener(db, cb)
  }

  // Override
  createDB(dbName) {
  }

  // Override
  rows(dbName) {
  }

  // Override
  push(dbName, e) {
  }

  // Override
  addChangeListener(db, cb) {
  }
}

class OrbitDBManager extends CRDTManager {
  constructor() {
    super()
    this.orbitdb = new OrbitDB(window.ipfs)
  }

  async createDB(dbName) {
    const db = await this.orbitdb.log(dbName, { write: ['*'] })
    await db.load()
    return db
  }

  async rows(dbName) {
    const db = await this.getDB(dbName)
    const events = db.iterator({ limit: -1 }).collect()
    return events.map(e => e.payload.value)
  }

  async push(dbName, e) {
    const db = await this.getDB(dbName)
    return db.add(e)
  }


  async addChangeListener(db, cb) {
    db.events.on('write', cb)
    db.events.on('replicated', cb)
  }
}

class PeerStarManager extends CRDTManager {
  constructor() {
    super()
    this.app = PeerStar('IGiS', {
      ipfs: {
        swarm: [ '/dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star' ]
      }
    })
    this.app.on('error', (err) => {
      console.error('error in peer-star-app:', err)
    })
  }

  async getApp() {
    await this.app.start()
    return this.app
  }

  async createDB(dbName) {
    const app = await this.getApp()
    return app.collaborate(dbName, 'rga')
  }

  async rows(dbName) {
    const db = await this.getDB(dbName)
    return db.shared.value()
  }

  async push(dbName, e) {
    const db = await this.getDB(dbName)
    return db.shared.push(e)
  }

  async addChangeListener(db, cb) {
    db.on('state changed', cb)
  }
}

let _manager
function getCRDTManager() {
  _manager = _manager || new PeerStarManager()
  // _manager = _manager || new OrbitDBManager()
  return _manager
}

class PRListFetcher extends Fetcher {
  constructor(dbName, offsetCid, limit) {
    super()
    this.dbName = dbName
    this.offsetCid = offsetCid
    this.limit = limit
  }

  run() {
    return this.fetch()
  }

  async fetch() {
    let events = await getCRDTManager().rows(this.dbName)
    if (!this.running) return

    const i = events.findIndex(e => e['/'] === this.offsetCid)
    const offset = i >= 0 ? i : 0
    events = events.slice(offset, offset + this.limit)
    events = await RepoCrdt.fetchIpfsLinks(events)
    if (!this.running) return

    return events.map(e => new PullRequest(e.cid, new CID(e.author['/']), e.name, e.base, e.compare, e.createdAt))
  }
}

export class RepoCrdt {
  constructor(repoCid) {
    this.repoCid = repoCid
  }

  getPRCommentsDBName(prCid) {
    const dbName = 'test-' + this.repoCid + '-pr-' + prCid
    // TODO: OrbitDB throws 'non-base58 character'
    // https://github.com/orbitdb/orbit-db/issues/419
    return dbName.replace(/Qm/g, '')
  }

  getPRListDBName() {
    const dbName = 'test-' + this.repoCid + '-prs'
    // TODO: OrbitDB throws 'non-base58 character'
    // https://github.com/orbitdb/orbit-db/issues/419
    return dbName.replace(/Qm/g, '')
  }

  async newPR(base, compare, name, comment) {
    if (!name.trim()) {
      throw new Error('The Pull Request must have a title')
    }

    const author = await Auth.getUser()
    const pr = {
      createdAt: new Date(),
      author: { '/': author.cid.toBaseEncodedString() },
      name,
      base,
      compare
    }
    const prCid = (await window.ipfs.dag.put(pr)).toBaseEncodedString()
    const dbName = this.getPRListDBName()
    await getCRDTManager().push(dbName, { '/': prCid })

    if (!comment) return

    await this.newComment(prCid, comment)
    return PullRequest.fetch(prCid)
  }

  async newComment(prCid, text) {
    if (!text.trim()) {
      throw new Error('The comment cannot be blank')
    }

    const author = await Auth.getUser()
    const commentObj = {
      createdAt: new Date(),
      author: { '/': author.cid.toBaseEncodedString() },
      text
    }
    const commentCid = await window.ipfs.dag.put(commentObj)
    const dbName = this.getPRCommentsDBName(prCid)
    console.log('Adding comment %s to CRDT', commentCid.toBaseEncodedString(), commentObj)
    await getCRDTManager().push(dbName, { '/': commentCid.toBaseEncodedString() })
    console.log('Added')
  }

  fetchPRList(offsetCid, limit) {
    const dbName = this.getPRListDBName()
    const fetch = new PRListFetcher(dbName, offsetCid, limit)
    fetch.start()
    return fetch
  }

  onPRListChange(cb) {
    const dbName = this.getPRListDBName()
    getCRDTManager().onChange(dbName, cb)
  }

  async fetchPRComments(prCid) {
    const dbName = this.getPRCommentsDBName(prCid)
    let events = await getCRDTManager().rows(dbName)
    events = await RepoCrdt.fetchIpfsLinks(events)
    const merged = events.filter(e => !e.updateRef).map(e => [e])
    for (const e of events.filter(e => !!e.updateRef)) {
      const i = merged.findIndex(c => c[0].cid.equals(new CID(e.updateRef['/'])))
      if (i >= 0) {
        merged[i].push(e)
      }
    }
    merged.forEach(c => c.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()))
    return merged.map(m => {
      const updates = m.map(u => new CommentUpdate(u.text, u.createdAt))
      return new Comment(m[0].cid, new CID(m[0].author['/']), m[0].text, m[0].createdAt, updates)
    })
  }

  async onPRCommentsChange(prCid, cb) {
    const dbName = this.getPRCommentsDBName(prCid)
    getCRDTManager().onChange(dbName, cb)
  }

  static fetchIpfsLinks(rows) {
    return Promise.all(rows.map(async r => {
      const cid = r['/']
      const res = await window.ipfs.dag.get(cid).then(r => r.value)
      return Object.assign({}, res, { cid: new CID(cid) })
    }))
  }
}

export class PullRequest {
  constructor(cid, authorCid, name, base, compare, createdAt) {
    this.cid = cid
    this.authorCid = authorCid
    this.name = name
    this.base = base
    this.compare = compare
    this.createdAt = moment(createdAt)
  }

  async fetchAuthor() {
    this.author = this.author || (await User.fetch(this.authorCid))
    return this.author
  }

  static async fetch(cid) {
    const res = await window.ipfs.dag.get(cid)
    const val = res.value
    return new PullRequest(new CID(cid), new CID(val.author['/']), val.name, val.base, val.compare, val.createdAt)
  }
}

export class Comment {
  constructor(cid, authorCid, text, createdAt, updates) {
    this.cid = cid
    this.authorCid = authorCid
    this.text = text
    this.createdAt = moment(createdAt)
    this.updatedAt = updates[updates.length - 1].createdAt
    this.updates = updates
  }

  async fetchAuthor() {
    this.author = this.author || (await User.fetch(this.authorCid))
    return this.author
  }
}

export class CommentUpdate {
  constructor(text, createdAt) {
    this.text = text
    this.createdAt = moment(createdAt)
  }
}

export class User {
  constructor(cid, username, name, avatar) {
    this.cid = cid
    this.username = username
    this.name = name
    this.avatar = avatar
  }

  static async create({ username, name, avatar }) {
    if (!username) throw new Error('Username is required')

    const obj = { username }
    if (name) obj.name = name
    if (avatar) obj.avatar = avatar

    const cid = await window.ipfs.dag.put(obj)
    return new User(cid, obj.username, obj.name, obj.avatar)
  }

  getAvatar() {
    return User.getAvatarFromParams(this.avatar, this.username)
  }

  static getAvatarFromParams(avatar, username) {
    if (avatar) return avatar
    if (!username) return undefined

    const hash = md5(username)
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`
  }

  static async fetch(cid) {
    if (!cid) return undefined

    cid = new CID(cid) // make sure it's a CID (not a string)
    let userPromise = User.cacheGet(cid)
    if (userPromise) return (await userPromise)

    userPromise = new Promise(async a => {
      const res = await window.ipfs.dag.get(cid)
      const val = res.value
      a(new User(cid, val.username, val.name, val.avatar))
    })
    User.cacheSet(cid, userPromise)
    return (await userPromise)
  }

  // TODO: LRU
  static cacheSet(cid, userPromise) {
    User.cache = User.cache || {}
    User.cache[cid.toBaseEncodedString()] = userPromise
  }
  static cacheGet(cid) {
    return ((User.cache || {})[cid.toBaseEncodedString()])
  }
}
