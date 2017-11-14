package igis.app.controllers

import binding.git.GitCommit
import binding.ipld.GitFile
import eu.devtty.cid.CID
import igis.mvc.{Controller, Node, Request, Response}
import igis.util.{Debug, TimeUtil}
import models.{TitlePart, Tree}

import scala.concurrent.Future
import scala.concurrent.ExecutionContext.Implicits.global
import scala.scalajs.js
import scala.util.Success

class RepoController extends Controller {
  def titlePath(path: String): Seq[TitlePart] = {
    val parts = path.split("/")
    val urls = parts.foldLeft(Seq[String](""))((prev, cur) => prev ++ Seq(s"${prev.last}/$cur")).drop(1)


    parts.zip(urls).map{case (part, url) => TitlePart(part, s"#/tree$url")}
  }

  def commitInfo(path: String, node: Node): Future[GitCommit] = {
    node.ipfs.dag.get(path.split("/").head).map(n => n.value.asInstanceOf[GitCommit])
  }

  def readme(root: String, node: Node): Future[String] = {
    //TODO: use .tree, detect readme names
    BlobController.rawBlob(s"$root/tree/README.md/hash", node)
  }

  def repoTitle(readme: String, path: String): Seq[TitlePart] = {
    val hashIndent = """#+\s+(.+)$""".r

    val headLine = readme.lines.next()

    //TODO: Add more cases such as `title\n======\n`
    headLine match {
      case hashIndent(title) => Seq(TitlePart(title, s"#/tree/$path"))
      case _ => titlePath(path)
    }



  }

  def apply(req: Request): Future[Response] = {
    val maybeReadme = readme(req.remPath, req.node)

    Tree.files(req.remPath, req.node).zip(commitInfo(req.remPath, req.node)).flatMap { case (files, info) =>
      val cid = new CID(req.remPath.split("/").head)
      val hash = cid.buffer.slice(cid.prefix.length).toHexString
      val msg = info.message.lines.next()
      val date = TimeUtil.gitTimeToDate(info.author.date).toDateString()

      maybeReadme.map { readmeData =>
        val title = repoTitle(readmeData, req.remPath)

        Response.withData(html.repo(files, title, req.remPath, hash, msg, date, readmeData).toString())
      }
    }
  }
}
