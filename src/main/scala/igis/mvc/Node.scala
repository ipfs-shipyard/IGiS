package igis.mvc

import eu.devtty.ipfs.jsnode.JsIpfs

import scala.scalajs.js
import scala.util.{Failure, Success}

import scala.concurrent.ExecutionContext.Implicits.global

class Node {
  val ipfs = new JsIpfs()

  def init(): Unit = {
    ipfs.on("ready").map { _: Any =>
      println(s"Online: ${ipfs.isOnline}")
      println("Node online")
    }.andThen {
      case Success(_) => println("Online!")
      case Failure(e) => throw e; //TODO: Alert or sth
    }
  }
}
