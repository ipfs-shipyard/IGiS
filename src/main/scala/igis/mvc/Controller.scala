package igis.mvc

import scala.concurrent.Future

trait Controller {
  def apply(req: Request): Future[Response]
}
