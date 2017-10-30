package igis.app.controllers

import eu.devtty.cid.CID
import igis.App
import igis.ipld.GitFile
import igis.mvc.{Controller, Node, Request}
import models.{FileType, TreeFile}

import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.Future
import scala.scalajs.js

class TreeController extends Controller {
  val demoTree = "z8mWaHgb8Wcq6n72s11Q9bbmDvFS1WuGr"

  def tree(root: String, node: Node): Future[Array[TreeFile]] = {
    App.node.ipfs.dag.get(root).map {o =>
      val t = o.value.asInstanceOf[js.Object]
      val files = js.Object.keys(t).toArray

      files.map(file => new TreeFile {
        private val ldFile = t.asInstanceOf[js.Dictionary[GitFile]].apply(file)

        override val name: String = file
        override val fileType: FileType = ldFile.fileType()
        override val link: CID = ldFile.hash.cid()
      })
    }
  }

  def apply(req: Request): Future[String] = {
    tree(demoTree, req.node).map { files =>

      html.tree(files).toString()
    }
  }
}