package igis.mvc

class Request(val path: String, val remPath: String) {
  def this(path: String) {
    this(path, path)
  }

  def this(request: Request) {
    this(request.path, request.remPath.replaceFirst("^/*", "").split("/").drop(1).mkString("/"))
  }
}
