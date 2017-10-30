package igis.tree

import igis.App
import igis.mvc.{Controller, Node, Request}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.scalajs.js
import scala.util.Success
import org.scalajs.dom.window

class TreeController extends Controller {
  val demoTree = "z8mWaHHFrQGYGua3HEnQC4sBG9k2t4Pr8"

  def tree(root: String, node: Node): Unit = {
    js.Dynamic.global.console.log(App.node.ipfs.asInstanceOf[js.Any])
    window.setInterval(()=> {
      App.node.ipfs.dag.get(root).andThen {
        case Success(n) =>
          js.Dynamic.global.console.log(n)
        case _ => println("gt err")
      }
    }, 4000)
  }

  def apply(req: Request): String = {
    tree(demoTree, req.node)

    html.tree().toString()
  }
}