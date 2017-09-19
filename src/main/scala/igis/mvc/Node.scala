package igis.mvc

import eu.devtty.ipfs.jsnode.JsIpfs

import scala.scalajs.js
import scala.util.{Failure, Success}

import scala.concurrent.ExecutionContext.Implicits.global

class Node {
  val ipfs = new JsIpfs(js.Dynamic.literal(
    EXPERIMENTAL = js.Dynamic.literal(
      pubsub = true
    ),
    config = js.Dynamic.literal(
      Addresses = js.Dynamic.literal(
        Swarm = js.Array(
          "/libp2p-webrtc-star/dns4/star-signal.cloud.ipfs.team/wss"
        )
      )
    )
  ))

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
