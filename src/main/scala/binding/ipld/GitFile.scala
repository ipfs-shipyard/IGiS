package binding.ipld

import models.FileType

import scala.scalajs.js

@js.native
trait GitFile extends js.Object {
  val hash: CIDBuf = js.native
  val mode: String = js.native
}

object GitFile {
  implicit class GitFileEx(gitFile: GitFile) {
    def fileType(): FileType = {
      gitFile.mode.charAt(0) match {
        case models.File.modePrefix => models.File
        case models.Directory.modePrefix => models.Directory
        case _ => models.Unknown
      }
    }
  }
}