{
   angular.module("finder.metadata.item", [])

      .directive("metadataItem", ['shapeService', function (shapeService) {
         return {
            templateUrl: "metadata/item.html",
            scope: {
               item: "="
            },
            link: function (scope, element) {
               let layer = null;

               scope.show = function () {
                  let item = scope.item;
                  scope.hide();
                  layer = shapeService.rectangle("dataset", [[item.bbox__minY, item.bbox__minX], [item.bbox__maxY, item.bbox__maxX]]);
               };

               scope.hide = function () {
                  if (layer) {
                     layer.remove();
                  }
               };

            }
         };
      }]);

}