BIN= ./node_modules/.bin
REPORTER=spec

test: test-unit
test-unit:
	@rm -rf test.*
	@NODE_ENV=test $(BIN)/mocha \
		--reporter $(REPORTER) 
	@rm -rf test.*

.PHONY: test
