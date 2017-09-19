package igis.tree

import igis.mvc.{Controller, Request}

class TreeController extends  Controller {
  def apply(req: Request): String = {
    html.tree().toString()
  }
}