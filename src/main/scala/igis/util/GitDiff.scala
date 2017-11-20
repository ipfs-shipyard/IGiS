package igis.util

import binding.git.GitTree
import binding.ipld.GitFile
import igis.mvc.Node

import scala.concurrent.Future
import scala.scalajs.js
import scala.concurrent.ExecutionContext.Implicits.global

import GitDiff._

class GitDiff(node: Node) {

  /**
    * Compare two git trees
    * @param base base tree
    * @param head head tree
    */
  def compareTrees(base: String, head: String, pathPrefix: String = ""): Future[Seq[Diff]] = {
    node.ipfs.dag.get(base).zip(node.ipfs.dag.get(head)).map { case (baseDag, headDag) =>
      val baseTree = new GitTree(baseDag.value.asInstanceOf[js.Dictionary[GitFile]])(node)
      val headTree = new GitTree(headDag.value.asInstanceOf[js.Dictionary[GitFile]])(node)

      baseTree.compare(headTree).map{
        case GitTree.Addition(name, file) =>
          file.fileType() match {
            case models.File =>
              Future.successful(Seq(FileAddition(pathPrefix + name, file)))
            case models.Directory =>
              flattenTree(file, FileAddition.apply)
            case _ =>
              throw new Exception("Unexpected file type")
          }
        case GitTree.Deletion(name, file) =>
          file.fileType() match {
            case models.File =>
              Future.successful(Seq(FileDeletion(pathPrefix + name, file)))
            case models.Directory =>
              flattenTree(file, FileDeletion.apply)
            case _ =>
              throw new Exception("Unexpected file type")
          }
        case GitTree.Change(name, baseFile, headFile) =>
          (baseFile.fileType(), headFile.fileType()) match {
            case (models.File, models.File) =>
              Future.successful(Seq(FileChange(pathPrefix + name, baseFile, headFile)))
            case (models.Directory, models.File) =>
              flattenTree(baseFile, FileDeletion.apply).map(_ ++ Seq(FileAddition(pathPrefix + name, headFile)))
            case (models.File, models.Directory) =>
              flattenTree(baseFile, FileAddition.apply).map(_ ++ Seq(FileDeletion(pathPrefix + name, headFile)))
            case (models.Directory, models.Directory) =>
              compareTrees(baseFile.hash.cid().toBaseEncodedString(), headFile.hash.cid().toBaseEncodedString(), s"$pathPrefix$name/")
            case _ =>
              throw new Exception("Unexpected file type")
          }
      }
    }.flatMap(_.fold(Future.successful(Seq.empty[Diff])){case (a, b) => a.zip(b).map{ case (as, bs) => as ++ bs }})
  }

  private def flattenTree(tree: GitFile, apply: (String, GitFile)=>Diff): Future[Seq[Diff]] = {
    node.ipfs.dag.get(tree.hash.cid()).flatMap{ fileDag =>
      val files = fileDag.value.asInstanceOf[js.Dictionary[GitFile]]

      files.map{ case (name, file) =>
        file.fileType() match {
          case models.File =>
            Future.successful(Seq(apply(name, file)))
          case models.Directory =>
            flattenTree(file, apply)
        }
      }.fold(Future.successful(Seq.empty[Diff])){case (a, b) => a.zip(b).map{ case (as, bs) => as ++ bs }}
    }
  }
}

object GitDiff {
  class Diff

  case class FileAddition(name: String, file: GitFile) extends Diff
  case class FileDeletion(name: String, file: GitFile) extends Diff
  case class FileChange(name: String, base: GitFile, head: GitFile) extends Diff
}
