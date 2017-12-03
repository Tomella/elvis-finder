{
   angular.module('finder.header', [])

      .controller('headerController', ['$scope', '$q', '$timeout', function ($scope, $q, $timeout) {

         let modifyConfigSource = function (headerConfig) {
            return headerConfig;
         };

         $scope.$on('headerUpdated', function (event, args) {
            $scope.headerConfig = modifyConfigSource(args);
         });
      }])

      .directive('finderHeader', [function () {
         let defaults = {
            current: "none",
            heading: "ICSM",
            headingtitle: "ICSM",
            helpurl: "help.html",
            helptitle: "Get help about ICSM",
            helpalttext: "Get help about ICSM",
            skiptocontenttitle: "Skip to content",
            skiptocontent: "Skip to content",
            quicklinksurl: "/search/api/quickLinks/json?lang=en-US"
         };
         return {
            transclude: true,
            restrict: 'EA',
            templateUrl: "header/header.html",
            scope: {
               current: "=",
               breadcrumbs: "=",
               heading: "=",
               headingtitle: "=",
               helpurl: "=",
               helptitle: "=",
               helpalttext: "=",
               skiptocontenttitle: "=",
               skiptocontent: "=",
               quicklinksurl: "="
            },
            link: function (scope, element, attrs) {
               let data = angular.copy(defaults);
               angular.forEach(defaults, function (value, key) {
                  if (!(key in scope)) {
                     scope[key] = value;
                  }
               });
            }
         };
      }]);
}