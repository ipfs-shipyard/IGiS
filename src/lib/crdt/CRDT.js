import md5 from 'md5'
import moment from 'moment'
import OrbitDB from 'orbit-db'

async function storeMockData(db) {
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
  const h1 = await db.add({ author: { '/': user1Cid }, text: 'This is my first issue comment', createdAt: new Date("2018-07-24T14:45:53.292Z") })
  await db.add({ author: { '/': user2Cid }, text: 'Hello there, this is my reply to the first comment', createdAt: new Date("2018-07-24T15:45:53.292Z") })
  await db.add({ author: { '/': user1Cid }, text: 'This is my updated first issue comment', updateRef: h1, createdAt: new Date("2018-07-24T16:45:53.292Z") })
  await db.add({ author: { '/': user1Cid }, text: 'This is my second comment', createdAt: new Date("2018-07-24T17:45:53.292Z") })
  await db.add({ author: { '/': user2Cid }, text: 'This is my reply to the second comment', createdAt: new Date("2018-07-24T18:45:53.292Z") })
}

export class Repo {
  constructor(cid) {
    this.cid = cid
    this.orbitdb = new OrbitDB(window.ipfs)
  }

  pullRequest(cid) {
    return new PullRequest(this, cid)
  }
}

export class PullRequest {
  constructor(repo, pullCid) {
    this.repo = repo
    this.pullCid = pullCid
  }

  async fetchComments() {
    // TODO: Throws 'non-base58 character'
    // https://github.com/orbitdb/orbit-db/issues/419
    // const dbName = 'PR-' + this.repo.cid + '-' + this.pullCid
    const dbName = 'orbit-db.issues.test14'
    const db = await this.repo.orbitdb.log(dbName, { write: ['*'] })
    await db.load()
    let events = await db.iterator({ limit: -1 }).collect()
    if (!events.length) {
      await storeMockData(db)
      events = await db.iterator({ limit: -1 }).collect()
    }

    events = events.map(e => Object.assign({}, e.payload.value, { hash: e.hash }))
    const merged = events.filter(e => !e.updateRef).map(e => [e])
    for (const e of events.filter(e => !!e.updateRef)) {
      const i = merged.findIndex(c => c[0].hash === e.updateRef)
      if (i >= 0) {
        merged[i].push(e)
      }
    }
    merged.forEach(c => c.sort(u => u.createdAt).reverse())

    return merged.map(m => {
      const updates = m.map(u => new CommentUpdate(u.text, u.createdAt))
      return new Comment(m[0].hash, m[0].text, m[0].createdAt, m[0].author['/'], updates)
    })
  }
}

export class Comment {
  constructor(hash, text, createdAt, authorCid, updates) {
    this.hash = hash
    this.text = text
    this.createdAt = moment(createdAt)
    this.updatedAt = updates[updates.length - 1].createdAt
    this.authorCid = authorCid
    this.updates = updates
  }

  async fetchAuthor() {
    if (!this.author) {
      const res = await window.ipfs.dag.get(this.authorCid)
      const val = res.value
      this.author = new User(val.username, val.name, val.avatar)
    }
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
}
