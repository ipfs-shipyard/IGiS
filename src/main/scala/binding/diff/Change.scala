package binding.diff

import scala.scalajs.js

@js.native
trait Change extends js.Object {
  val value: String = js.native
  val added: Boolean = js.native
  val removed: Boolean = js.native
}
