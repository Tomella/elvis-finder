{
   class MetadataService {
      constructor($http, $q, configService) {
         this.configService = configService;
         this.request = $http;
         this.data = {};
         this.configService.getConfig("metadata").then(config => {
            this.request.get(config.allMetadataUrl).then(solrResponse => {
               let map = {};
               solrResponse.data.response.docs.forEach(item => {
                  map[item.metadata_id] = item;
               });

               this.data.map = map;
            });
         });
      }
   }

   MetadataService.$inject = ["$http", "$q", "configService"];


   angular.module('finder.metadata', ['bw.paging', 'finder.metadata.item'])

      .directive("metadataView", ["$rootScope", "flashService", "mapService", "solrService", "shapeService",
            function ($rootScope, flashService, mapService, solrService, shapeService) {
         return {
            restrict: "AE",
            templateUrl: "metadata/metadataview.html",
            link: function (scope) {
               let layer = null;

               $rootScope.$on("metadata.selected", (event, data) => {
                  let flasher = flashService.add("Retrieving file information", 30000, true);
                  mapService.getMap().then(map => {
                     scope.bounds = map.getBounds();
                     layer = shapeService.rectangle("bounds", scope.bounds);
                     solrService.tree(data.metadata_id, scope.bounds).then(datasets => {
                        scope.datasets = datasets;
                        flasher.remove();
                     });
                  });
                  scope.metadata = data;
               });

               scope.clear = function () {
                  scope.metadata = null;
                  layer.remove();
                  $rootScope.$broadcast("metadata.cleared");
               };
            }
         };
      }])

      .directive("metadataType", [function () {
         return {
            scope: {
               type: "="
            },
            templateUrl: "metadata/type.html",
            link: function (scope) {
               scope.toggleAll = function (items) {
                  console.log("yes")
                  let allSelected = true;
                  items.forEach(item => {
                     allSelected &= item.selected;
                  });

                  items.forEach(item => {
                     item.selected = !allSelected;
                  });
               };

               scope.allSelected = items => items.reduce((value, item) => value && item.selected, true);
            }
         };
      }])

      .directive("metadataSubtype", ["$rootScope", function ($rootScope) {
         return {
            scope: {
               subtypes: "="
            },
            templateUrl: "metadata/subtype.html",
            link: function (scope, element) {
               scope.paging = {
                  page: 1,
                  pageSize: 20
               };

               $rootScope.$on("metadata.cleared", function () {
                  scope.paging.page = 1;
                  scope.data = null;
               });
               scope.$watch("subtypes", function (newVal, oldVal) {
                  if (!newVal) {
                     scope.data = null;
                  } else {
                     scope.setPage(1, 20);
                  }
               });

               scope.setPage = function (page, pagesize) {
                  scope.data = scope.subtypes.slice(pagesize * (page - 1), page * pagesize);
               };
               scope.setPage(1, 20);
            }
         };
      }])

      .directive('finderMetadataLink', [function () {

         return {
            restrict: 'AE',
            template: "<a target='_blank' ng-if='url' ng-href='{{url}}' title='{{hover}}'>{{name}}</a><span ng-if='!url'>{{name}}</span>",
            scope: {
               url: "=?",
               hover: "=?",
               name: "="
            },
            link: function (scope, element) {
            }
         };
      }])

      .filter("sumFiles", [function () {
         return items => items.reduce((sum, item) => sum + item.file_size, 0);
      }])

      .filter("anySelected", [function () {
         return items => items.some(item => item.selected);
      }])

      .filter("allSelected", [function () {
         return items => items.reduce((value, item) => value && item.selected, true);
      }])

      .filter("selected", [function () {
         return items => items.filter(item => item.selected);
      }])

      .filter("length", [function () {
         return items => items.length;
      }])

      .service('metadataService', MetadataService);

}