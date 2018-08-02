import md5 from 'md5'
import moment from 'moment'
import OrbitDB from 'orbit-db'
import CID from 'cids'
import Fetcher from '../Fetcher'
import EventEmitter from 'events'

async function storeMockUserData() {
  const user1 = {
    username: 'dirkmc'
  }
  const user2 = {
    username: 'magik6k',
    name: 'Łukasz Magiera',
    avatar: 'https://avatars2.githubusercontent.com/u/3867941'
  }
  const user1Cid = (await window.ipfs.dag.put(user1, { format: 'dag-cbor' })).toBaseEncodedString()
  const user2Cid = (await window.ipfs.dag.put(user2, { format: 'dag-cbor' })).toBaseEncodedString()
  return [user1Cid, user2Cid]
}

async function storeMockPRListData(db) {
  const [user1Cid, user2Cid] = await storeMockUserData()
  const prs = [{
    author: { '/': user2Cid },
    name: 'Example PR to test out rendering',
    base: {
      repo: 'QmU1HJJDFSM8JJq4r31wSLfj51oysQCswz7aL78UWZHuMC',
      ref: 'refs/heads/master'
    },
    compare: {
      repo: 'QmU1HJJDFSM8JJq4r31wSLfj51oysQCswz7aL78UWZHuMC',
      ref: 'refs/heads/feat/coreapi/swarm'
    },
    createdAt: new Date("2016-05-24T14:45:53.292Z")
  }, {
    author: { '/': user1Cid },
    name: 'Another example PR',
    base: {
      repo: 'QmU1HJJDFSM8JJq4r31wSLfj51oysQCswz7aL78UWZHuMC',
      ref: 'refs/heads/master'
    },
    compare: {
      repo: 'QmU1HJJDFSM8JJq4r31wSLfj51oysQCswz7aL78UWZHuMC',
      ref: 'refs/heads/feat/coreapi/swarm'
    },
    createdAt: new Date("2017-07-24T14:45:53.292Z")
  }, {
    author: { '/': user2Cid },
    name: 'A third example PR',
    base: {
      repo: 'QmU1HJJDFSM8JJq4r31wSLfj51oysQCswz7aL78UWZHuMC',
      ref: 'refs/heads/master'
    },
    compare: {
      repo: 'QmU1HJJDFSM8JJq4r31wSLfj51oysQCswz7aL78UWZHuMC',
      ref: 'refs/heads/feat/coreapi/swarm'
    },
    createdAt: new Date("2018-07-24T14:45:53.292Z")
  }, {
    author: { '/': user1Cid },
    name: 'One more example PR',
    base: {
      repo: 'QmU1HJJDFSM8JJq4r31wSLfj51oysQCswz7aL78UWZHuMC',
      ref: 'refs/heads/master'
    },
    compare: {
      repo: 'QmU1HJJDFSM8JJq4r31wSLfj51oysQCswz7aL78UWZHuMC',
      ref: 'refs/heads/feat/coreapi/swarm'
    },
    createdAt: new Date("2018-07-25T14:45:53.292Z")
  }, {
    author: { '/': user1Cid },
    name: 'Another PR example here at the end of the list',
    base: {
      repo: 'QmU1HJJDFSM8JJq4r31wSLfj51oysQCswz7aL78UWZHuMC',
      ref: 'refs/heads/master'
    },
    compare: {
      repo: 'QmU1HJJDFSM8JJq4r31wSLfj51oysQCswz7aL78UWZHuMC',
      ref: 'refs/heads/feat/coreapi/swarm'
    },
    createdAt: new Date("2018-07-26T14:45:53.292Z")
  }]

  const cids = await Promise.all(prs.map(pr => window.ipfs.dag.put(pr, { format: 'dag-cbor' })))
  for (let cid of cids) {
    await db.add({ '/': cid.toBaseEncodedString() })
  }
}

async function storeMockPRCommentsData(db) {
  const [user1Cid, user2Cid] = await storeMockUserData()

  async function add(c) {
    const cid = await window.ipfs.dag.put(c, { format: 'dag-cbor' })
    await db.add({ '/': cid.toBaseEncodedString() })
    return cid.toBaseEncodedString()
  }
  const cidC0 = await add({ author: { '/': user1Cid }, text: 'This is my first issue comment', createdAt: new Date("2018-07-24T14:45:53.292Z") })
  await add({ author: { '/': user2Cid }, text: 'Hello there, this is my reply to the first comment', createdAt: new Date("2018-07-24T15:45:53.292Z") })
  await add({ author: { '/': user1Cid }, text: 'This is my updated first issue comment', updateRef: { '/': cidC0 }, createdAt: new Date("2018-07-24T16:45:53.292Z") })
  await add({ author: { '/': user1Cid }, text: 'This is my second comment', createdAt: new Date("2018-07-24T17:45:53.292Z") })
  await add({ author: { '/': user2Cid }, text: 'This is my reply to the second comment', createdAt: new Date("2018-07-24T18:45:53.292Z") })
}

class OrbitDBManager extends EventEmitter {
  constructor() {
    super()
    this.orbitdb = new OrbitDB(window.ipfs)
    this.dbs = {}
    this.listening = {}
  }

  getDB(dbName) {
    this.dbs[dbName] = this.dbs[dbName] || this.orbitdb.log(dbName, { write: ['*'] })
    return this.dbs[dbName]
  }

  async onChange(dbName, fetchFn, cb) {
    if (this.listening[dbName]) return

    this.listening[dbName] = true

    const db = await this.getDB(dbName)
    await db.load()

    // Trigger event when change comes from local or remote peer
    function onTriggered () {
      fetchFn().then(cb)
    }
    db.events.on('write', onTriggered)
    db.events.on('replicated', onTriggered)
  }
}

let _orbitManager
function getOrbitManager() {
  _orbitManager = _orbitManager || new OrbitDBManager()
  return _orbitManager
}

class PRListFetcher extends Fetcher {
  constructor(orbitLog, offsetCid, limit) {
    super()
    this.orbitLog = orbitLog
    this.offsetCid = offsetCid
    this.limit = limit
  }

  run() {
    return this.fetch()
  }

  async fetch() {
    const db = await this.orbitLog
    await db.load()
    if (!this.running) return

    let events = await db.iterator({ limit: -1 }).collect()
    if (!events.length) {
      await storeMockPRListData(db)
      events = await db.iterator({ limit: -1 }).collect()
    }
    if (!this.running) return

    const i = events.findIndex(e => e.payload.value['/'] === this.offsetCid)
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
    // TODO: Throws 'non-base58 character'
    // https://github.com/orbitdb/orbit-db/issues/419
    // const dbName = this.repoCid + '-pull-' + prCid
    return 'orbit-db.igis.comments-test-7'
  }

  getPRListDBName() {
    // TODO: Throws 'non-base58 character'
    // https://github.com/orbitdb/orbit-db/issues/419
    // const dbName = this.repoCid + '-pulls'
    return 'orbit-db.igis.pulls-test-7'
  }

  async newPR(base, compare, name, comment) {
    if (!name.trim()) {
      throw new Error('The Pull Request must have a title')
    }

    const author = await User.loggedInUser()
    const pr = {
      createdAt: new Date(),
      author: { '/': author.cid.toBaseEncodedString() },
      name,
      base,
      compare
    }
    const prCid = await window.ipfs.dag.put(pr, { format: 'dag-cbor' })
    const dbName = this.getPRListDB()
    const db = await getOrbitManager().getDB(dbName)
    await db.load()
    await db.add({ '/': prCid.toBaseEncodedString() })

    if (!comment) return

    return this.newComment(prCid, comment)
  }

  async newComment(prCid, text) {
    if (!text.trim()) {
      throw new Error('The comment cannot be blank')
    }

    const author = await User.loggedInUser()
    const commentObj = {
      createdAt: new Date(),
      author: { '/': author.cid.toBaseEncodedString() },
      text
    }
    const commentCid = await window.ipfs.dag.put(commentObj, { format: 'dag-cbor' })
    const dbName = this.getPRCommentsDBName()
    const db = await getOrbitManager().getDB(dbName)
    await db.load()
    await db.add({ '/': commentCid.toBaseEncodedString() })
  }

  fetchPRList(offsetCid, limit) {
    const fetch = new PRListFetcher(this.getPRListDB(), offsetCid, limit)
    fetch.start()
    return fetch
  }

  async fetchPRComments(prCid) {
    const dbName = this.getPRCommentsDBName()
    const db = await getOrbitManager().getDB(dbName)
    await db.load()

    let events = await db.iterator({ limit: -1 }).collect()
    if (!events.length) {
      await storeMockPRCommentsData(db)
      events = await db.iterator({ limit: -1 }).collect()
    }

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
    const dbName = this.getPRCommentsDBName()
    getOrbitManager().onChange(dbName, () => this.fetchPRComments(prCid), cb)
  }

  getPRCommentsEventName(prCid) {
    return `event-repo-${this.repoCid}-pull-${prCid}-comments`
  }

  static fetchIpfsLinks(rows) {
    return Promise.all(rows.map(async r => {
      const cid = r.payload.value['/']
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

  getAvatar() {
    if (this.avatar) return this.avatar

    const hash = md5(this.username)
    return `https://www.gravatar.com/avatar/${hash}?d=identicon`
  }

  static async fetch(cid) {
    cid = new CID(cid) // make sure it's a CID (not a string)
    let user = User.cacheGet(cid)
    if (user) return (await user)

    user = new Promise(async a => {
      const res = await window.ipfs.dag.get(cid)
      const val = res.value
      a(new User(cid, val.username, val.name, val.avatar))
    })
    User.cacheSet(cid, user)
    return (await user)
  }

  // TODO
  static async loggedInUser() {
    const [,cid] = await storeMockUserData()
    return User.fetch(cid)
  }

  // TODO: LRU
  static cacheSet(cid, user) {
    User.cache = User.cache || {}
    User.cache[cid.toBaseEncodedString()] = user
  }
  static cacheGet(cid) {
    return ((User.cache || {})[cid.toBaseEncodedString()])
  }
}
