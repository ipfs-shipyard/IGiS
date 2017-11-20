package igis.util

import igis.app.controllers.BlobController
import igis.mvc.Node

import scala.concurrent.Future

object GitBlob {
  def fetch(path: String, node: Node): Future[String] = {
    val parts = path.split("/")
    val root = parts.head

    val ipldPath = parts.drop(1).map(p => s"$p/hash").mkString("/")
    BlobController.rawBlob(s"$root/tree/$ipldPath", node)
  }
}
