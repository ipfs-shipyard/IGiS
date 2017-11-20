package igis.app.controllers

import binding.diff.JsDiff
import binding.git.GitCommit
import binding.highlightjs.HighlightJS
import igis.mvc.{Controller, Node, Request, Response}
import igis.util.GitDiff
import igis.util.HtmlDom._
import org.scalajs.dom
import org.scalajs.dom.raw.DOMParser

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future

class CommitController extends Controller {
  lazy val template = html.commit().template

  def commitInfo(path: String, node: Node): Future[GitCommit] = {
    node.ipfs.dag.get(path.split("/").head).map(n => n.value.asInstanceOf[GitCommit])
  }

  def diff(head: GitCommit, node: Node): Future[Seq[Future[(String, String)]]] = {
    val parentTree = s"${head.parents(0).cid().toBaseEncodedString()}/tree"
    val headTree = head.tree.cid().toBaseEncodedString()

    new GitDiff(node).compareTrees(parentTree, headTree).map(_.map {
      case GitDiff.FileAddition(name, file) =>
        BlobController.rawBlob(file.hash.cid().toBaseEncodedString(), node).map{ f =>
          (name, JsDiff.createPatch(name, "", f, "", ""))
        }
      case GitDiff.FileDeletion(name, file) =>
        BlobController.rawBlob(file.hash.cid().toBaseEncodedString(), node).map{ f =>
          (name, JsDiff.createPatch(name, f, "", "", ""))
        }
      case GitDiff.FileChange(name, base, head) =>
        BlobController.rawBlob(base.hash.cid().toBaseEncodedString(), node).zip(BlobController.rawBlob(head.hash.cid().toBaseEncodedString(), node)).map{ case (b, h) =>
          (name, JsDiff.createPatch(name, b, h, "", ""))
        }
    })
  }

  def apply(req: Request): Future[Response] = {
    val builder = template.builder

    commitInfo(req.remPath, req.node).map{ head =>
      if(head.parents.length != 0) {
        diff(head, req.node).map{ elems =>
          builder.setMultiple[Future[(String, String)]]("commit-diff", elems, { case (b, f) =>
            f.map{ case (name, content) =>
              val t = dom.document.createElement("div")
              t.innerHTML = HighlightJS.highlightAuto(content).value
              b.set("commit-diff-code", t)
            }
          })
        }
      }

      builder.set("commit-message", head.message.lines.next())

      Response.withElement(builder.element)
    }
  }
}
