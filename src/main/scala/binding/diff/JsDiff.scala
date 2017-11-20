package binding.diff

import scala.scalajs.js
import scala.scalajs.js.annotation.JSImport

@js.native
@JSImport("diff", JSImport.Namespace)
object JsDiff extends js.Object {
  // https://github.com/kpdecker/jsdiff#jsdiff

  def diffLines(oldStr: String, newStr: String): js.Array[Change] = js.native
  def createPatch(fileName: String, oldStr: String, newStr: String, oldHeader: String, newHeader: String): String = js.native
}
