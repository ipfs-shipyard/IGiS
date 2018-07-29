import md5 from 'md5'
import moment from 'moment'
import OrbitDB from 'orbit-db'
import CID from 'cids'
import Fetcher from '../Fetcher'

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

class PRListFetcher extends Fetcher {
  constructor(repoCid, orbitdb, offsetCid, limit) {
    super()
    this.repoCid
    this.orbitdb = orbitdb
    this.offsetCid = offsetCid
    this.limit = limit
  }

  run() {
    return this.fetch()
  }

  async fetch() {
    // TODO: Throws 'non-base58 character'
    // https://github.com/orbitdb/orbit-db/issues/419
    // const dbName = this.repoCid + '-pulls'
    const dbName = 'orbit-db.igis.pulls-test-5'
    const db = await this.orbitdb.log(dbName, { write: ['*'] })
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
    this.orbitdb = new OrbitDB(window.ipfs)
  }

  fetchPRList(offsetCid, limit) {
    const fetch = new PRListFetcher(this.repoCid, this.orbitdb, offsetCid, limit)
    fetch.start()
    return fetch
  }

  async fetchPRComments(pullCid) {
    // TODO: Throws 'non-base58 character'
    // https://github.com/orbitdb/orbit-db/issues/419
    // const dbName = this.repoCid + '-pull-' + pullCid
    const dbName = 'orbit-db.igis.comments-test-5'
    const db = await this.orbitdb.log(dbName, { write: ['*'] })
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
  constructor(username, name, avatar) {
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
    const res = await window.ipfs.dag.get(cid)
    const val = res.value
    return new User(val.username, val.name, val.avatar)
  }
}
