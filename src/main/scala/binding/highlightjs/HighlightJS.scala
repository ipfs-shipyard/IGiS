package binding.highlightjs

import scala.scalajs.js
import scala.scalajs.js.annotation.JSImport

@js.native
@JSImport("highlight.js", JSImport.Namespace)
object HighlightJS extends js.Object {
  //http://highlightjs.readthedocs.io/en/latest/api.html

  def initHighlightingOnLoad(): Unit = js.native
  def highlightAuto(value: String, languageSubset: js.UndefOr[js.Array[String]] = js.undefined): HighlightOutput = js.native
}
