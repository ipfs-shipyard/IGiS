package igis

import igis.app.controllers._
import igis.mvc.{Node, Request, Response, Router}
import org.scalajs.dom.raw.{HTMLElement, HashChangeEvent, MouseEvent}

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
      case Success(Response.DataResponse(result)) =>
        document.getElementById("body").innerHTML = result
        initPopdown()
      case Success(Response.ElementResponse(element)) =>
        document.getElementById("body").innerHTML = "" //TODO: make it the proper way
        document.getElementById("body").appendChild(element)
      case Success(Response.RedirectResponse(result)) =>
        window.location.hash = result
        updateLocation()
      case Failure(f) =>
        f.printStackTrace()
        document.getElementById("body").innerHTML = "error 212"
    }
  }

  def initPopdown(): Unit = {
    val elems = document.getElementsByClassName("popdown")

    (0 until elems.length).map(elems.apply).foreach { elem =>
      elem.asInstanceOf[HTMLElement].onclick = (e: MouseEvent) => {
        if (e.button == 0) {
          e.target match {
            case elem: HTMLElement =>
              if (elem.classList.contains("popdown")) {
                elem.parentElement.nextElementSibling.asInstanceOf[HTMLElement].classList.toggle("hidden")
              }
            case _ =>
          }
        }
      }
    }
  }

  def main(): Unit = {
    while(document.body.firstChild != null) {
      document.body.removeChild(document.body.firstChild)
    }
    document.body.appendChild(document.createTextNode("Startup..."))

    window.onhashchange = {(_: HashChangeEvent) =>
      updateLocation()
    }



    node.init().andThen{
      case Success(_) =>
        router.register(new RepoController(), "/repo")
        router.register(new TreeController(), "/tree")
        router.register(new BlobController(), "/blob")
        router.register(new CommitsController(), "/repo/commits")
        router.register(new CommitController(), "/commit")
        router.register(new IndexController(), "")
        updateLocation()

      case Failure(f) =>
        f.printStackTrace()
        document.getElementById("body").innerHTML = "error 212"
    }
  }
}
