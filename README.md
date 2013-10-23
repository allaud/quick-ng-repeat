# AngularJS directive for much more quicker lists rendering

## Features

* Shallow list watch (ngRepeat uses deep watch)
* Animations support
* Special service to cause list render outside of digest cycle
* Smooth scrolling even on heavy compited lists  (check example)
* About 200% performance boost

## Compared to usual ngRepeat

* Compare `example/index.html` (uses quickNgRepeat) and `example/index_classic.html` (uses classic NgRepeat)

## Example

Directive live example in ./example

## To run example
    cd example && python -m SimpleHTTPServer

