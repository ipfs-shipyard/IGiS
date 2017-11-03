package igis.app.controllers

import binding.highlightjs.HighlightJS
import binding.smartbuffer.SmartBuffer
import igis.App
import igis.mvc.{Controller, Node, Request}
import io.scalajs.nodejs.buffer.Buffer
import models.TitlePart
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

  def titlePath(path: String): Seq[TitlePart] = {
    val parts = path.split("/")
    val partialUrls = parts.foldLeft(Seq[String](""))((prev, cur) => prev ++ Seq(s"${prev.last}/$cur")).drop(1)
    val urls = partialUrls.dropRight(1).map(url => s"#/tree$url") ++ Seq(s"#/blob${partialUrls.last}")

    parts.zip(urls).map{case (part, url) => TitlePart(part, url)}
  }

  def apply(req: Request): Future[String] = {
    blob(req.remPath, req.node).map { data =>
      val highlighted = HighlightJS.highlightAuto(data)

      html.blob(Html(highlighted.value), titlePath(req.remPath)).toString()
    }
  }
}
