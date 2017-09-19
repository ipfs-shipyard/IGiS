resolvers += "ipfs" at "https://ipfs.io/ipfs/QmZaMLnS6hk4UhnXfExMBnJgudYe96MihERohaUzK8fw7z"

lazy val root = (project in file(".")).settings(
  npmDependencies in Compile += "milligram-less" -> "1.3.0",
  sourceDirectories in (Compile, TwirlKeys.compileTemplates) += (baseDirectory.value.getParentFile / "src" / "main" / "twirl"),
  resourceDirectories in (Assets, LessKeys.less) += crossTarget.value / "scalajs-bundler" / "main",

  webpackConfigFile := Some(baseDirectory.value / "webpack.config.js"),
  scalaJSUseMainModuleInitializer := true,

  scalaVersion := "2.12.1",
  libraryDependencies ++= Seq(
    "eu.devtty" %%% "js-ipfs-node" % "0.3.1-SNAPSHOT",
    "org.scala-js" %%% "scalajs-dom" % "0.9.1"
  )
).enablePlugins(ScalaJSBundlerPlugin, SbtTwirl, SbtWeb)
 .disablePlugins(SbtLess) //do this before first sbt run
