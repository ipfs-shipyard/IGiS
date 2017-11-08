package igis.mvc

import org.scalajs.dom

trait Response

object Response {
  def withData(data: String): Response = {
    DataResponse(data: String)
  }

  def withElement(element: dom.Node): Response = {
    ElementResponse(element)
  }

  def redirect(path: String): Response = {
    RedirectResponse(path)
  }

  case class DataResponse(data: String) extends Response
  case class RedirectResponse(path: String) extends Response
  case class ElementResponse(path: dom.Node) extends Response
}
