#!/bin/sh

if git diff build.sbt | wc -l | grep -v 0 > /dev/null; then exit 1; fi

echo '.disablePlugins(SbtLess)' >> build.sbt
sbt npmUpdate
git checkout -- build.sbt