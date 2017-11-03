package binding.highlightjs

import scala.scalajs.js

@js.native
trait HighlightOutput extends js.Object {
  val language: String = js.native
  val relevance: Int = js.native
  val value: String = js.native
  //top: ???
}
