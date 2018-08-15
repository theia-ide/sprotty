# sprotty

This is the client part of _sprotty_, a next-generation, open-source diagramming framework built with web technologies. 

Some selected features:

* fast, scalable SVG rendering that is compatible with many browsers and stylable with CSS,
* animations built into the core,
* support for a distributed runtime with a diagram client and a model server,
* a fast, reactive client architecure implemented in TypeScript,
* a Java-based server architecture,
* configuration via dependency injection,
* integration with [Xtext, the Language Server Protocol and Theia](https://github.com/theia-ide/theia-sprotty-example) that can be run as rich-client as well as in the browser.

[![sprotty demo](https://github.com/theia-ide/sprotty/raw/master/sprotty_demo_screenshot.png)](http://www.youtube.com/watch?v=IydM4l7WFKk "sprotty demo")

The server part of sprotty is written in Java / [Xtend](http://xtend-lang.org) and is available via [Maven Central](http://repo.maven.apache.org/maven2/io/typefox/sprotty/) or [JCenter](http://jcenter.bintray.com/io/typefox/sprotty/).

For further information please consult the [wiki](https://github.com/theia-ide/sprotty/wiki) or this [blog post](http://typefox.io/sprotty-a-web-based-diagramming-framework).
