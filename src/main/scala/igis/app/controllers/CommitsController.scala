package igis.app.controllers

import binding.git.GitCommit
import igis.mvc.{Controller, Node, Request, Response}
import org.scalajs.dom.Element
import org.scalajs.dom.raw.DOMParser

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.util.Success

class CommitsController extends Controller {
  def fetchCommits(rootCid: String, list: Element, depth: Int, node: Node): Future[Seq[GitCommit]] = {
    node.ipfs.dag.get(rootCid).flatMap{ res =>
      val commit = res.value.asInstanceOf[GitCommit]

      commit.parents.take(depth) //get at mont [depth] parents
        .map(p => fetchCommits(p.cid().toBaseEncodedString(), list, depth - commit.parents.length, node)) // fetch their subtrees
        .fold(Future.successful(Seq(commit))){ case (a, b) => a.flatMap(as => b.map(bs => as ++ bs))} //metge subtrees
    }
  }

  def apply(req: Request): Future[Response] = {
    val rootNode = new DOMParser().parseFromString(html.commits().toString(), "text/html").firstChild
    val commitList = rootNode.asInstanceOf[Element].getElementsByClassName("commits-root").asInstanceOf[Element]
    fetchCommits(req.remPath, commitList, 10, req.node).andThen{
      case Success(commits) =>
        commits.foreach(cm => println(cm.message))
    }

    Future.successful(Response.withElement(rootNode))
  }
}
