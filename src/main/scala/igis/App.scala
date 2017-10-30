package igis

import igis.app.controllers.TreeController
import igis.mvc.{Node, Request, Router}

import scala.scalajs.js.JSApp
import org.scalajs.dom.document

import scala.util.{Failure, Success}
import scala.concurrent.ExecutionContext.Implicits.global

object App extends JSApp {
  var router = new Router()
  val node: Node = new Node()

  def main(): Unit = {
    node.init().andThen{
      case Success(_) =>
        router.register(new TreeController(), "/tree")

        //TODO: overengineer me
        router(new Request("/tree", node)).andThen {
          case Success(result) =>
            document.getElementById("body").innerHTML = result
          case Failure(f) =>
            f.printStackTrace()
            document.getElementById("body").innerHTML = "error 212"
        }

      case Failure(_) =>
        println("nope; error 254865215484; find me and fix me")
    }
  }
}
