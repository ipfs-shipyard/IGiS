package igis.mvc

class Request(val path: String, val remPath: String)(implicit val node: Node) {
  def this(path: String)(implicit node: Node) {
    this(path, path)
  }

  def this(request: Request)(implicit node: Node) {
    this(request.path, request.remPath.replaceFirst("^/*", "").split("/").drop(1).mkString("/"))
  }
}
