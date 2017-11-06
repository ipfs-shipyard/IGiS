package binding.ipld

import eu.devtty.cid.CID
import io.scalajs.nodejs.buffer.Buffer

import scala.scalajs.js

@js.native
trait CIDBuf extends js.Object {
  val `/`: Buffer = js.native
}

object CIDBuf {
  implicit class CIDBufEx(cidBuf: CIDBuf) {
    def cid(): CID = {
      new CID(cidBuf.`/`)
    }
  }
}
