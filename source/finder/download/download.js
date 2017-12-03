{
   angular.module("finder.download", [])

   .directive("downloadContinue", [function() {
      return {
         scope: {
            datatree: "="
         },
         link: function(scope) {
            scope.$watch("datatree", (tree) => {

            });
         }
      };
   }]);
}