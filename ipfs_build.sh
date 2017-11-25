#!/bin/bash

TEMP_DIR=$(mktemp -d)

sbt fastOptJS::webpack

cp index.html ${TEMP_DIR}
cp ./target/web/less/main/main.css ${TEMP_DIR}
cp target/scala-2.12/scalajs-bundler/main/root-fastopt-bundle.js ${TEMP_DIR}

ipfs add -r ${TEMP_DIR}
rm -r ${TEMP_DIR}
