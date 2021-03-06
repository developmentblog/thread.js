VERSION = 0.1.13
BROWSERIFY = node ./node_modules/browserify/bin/cmd.js
MOCHA = ./node_modules/.bin/mocha
UGLIFYJS = ./node_modules/.bin/uglifyjs
BANNER = "/*! thread.js - v$(VERSION) - MIT License - https://github.com/h2non/thread.js */"
MOCHA_PHANTOM = ./node_modules/.bin/mocha-phantomjs
KARMA = ./node_modules/karma/bin/karma

define release
	NEXT_VERSION=`node -pe "require('semver').inc(require('./bower.json').version, '$(1)')"` && \
	node -e "\
		var j = require('./bower.json');\
		j.version = \"$$NEXT_VERSION\";\
		var s = JSON.stringify(j, null, 2);\
		require('fs').writeFileSync('./bower.json', s);" && \
	node -e "\
		var j = require('./component.json');\
		j.version = \"$$NEXT_VERSION\";\
		var s = JSON.stringify(j, null, 2);\
		require('fs').writeFileSync('./component.json', s);" && \
	git commit -am "release $$NEXT_VERSION" && \
	git tag "$$NEXT_VERSION" -m "Version $$NEXT_VERSION"
endef

default: all
all: test
browser: banner browserify uglify
test: browser mocha
test-all: browser mocha karma

banner:
	@echo $(BANNER) > thread.js

browserify:
	$(BROWSERIFY) \
		--exports require \
		--standalone thread \
		--entry ./lib/index.js >> ./thread.js

uglify:
	$(UGLIFYJS) thread.js --mangle --preamble $(BANNER) --source-map thread.min.js.map --source-map-url http://cdn.rawgit.com/h2non/thread.js/$(VERSION)/thread.min.js.map > thread.min.js

mocha:
	$(MOCHA_PHANTOM) --reporter spec --ui bdd test/runner.html
	$(MOCHA) --reporter spec --ui bdd test/utils.js

karma:
	$(KARMA) start

karma-ci:
	$(KARMA) start --single-run --browsers Firefox

loc:
	wc -l lib/*

gzip:
	gzip -c thread.min.js | wc -c

release:
	@$(call release, patch)

release-minor:
	@$(call release, minor)

publish: browser release
	git push --tags origin HEAD:master
	npm publish
