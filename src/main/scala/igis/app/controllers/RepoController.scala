package igis.app.controllers

import binding.git.GitCommit
import eu.devtty.cid.CID
import igis.mvc.{Controller, Node, Request, Response}
import igis.util.{Debug, TimeUtil}
import models.{TitlePart, Tree}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import scala.scalajs.js

class RepoController extends Controller {
  def titlePath(path: String): Seq[TitlePart] = {
    val parts = path.split("/")
    val urls = parts.foldLeft(Seq[String](""))((prev, cur) => prev ++ Seq(s"${prev.last}/$cur")).drop(1)


    parts.zip(urls).map{case (part, url) => TitlePart(part, s"#/tree$url")}
  }

  def commitInfo(path: String, node: Node): Future[GitCommit] = {
    node.ipfs.dag.get(path.split("/").head).map(n => n.value.asInstanceOf[GitCommit])
  }

  def apply(req: Request): Future[Response] = {
    Tree.files(req.remPath, req.node).zip(commitInfo(req.remPath, req.node)).map { case (files, info) =>
      val cid = new CID(req.remPath.split("/").head)
      val hash = cid.buffer.slice(cid.prefix.length).toHexString
      Debug.jsPrint(info)
      val msg = info.message.lines.next()
      val date = TimeUtil.gitTimeToDate(info.author.date).toDateString()

      Response.withData(html.repo(files, titlePath(req.remPath), req.remPath, hash, msg, date).toString())
    }
  }
}
