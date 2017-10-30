package models

import eu.devtty.cid.CID

trait TreeFile {
  val name: String
  val fileType: FileType
  val link: CID
}
