{

   class FindService {
      constructor(mapService, solrService) {
         let _this = this;
         this.data = {};
         mapService.getMap().then(map => {
            map.on('resize moveend viewreset', update);

            function update() {
               let bounds = map.getBounds();
               solrService.facets(bounds).then(list => {
                  _this.data.list = list;
                  _this.data.bounds = {
                     west: bounds.getWest(),
                     east: bounds.getEast(),
                     north: bounds.getNorth(),
                     south: bounds.getSouth()
                  };
               });
            }
         });
      }
   }

   FindService.$inject = ["mapService", "solrService"];


   angular.module('finder.find', ['finder.metadata'])

      .directive('findList', ['$rootScope', 'findService', 'metadataService', function ($rootScope, findService, metadataService) {
         return {
            restrict: "AE",
            templateUrl: 'find/findlist.html',
            link: function (scope) {
               scope.data = findService.data;
               scope.metadata = metadataService.data;
               scope.selection = false;

               $rootScope.$on("metadata.selected", () => {
                  scope.selection = true;
               });
               $rootScope.$on("metadata.cleared", () => {
                  scope.metadata = metadataService.data;
                  scope.selection = false;
               });
            }
         };
      }])

      .directive('metadataMatch', ["$rootScope", "shapeService", function ($rootScope, shapeService) {
         return {
            restrict: "AE",
            templateUrl: 'find/metadatamatches.html',
            scope: {
               metadata: "=",
               item: "="
            },
            link: function (scope) {
               let layer = null;

               scope.select = function () {
                  $rootScope.$broadcast("metadata.selected", Object.assign({}, scope.item, scope.metadata));
               };

               scope.show = function (item) {
                  console.log("show...")
                  scope.hide();
                  layer = shapeService.rectangle("metadata", [[item.bbox__minY, item.bbox__minX], [item.bbox__maxY, item.bbox__maxX]]);
               };

               scope.hide = function () {
                  console.log("Hide...");
                  if (layer) {
                     layer.remove();
                  }
               };

               scope.$on('$destroy', function () {
                  console.log("Destroying...")
                  if (layer) {
                     layer.remove();
                  }
               });
            }
         };
      }])

      .directive('finderQuickfind', ['findService', function (findService) {
         return {
            restrict: "AE",
            templateUrl: 'find/quickfind.html',
            link: function (scope) {
               scope.state = findService.data;

               scope.loadDocs = function () {
                  return findService.filtered().then(fetched => {
                     return fetched.response.docs;
                  });
               };

               scope.clear = function () {
                  scope.state.searched = null;
                  $timeout(() => {
                     $rootScope.$broadcast("clear.button.fired");
                  }, 10);
               };

               scope.search = function search(item) {
                  scope.showFilters = false;
                  searchService.search(item);
                  $timeout(() => {
                     $rootScope.$broadcast("search.button.fired");
                  }, 100);
               };
            }
         };
      }])

      .directive("finderZoom", ["shapeService", function (shapeService) {
         return {
            templateUrl: "find/zoombutton.html",
            restrict: "AE",
            scope: {
               item: "=",
               title: "@"
            },
            link: function (scope) {
               let timer = null;

               scope.zoom = function () {
                  clearTimeout(timer);

                  let bounds = [
                     [scope.item.bbox__minY, scope.item.bbox__minX],
                     [scope.item.bbox__maxY, scope.item.bbox__maxX]
                  ];
                  scope.item.lastZoom = true;
                  shapeService.zoom(bounds, () => {
                     scope.item.lastZoom = false;
                  });

                  timer = setTimeout(() => {
                     scope.item.lastZoom = false;
                  }, 4000);

               };
            }
         };
      }])

      .filter('findTooltip', [function () {
         return function (model) {
            let buffer = "<div style='text-align:left'>";
            if (model.variant) {
               let variants = model.variant.split("|");
               variants.forEach((name, index) => {
                  buffer += index ? "" : "Also known as";
                  buffer += (index && index < variants.length - 1 ? "," : "") + " ";
                  if (index && index === variants.length - 1) {
                     buffer += "or ";
                  }
                  buffer += name;
               });
               buffer += "<br/>";
            }
            buffer += "Lat " + model.location.split(" ").reverse().join("&deg; Lng ") + "&deg;<br/>Feature type: " +
               model.feature + "</div>";

            return buffer;
         };
      }])

      .filter('fileSize', function () {
         var meg = 1000 * 1000;
         var gig = meg * 1000;
         var ter = gig * 1000;

         return function (size) {
            if (!size) {
               return "-";
            }

            if (("" + size).indexOf(" ") > -1) {
               return size;
            }

            size = parseFloat(size);

            if (size < 1000) {
               return size + " bytes";
            }
            if (size < meg) {
               return (size / 1000).toFixed(1) + " kB";
            }
            if (size < gig) {
               return (size / meg).toFixed(1) + " MB";
            }
            if (size < ter) {
               return (size / gig).toFixed(1) + " GB";
            }
            return (size / ter).toFixed(1) + " TB";
         };
      })

      .service('findService', FindService);
}