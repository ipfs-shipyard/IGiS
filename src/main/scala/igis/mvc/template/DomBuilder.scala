package igis.mvc.template

import org.scalajs.dom
import org.scalajs.dom.raw.{Element, HTMLElement, Node}

class DomBuilder(root: Element) {
  def set(className: String, value: Any): Unit = value match {
    case n: Node =>
      getTarget(className).appendChild(n)
    case s: String =>
      getTarget(className).appendChild(dom.document.createTextNode(s))
    case _ => throw new IllegalArgumentException("Unsupported value type")
  }

  def setMultiple[A](className: String, data: Seq[A], apply: (DomBuilder, A)=>Unit): Unit = {
    val target = getTarget(className)
    if(target.childElementCount != 1) {
      throw new Exception("Invalid target child element count (!= 1)")
    }
    val templateElement = target.firstElementChild
    target.removeChild(templateElement)
    val template = new DomTemplate(templateElement)
    data.map { e =>
      val builder = template.builder
      apply(builder, e)
      builder.element
    }.foreach(target.appendChild)
  }

  def modElement(className: String, cb: (HTMLElement)=>Unit): Unit = {
    cb(getTarget(className))
  }

  def element: Element = root

  private def getTarget(className: String) = {
    val elems = root.getElementsByClassName(className)
    if(elems.length != 1) {
      throw new Exception(s"Invalid target count (!= 1) for target $className")
    }
    elems(0).asInstanceOf[HTMLElement]
  }
}
