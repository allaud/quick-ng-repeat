# AngularJS directive for much more quicker lists rendering

## Features

* Shallow list watch (ngRepeat uses deep watch)
* Animations support
* Special service to cause list render outside of digest cycle
* Smooth scrolling even on heavy compited lists  (check example)
* About 200% performance boost
* Still hesitating? Try to scroll [page with ng-repeat list](http://allaud.github.io/quick-ng-repeat/example/index_classic.html) and a [page with quick-ng-repeat](http://allaud.github.io/quick-ng-repeat/example/index.html)

## Usage example:

Require `quick-ng-repeat.js` to your project and use this syntax in your templates:

    <ul>
      <li quick-ng-repeat="item in list" quick-repeat-list="items">
        {{ item.name }}
      </li>
    </ul>
    
## Installation

###### Using bower package manager:

```
bower i quick-ngrepeat --save
```
_Note the single hyphen in the package name_


###### Using the browser:

```html
<script src="quick-ng-repeat.js"></script>
```


## Why we need the 'quick-repeat-list' attribute?

In quick-ng-repeat directive everything is done to make is really fast. So we store a special callback with name of this attribute. 
[This is a full answer](https://github.com/allaud/quick-ng-repeat/issues/1)

## Compared to usual ngRepeat

* Compare `example/index.html` (uses quickNgRepeat) and `example/index_classic.html` (uses classic NgRepeat)

## Example

Directive live example in ./example

Try out the demo (try to scroll):
[page with ng-repeat list](http://allaud.github.io/quick-ng-repeat/example/index_classic.html) and 
[page with quick-ng-repeat](http://allaud.github.io/quick-ng-repeat/example/index.html)

## To run example
    cd example && python -m SimpleHTTPServer

