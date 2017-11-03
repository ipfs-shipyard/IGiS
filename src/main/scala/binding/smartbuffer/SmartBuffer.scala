package binding.smartbuffer

import io.scalajs.nodejs.buffer.Buffer

import scala.scalajs.js
import scala.scalajs.js.annotation.JSImport

@js.native
@JSImport("smart-buffer", "SmartBuffer")
class SmartBuffer extends js.Object {
  def readStringNT(encoding: String = "utf8"): String = js.native
  def readString(encoding: String = "utf8"): String = js.native

  //TODO: rest of the methods
  //https://www.npmjs.com/package/smart-buffer
}

@js.native
@JSImport("smart-buffer", "SmartBuffer")
object SmartBuffer extends js.Object {
  def fromBuffer(buffer: Buffer, enc: String = "utf8"): SmartBuffer = js.native
}

