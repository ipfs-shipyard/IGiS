package igis.app.controllers

import igis.mvc.{Controller, Request, Response}

import scala.concurrent.Future

class IndexController extends Controller {
  def apply(req: Request): Future[Response] = {
    Future.successful(Response.withData(html.index.apply().toString()))
  }
}
