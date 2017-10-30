package igis.mvc

class Request(val path: String, val remPath: String, val node: Node) {
  def this(path: String, node: Node) {
    this(path, path, node)
  }

  def this(request: Request, node: Node) {
    this(request.path, request.remPath.replaceFirst("^/*", "").split("/").drop(1).mkString("/"), node)
  }
}
