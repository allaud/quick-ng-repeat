# AngularJS directive for much more quicker lists rendering

## Features

* Shallow list watch (ngRepeat uses deep watch)
* Animations support
* Special service to cause list render outside of digest cycle
* Smooth scrolling even on heavy compited lists  (check example)
* About 200% performance boost

## Usage example:

Require `quick-ng-repeat.js` to your project and use this syntax in your templates:

    <ul>
      <li quick-ng-repeat="item in list" quick-repeat-list="items">
        {{ item.name }}
      </li>
    </ul>
    
## Why we need the 'quick-repeat-list' attribute?

In quick-ng-repeat directive everything is done to make is really fast. So we store a special callback with name of this attribute. 
[This is a full answer](https://github.com/allaud/quick-ng-repeat/issues/1)

## Compared to usual ngRepeat

* Compare `example/index.html` (uses quickNgRepeat) and `example/index_classic.html` (uses classic NgRepeat)

## Example

Directive live example in ./example

## To run example
    cd example && python -m SimpleHTTPServer

