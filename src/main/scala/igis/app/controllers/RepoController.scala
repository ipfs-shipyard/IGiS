package igis.app.controllers

import eu.devtty.cid.CID
import igis.mvc.{Controller, Request, Response}
import models.{TitlePart, Tree}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global

class RepoController extends Controller {
  def titlePath(path: String): Seq[TitlePart] = {
    val parts = path.split("/")
    val urls = parts.foldLeft(Seq[String](""))((prev, cur) => prev ++ Seq(s"${prev.last}/$cur")).drop(1)


    parts.zip(urls).map{case (part, url) => TitlePart(part, s"#/tree$url")}
  }


  def apply(req: Request): Future[Response] = {
    Tree.files(req.remPath, req.node).map { files =>
      val cid = new CID(req.remPath.split("/").head)
      val hash = cid.buffer.slice(cid.prefix.length).toHexString

      Response.withData(html.repo(files, titlePath(req.remPath), req.remPath, hash).toString())
    }
  }
}
