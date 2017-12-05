resolvers += "ipfs" at "https://ipfs.io/ipfs/QmezqVx7UfqKNrPCq3KyfuFZ7xhkiXKP959ncQk1dahfgd"

lazy val root = (project in file(".")).settings(
  npmDependencies in Compile += "milligram-less" -> "1.3.0",
  npmDependencies in Compile += "smart-buffer" -> "3.0.3",
  npmDependencies in Compile += "highlight.js" -> "9.12.0",
  npmDependencies in Compile += "showdown" -> "1.8.2",
  npmDependencies in Compile += "diff" -> "3.4.0",
  sourceDirectories in (Compile, TwirlKeys.compileTemplates) += (baseDirectory.value.getParentFile / "src" / "main" / "twirl"),
  resourceDirectories in (Assets, LessKeys.less) += crossTarget.value / "scalajs-bundler" / "main",

  webpackConfigFile := Some(baseDirectory.value / "webpack.config.js"),
  scalaJSUseMainModuleInitializer := true,

  scalaVersion := "2.12.1",
  libraryDependencies ++= Seq(
    "eu.devtty" %%% "js-ipfs-node" % "0.4.0-SNAPSHOT",
    "org.scala-js" %%% "scalajs-dom" % "0.9.1"
  )
).enablePlugins(ScalaJSBundlerPlugin, SbtTwirl, SbtWeb)
// .disablePlugins(SbtLess) //do this before first sbt run
