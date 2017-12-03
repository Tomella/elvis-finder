{
   angular.module("finder.authorities", [])

      .directive('finderAuthorities', ["groupsService", "searchService", function (groupsService, searchService) {
         return {
				restrict: 'EA',
            templateUrl: "authorities/authorities.html",
            link: function (scope) {
               groupsService.getAuthorities().then(authorities => scope.authorities = authorities);
               scope.change = function(item) {
                  searchService.filtered();
               };
            }
         };
      }]);
}
