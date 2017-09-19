resolvers += "ipfs" at "https://ipfs.io/ipfs/QmZwTcMFFZ1SrM6R6pA5SKGd3Pfr8w6Mey5dG88UBLZA48"

lazy val root = (project in file(".")).settings(
  npmDependencies in Compile += "milligram-less" -> "1.3.0",
  sourceDirectories in (Compile, TwirlKeys.compileTemplates) += (baseDirectory.value.getParentFile / "src" / "main" / "twirl"),
  resourceDirectories in (Assets, LessKeys.less) += crossTarget.value / "scalajs-bundler" / "main",

  webpackConfigFile := Some(baseDirectory.value / "webpack.config.js"),
  scalaJSUseMainModuleInitializer := true,

  scalaVersion := "2.12.1",
  libraryDependencies ++= Seq(
    "eu.devtty" %%% "api-ipfs-node" % "0.2.4-SNAPSHOT",
    "org.scala-js" %%% "scalajs-dom" % "0.9.1"
  )
).enablePlugins(ScalaJSBundlerPlugin, SbtTwirl, SbtWeb)
// .disablePlugins(SbtLess)
