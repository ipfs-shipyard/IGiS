package models

class FileType(val modePrefix: Char, val strType: String)

case object File extends FileType('1', "blob")
case object Directory extends FileType('4', "tree")
case object Unknown extends FileType('\0', null)
