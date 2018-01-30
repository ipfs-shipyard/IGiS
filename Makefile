.sbt-launcher.jar:
	wget http://central.maven.org/maven2/com/typesafe/sbt/sbt-launcher/0.13.6/sbt-launcher-0.13.6.jar -O .sbt-launcher.jar

sbt-launcher: .sbt-launcher.jar

.PHONY: sbt-launcher

sbt-setup: sbt-launcher
	if git diff build.sbt | wc -l | grep -v 0 > /dev/null; then exit 1; fi
	echo '.disablePlugins(SbtLess)' >> build.sbt
	java -jar .sbt-launcher.jar npmUpdate
	git checkout -- build.sbt

.PHONY: sbt-setup

local-deps:
	npm install webpack
	npm install webpack-closure-compiler

.PHONY: local-deps

setup: sbt-setup local-deps

.PHONY: setup

build-bundle:
	java -jar .sbt-launcher.jar fullOptJS::webpack

.PHONY: build-bundle

build: sbt-launcher build-bundle
	rm -rf .build
	mkdir -p .build
	cp index.html .build
	cp ./target/web/less/main/main.css .build
	cp target/scala-2.12/scalajs-bundler/main/root-opt-bundle.js .build/root-bundle.js
	cp target/scala-2.12/scalajs-bundler/main/root-opt-bundle.js.map .build/root-bundle.js.map

.PHONY: build

deploy: build
	ipfs add .build -rQ

.PHONY: deploy
