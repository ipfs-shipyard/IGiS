package igis.app.controllers

import binding.highlightjs.HighlightJS
import binding.smartbuffer.SmartBuffer
import igis.App
import igis.mvc.{Controller, Node, Request}
import io.scalajs.nodejs.buffer.Buffer
import models.TreeFile
import play.twirl.api.Html

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class BlobController extends Controller {
  def blob(path: String, node: Node): Future[String] ={
    val parts = path.split("/")
    val root = parts.head

    val ipldPath = parts.drop(1).map(p => s"$p/hash").mkString("/")
    App.node.ipfs.dag.get(s"$root/tree/$ipldPath").map {o =>
      val buf = o.value.asInstanceOf[Buffer]

      val sbuf = SmartBuffer.fromBuffer(buf)
      val header = sbuf.readStringNT()
      if(!header.startsWith("blob ")) {
        throw new Exception("Invalid blob object!")
      }

      //Todo - ret size
      sbuf.readString()
    }
  }

  def apply(req: Request): Future[String] = {
    blob(req.remPath, req.node).map { data =>
      val highlighted = HighlightJS.highlightAuto(data)

      html.blob(Html(highlighted.value), req.remPath).toString()
    }
  }
}
