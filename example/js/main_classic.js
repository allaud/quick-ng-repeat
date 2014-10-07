angular.module('ListExample', ['QuickList']);

angular.module('ListExample').controller('CoreController',

function($scope){


  var factorial = function (num){
    if (num === 0)
      { return 1; }
    else
      { return num * factorial( num - 1 ); }
  };


  var summ = function (num){
    if (num === 0)
      { return 1; }
    else
      { return num + summ( num - 1 ); }
  };


  var LONG_LIST = _.map(_.range(100000), function(b){
      return {
        id: parseInt(Math.random() * 1000, 10),
        arr: [1,2,3,4],
        fact: function(){
          return factorial(this.id);
        },
        summ: function(){
          return summ(this.id);
        },
        heavy: function(n){
          return _.map(_.range(n), function(a){
            return Math.sqrt(a);
          }).join('_').slice(0,20);
        }
      };
    });

  $scope.list = LONG_LIST.slice(0, 30);

  var avg_item_height = 20;
  var window_layout = angular.element(window);
  var load_more = _.throttle((function(){
    var new_to_load = Math.floor((window_layout.scrollTop()) / avg_item_height);

    console.log('NEW', new_to_load);

    $scope.list = LONG_LIST.slice(0, 30 + new_to_load);

    $scope.$digest();
  }), 50);

  window_layout.on('scroll', load_more);

});
