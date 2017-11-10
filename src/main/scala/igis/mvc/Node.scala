package igis.mvc

import eu.devtty.ipfs.jsnode.JsIpfs
import eu.devtty.multiaddr.Multiaddr
import org.scalajs.dom.window

import scala.util.{Failure, Success}
import scala.concurrent.ExecutionContext.Implicits.global
import scala.concurrent.{Future, Promise}
import scala.scalajs.js

class Node {
  val ipfs = new JsIpfs()
  js.Dynamic.global.ipfs = ipfs.asInstanceOf[js.Any]

  def init(): Future[Unit] = {
    val p = Promise[Unit]()

    ipfs.on("ready").flatMap { _: Any =>
      println(s"Online: ${ipfs.isOnline}")
      println("Node online")

      //TODO: remove
      //ipfs.swarm.connect(new Multiaddr("/dns4/ipfs.devtty.eu/wss/ipfs/QmNMVHJTSZHTWMWBbmBrQgkA1hZPWYuVJx2DpSGESWW6Kn"))
      ipfs.swarm.connect(new Multiaddr("/ip4/127.0.0.1/tcp/4002/ws/ipfs/QmebbuuHVTfyieTh9AeKiT9dmrXv5fWmqXQnLQjA9MuyJM"))
    }.andThen {
      case Success(_) =>
        println("Online!")
        p.success()
      case Failure(e) => throw e; //TODO: Alert or sth
    }

    p.future
  }
}
