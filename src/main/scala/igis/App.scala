package igis

import igis.mvc.{Node, Request, Router}
import igis.tree.TreeController

import scala.scalajs.js.JSApp
import org.scalajs.dom.document

object App extends JSApp {
  var router = new Router()
  implicit val node: Node = new Node()

  def main(): Unit = {
    new Node().init()

    router.register(new TreeController(), "/tree")

    //TODO: overengineer me
    document.getElementById("body").innerHTML = router(new Request("/tree"))
  }
}
