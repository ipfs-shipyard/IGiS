package models

import eu.devtty.cid.CID
import igis.App
import igis.ipld.GitFile
import igis.mvc.Node

import scala.concurrent.Future
import scala.scalajs.js
import scala.concurrent.ExecutionContext.Implicits.global

object Tree {
  /**
    * Get file tree
    * @param path Path in form `commitCid/example/path`
    * @param node ipfs node
    * @return
    */
  def files(path: String, node: Node): Future[Array[TreeFile]] = {
    val parts = path.split("/")
    val root = parts.head

    val ipldPath = parts.drop(1).map(p => s"$p/hash").mkString("/")

    App.node.ipfs.dag.get(s"$root/tree/$ipldPath").map {o =>
      val t = o.value.asInstanceOf[js.Object]
      val keys = js.Object.keys(t).toArray

      val entries = keys.map(file => new TreeFile {
        private val ldFile = t.asInstanceOf[js.Dictionary[GitFile]].apply(file)

        override val name: String = file
        override val fileType: FileType = ldFile.fileType()
        override val link: CID = ldFile.hash.cid()
      })

      val files = entries.filter {
        _.fileType match {
          case File => true
          case _ => false
        }
      }
      val dirs = entries.filter {
        _.fileType match {
          case Directory => true
          case _ => false
        }
      }
      dirs ++ files
    }
  }
}
