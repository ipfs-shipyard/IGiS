package igis.mvc.template

import org.scalajs.dom.raw.Element

class DomTemplate(root: Element) {
  def builder: DomBuilder = new DomBuilder(root.cloneNode(true).asInstanceOf[Element])
}
