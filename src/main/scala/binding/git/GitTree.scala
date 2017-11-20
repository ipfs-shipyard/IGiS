package binding.git

import binding.ipld.GitFile
import igis.mvc.Node

import scala.scalajs.js

class GitTree(val tree: js.Dictionary[GitFile])(implicit val node: Node) {
  def compare(head: GitTree): Seq[GitTree.TreeDiff] = {
    val additions = head.tree.filterNot{case (fileName, _) => tree.contains(fileName)}
    val deletions = tree.filterNot{case (fileName, _) => head.tree.contains(fileName)}
    val changes = tree.filter{case (fileName, _) => head.tree.contains(fileName)}
      .filterNot{ case (fileName, baseFile) => head.tree(fileName).hash.cid().equals(baseFile.hash.cid())}

    (additions.map{ case(name, file) => GitTree.Addition(name, file)}.toSeq.asInstanceOf[Seq[GitTree.TreeDiff]]
      ++ deletions.map { case (name, file) => GitTree.Deletion(name, file) }
      ++ changes.map { case (name, file) => GitTree.Change(name, file, head.tree(name)) })
  }
}

object GitTree {
  class TreeDiff

  case class Addition(name: String, file: GitFile) extends TreeDiff
  case class Deletion(name: String, file: GitFile) extends TreeDiff
  case class Change(name: String, base: GitFile, head: GitFile) extends TreeDiff
}
