package igis.app.controllers

import igis.mvc.{Controller, Request, Response}

import scala.concurrent.Future

class CommitController extends Controller {
  def apply(req: Request): Future[Response] = {
    Future.successful(Response.withData(html.commit().toString()))
  }
}
