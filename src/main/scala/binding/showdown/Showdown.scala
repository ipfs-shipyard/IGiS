package binding.showdown

import scala.scalajs.js
import scala.scalajs.js.annotation.JSImport

@js.native
@JSImport("showdown", "Converter")
class Showdown extends js.Object {
  def makeHtml(text: String): String = js.native
}