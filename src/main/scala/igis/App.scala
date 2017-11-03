package igis

import igis.app.controllers.{BlobController, TreeController}
import igis.mvc.{Node, Request, Router}
import org.scalajs.dom.raw.HashChangeEvent

import scala.scalajs.js.JSApp
import org.scalajs.dom.{document, window}

import scala.util.{Failure, Success}
import scala.concurrent.ExecutionContext.Implicits.global

object App extends JSApp {
  var router = new Router()
  val node: Node = new Node()

  def updateLocation(): Unit = {
    val location = {
      val loc = window.location.hash
      if(loc.startsWith("#")) {
        loc.substring(1)
      } else {
        "/home"
      }
    }

    router(new Request(location, node)).andThen {
      case Success(result) =>
        document.getElementById("body").innerHTML = result
      case Failure(f) =>
        f.printStackTrace()
        document.getElementById("body").innerHTML = "error 212"
    }
  }

  def main(): Unit = {
    window.onhashchange = {(_: HashChangeEvent) =>
      updateLocation()
    }

    node.init().andThen{
      case Success(_) =>
        router.register(new TreeController(), "/tree")
        router.register(new BlobController(), "/blob")
        updateLocation()

      case Failure(f) =>
        f.printStackTrace()
        document.getElementById("body").innerHTML = "error 212"
    }
  }
}
