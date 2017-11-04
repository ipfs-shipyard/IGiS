package igis.mvc

trait Response

object Response {
  def withData(data: String): Response = {
    DataResponse(data: String)
  }

  def redirect(path: String): Response = {
    RedirectResponse(path)
  }

  case class DataResponse(data: String) extends Response
  case class RedirectResponse(path: String) extends Response
}
