package igis.util

import igis.mvc.template.DomTemplate
import org.scalajs.dom.raw.{Element, Node, ParentNode}
import play.twirl.api.HtmlFormat
import org.scalajs.dom.document

object HtmlDom {
  implicit class HtmlDom(html: HtmlFormat.Appendable) {
    def genElement: Node = {
      document.createRange().createContextualFragment(html.body)
        .asInstanceOf[ParentNode].firstElementChild
    }

    def template: DomTemplate = {
      new DomTemplate(genElement.asInstanceOf[Element])
    }
  }
}
