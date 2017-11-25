# Interpalnetary Git Service


[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://ipn.io)
[![](https://img.shields.io/badge/project-IPFS-blue.svg?style=flat-square)](http://ipfs.io/)
[![](https://img.shields.io/badge/freenode-%23ipfs-blue.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23ipfs)
[![standard-readme compliant](https://img.shields.io/badge/standard--readme-OK-green.svg?style=flat-square)](https://github.com/RichardLitt/standard-readme)

> Git without the Hub

## Build

### Prerequisites
* Node.js
* NPM
* Scala
* SBT

### Before first build
* `./setup.sh`

### Build
* `./ipfs_build.sh`

### Project Structure
This is a client-side Scala.js single-page app loosely based on the MVC convention.

* [Main class](src/main/scala/igis/App.scala)
* [Controllers](src/main/scala/igis/app/controllers)
* [Views (templates)](src/main/twirl)
* [Models](src/main/scala/models)
* [Styles](src/main/assets)
* [JS-Scala bindings](src/main/scala/binding)

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/ipfs/ipfs-npm/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

[MIT](LICENSE)