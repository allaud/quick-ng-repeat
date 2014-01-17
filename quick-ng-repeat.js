angular.module('QuickList', []);

angular.module('QuickList').value('quickRepeatList', {});

angular.module('QuickList').directive('quickNgRepeat',
['$parse', '$animate', '$rootScope', 'quickRepeatList', function($parse, $animate, $rootScope, quick_repeat_list) {
  var NG_REMOVED = '$$NG_REMOVED';
  var ngRepeatMinErr = 'err';
  var uid = ['0', '0', '0'];
  var list_id = window.list_id = (function(){
    var i = 0;
    return function(){
      return 'list_' + (++i);
    };
  }());

  function hashKey(obj) {
    var objType = typeof obj,
        key;

    if (objType == 'object' && obj !== null) {
      if (typeof (key = obj.$$hashKey) == 'function') {
        // must invoke on object to keep the right this
        key = obj.$$hashKey();
      } else if (key === undefined) {
        key = obj.$$hashKey = nextUid();
      }
    } else {
      key = obj;
    }

    return objType + ':' + key;
  };

  function isWindow(obj) {
    return obj && obj.document && obj.location && obj.alert && obj.setInterval;
  };

  function nextUid() {
    var index = uid.length;
    var digit;

    while(index) {
      index--;
      digit = uid[index].charCodeAt(0);
      if (digit == 57 /*'9'*/) {
        uid[index] = 'A';
        return uid.join('');
      }
      if (digit == 90  /*'Z'*/) {
        uid[index] = '0';
      } else {
        uid[index] = String.fromCharCode(digit + 1);
        return uid.join('');
      }
    }
    uid.unshift('0');
    return uid.join('');
  };

  function isArrayLike(obj) {
    if (obj == null || isWindow(obj)) {
      return false;
    }

    var length = obj.length;

    if (obj.nodeType === 1 && length) {
      return true;
    }

    return angular.isArray(obj) || !angular.isFunction(obj) && (
      length === 0 || typeof length === "number" && length > 0 && (length - 1) in obj
    );
  };


  return {
    transclude: 'element',
    priority: 1000,
    terminal: true,
    compile: function(element, attr, linker) {
      return function($scope, $element, $attr){
        var expression = $attr.quickNgRepeat;
        var match = expression.match(/^\s*(.+)\s+in\s+(.*?)\s*(\s+track\s+by\s+(.+)\s*)?$/),
          trackByExp, trackByExpGetter, trackByIdFn, trackByIdArrayFn, trackByIdObjFn, lhs, rhs, valueIdentifier, keyIdentifier,
          hashFnLocals = {$id: hashKey};

        if (!match) {
          throw ngRepeatMinErr('iexp', "Expected expression in form of '_item_ in _collection_[ track by _id_]' but got '{0}'.",
            expression);
        }

        lhs = match[1];
        rhs = match[2];
        trackByExp = match[4];

        if (trackByExp) {
          trackByExpGetter = $parse(trackByExp);
          trackByIdFn = function(key, value, index) {
            // assign key, value, and $index to the locals so that they can be used in hash functions
            if (keyIdentifier) hashFnLocals[keyIdentifier] = key;
            hashFnLocals[valueIdentifier] = value;
            hashFnLocals.$index = index;
            return trackByExpGetter($scope, hashFnLocals);
          };
        } else {
          trackByIdArrayFn = function(key, value) {
            return hashKey(value);
          }
          trackByIdObjFn = function(key) {
            return key;
          }
        }

        match = lhs.match(/^(?:([\$\w]+)|\(([\$\w]+)\s*,\s*([\$\w]+)\))$/);
        if (!match) {
          throw ngRepeatMinErr('iidexp', "'_item_' in '_item_ in _collection_' should be an identifier or '(_key_, _value_)' expression, but got '{0}'.",
                                                                    lhs);
        }
        valueIdentifier = match[3] || match[1];
        keyIdentifier = match[2];

        // Store a list of elements from previous run. This is a hash where key is the item from the
        // iterator, and the value is objects with following properties.
        //   - scope: bound scope
        //   - element: previous element.
        //   - index: position
        var lastBlockMap = {};

        var list_name = $attr.quickRepeatList || list_id();

        //watch props
        $scope.$watch(rhs, quick_repeat_list[list_name] = function(collection){
          var index, length,
              previousNode = $element[0],     // current position of the node
              nextNode,
              // Same as lastBlockMap but it has the current state. It will become the
              // lastBlockMap on the next iteration.
              nextBlockMap = {},
              arrayLength,
              childScope,
              key, value, // key/value of iteration
              trackById,
              collectionKeys,
              block,       // last object information {scope, element, id}
              nextBlockOrder = [];


          if (isArrayLike(collection)) {
            collectionKeys = collection;
            trackByIdFn = trackByIdFn || trackByIdArrayFn;
          } else {
            trackByIdFn = trackByIdFn || trackByIdObjFn;
            // if object, extract keys, sort them and use to determine order of iteration over obj props
            collectionKeys = [];
            for (key in collection) {
              if (collection.hasOwnProperty(key) && key.charAt(0) != '$') {
                collectionKeys.push(key);
              }
            }
            collectionKeys.sort();
          }

          arrayLength = collectionKeys.length;

          // locate existing items
          length = nextBlockOrder.length = collectionKeys.length;
          for(index = 0; index < length; index++) {
           key = (collection === collectionKeys) ? index : collectionKeys[index];
           value = collection[key];
           trackById = trackByIdFn(key, value, index);
           if(lastBlockMap.hasOwnProperty(trackById)) {
             block = lastBlockMap[trackById]
             delete lastBlockMap[trackById];
             nextBlockMap[trackById] = block;
             nextBlockOrder[index] = block;
           } else if (nextBlockMap.hasOwnProperty(trackById)) {
             // restore lastBlockMap
             angular.forEach(nextBlockOrder, function(block) {
               if (block && block.startNode) lastBlockMap[block.id] = block;
             });
             // This is a duplicate and we need to throw an error
             throw ngRepeatMinErr('dupes', "Duplicates in a repeater are not allowed. Use 'track by' expression to specify unique keys. Repeater: {0}, Duplicate key: {1}",
                                                                                                                                                    expression,       trackById);
           } else {
             // new never before seen block
             nextBlockOrder[index] = { id: trackById };
             nextBlockMap[trackById] = false;
           }
         }

          // remove existing items
          for (key in lastBlockMap) {
            if (lastBlockMap.hasOwnProperty(key)) {
              block = lastBlockMap[key];
              $animate.leave(block.elements);
              angular.forEach(block.elements, function(element) { element[NG_REMOVED] = true});
              block.scope.$destroy();
            }
          }

          // we are not using forEach for perf reasons (trying to avoid #call)
          for (index = 0, length = collectionKeys.length; index < length; index++) {
            key = (collection === collectionKeys) ? index : collectionKeys[index];
            value = collection[key];
            block = nextBlockOrder[index];

            if (block.startNode) {
              // if we have already seen this object, then we need to reuse the
              // associated scope/element
              childScope = block.scope;

              nextNode = previousNode;
              do {
                nextNode = nextNode.nextSibling;
              } while(nextNode && nextNode[NG_REMOVED]);

              if (block.startNode == nextNode) {
                // do nothing
              } else {
                // existing item which got moved
                $animate.move(block.elements, null, angular.element(previousNode));
              }
              previousNode = block.endNode;
            } else {
              // new item which we don't know about
              childScope = $scope.$new();
            }

            childScope[valueIdentifier] = value;
            if (keyIdentifier) childScope[keyIdentifier] = key;
            childScope.$index = index;
            childScope.$first = (index === 0);
            childScope.$last = (index === (arrayLength - 1));
            childScope.$middle = !(childScope.$first || childScope.$last);
            childScope.$odd = !(childScope.$even = index%2==0);

            if (!block.startNode) {
              linker(childScope, function(clone) {
                $animate.enter(clone, null, angular.element(previousNode));
                previousNode = clone;
                block.scope = childScope;
                block.startNode = clone[0];
                block.elements = clone;
                block.endNode = clone[clone.length - 1];
                nextBlockMap[block.id] = block;
              });

              if ($rootScope.$$phase !== '$digest' && childScope.$$phase !== '$digest'){
                childScope.$digest();
              }
            }
          }
          lastBlockMap = nextBlockMap;
        });
      };
    }
  };
}]

);
