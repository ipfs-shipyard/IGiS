package binding.git

import binding.ipld.CIDBuf

import scala.scalajs.js

@js.native
trait GitCommit extends js.Object {
  val message: String = js.native

  val tree: CIDBuf = js.native
  val parents: js.Array[CIDBuf] = js.native

  val author: PersonInfo = js.native
  val commit: PersonInfo = js.native
}


