package models

class FileType(val modePrefix: Char)

case object File extends FileType('1')
case object Directory extends FileType('4')
case object Unknown extends FileType('\0')
