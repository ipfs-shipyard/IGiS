package igis.util

import scala.scalajs.js

object TimeUtil {

  def gitTimeToDate(line: String): js.Date = {
    val parts = line.split(" ")
    new js.Date(parts.head.toLong * 1000L)
  }
}
