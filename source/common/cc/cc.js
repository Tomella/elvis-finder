{

   let versions = {
      3: {
         version: "3.0",
         link: "https://creativecommons.org/licenses/by/3.0/au/"
      },
      4: {
         version: "4.0",
         link: "https://creativecommons.org/licenses/by/4.0/"
      }
   };

   angular.module("finder.cc", ['finder.contributors'])

      .directive('finderCc', ["contributorsService", function (contributorsService) {
         return {
            templateUrl: 'cc/cc.html',
            scope: {
               orgName: "=?"
            },
            link: function (scope) {
               let version = contributorsService.getCcLicence(scope.orgName);
               scope.details = versions[version];
               scope.template = 'cc/cctemplate.html';
            }
         };
      }]);

}
