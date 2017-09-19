package igis.mvc

trait Controller {
  def apply(req: Request): String
}
