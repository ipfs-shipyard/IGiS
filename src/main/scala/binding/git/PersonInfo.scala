package binding.git

import scala.scalajs.js

@js.native
trait PersonInfo extends js.Object {
  val name: String = js.native
  val email: String = js.native
  val date: String = js.native
}
