package igis.util

import scala.scalajs.js

object Debug {
  def jsPrint(o: js.Dynamic): Unit = {
    js.Dynamic.global.console.log(o)
  }

  def jsPrint(o: Any): Unit = {
    js.Dynamic.global.console.log(o.asInstanceOf[js.Dynamic])
  }
}
