{
   angular.module('finder.navigation', ['finder.altthemes'])
   /**
    *
    * Override the original mars user.
    *
    */
   .directive('finderNavigation', [function() {
      return {
         restrict: 'AE',
         template: "<alt-themes current='current'></alt-themes>",
         scope: {
            current: "=?"
         },
         link: function(scope) {
            scope.username = "Anonymous";
            if (!scope.current) {
               scope.current = "none";
            }
         }
      };
   }])

   .factory('navigationService', [function() {
      return {};
   }]);

   }