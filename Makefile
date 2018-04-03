install:
	npm install
.PHONY: install

build: install
	npm run-script build
.PHONY: build

