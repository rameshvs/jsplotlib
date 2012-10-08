JS_COMPILER = /usr/bin/uglifyjs
JS_BEAUTIFIER = /usr/bin/uglifyjs -b -i 2 -nm -ns
LOCALE ?= en_US

all: \
	jsplotlib.js \
	jsplotlib.min.js

.INTERMEDIATE jsplotlib.js: \
	src/start.js \
	src/core.js \
	src/chart.js \
	src/axes.js \
	src/graph.js \
	src/imshow.js \
	src/pplot.js \
	src/bar_graph.js \
	src/util.js \
	src/end.js

%.min.js: %.js Makefile
	@rm -f $@
	$(JS_COMPILER) < $< > $@

jsplotlib.js: Makefile
	@rm -f $@
	cat $(filter %.js,$^) | $(JS_BEAUTIFIER) > $@

clean:
	rm -f jsplotlib*.js

