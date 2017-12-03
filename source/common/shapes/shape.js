{
   class ShapeService {
      constructor(mapService) {
         mapService.getMap().then(map => {
            this.map = map;
         });

         this.names = {
            metadata: {
               color: "#114400",
               weight: 1,
               fillOpacity: 0.1
            },

            bounds: {
               color: "#ff7800",
               weight: 1,
               fillOpacity: 0.1
            },

            dataset: {
               color: "#000000",
               weight: 3,
               fillOpacity: 0.1
            },

            zoom: {
               color: "#ff0000",
               weight: 3,
               fillOpacity: 0
            },
         }
      }

      rectangle(name, bounds) {
         return L.rectangle(bounds, this.names[name]).addTo(this.map);
      }

      zoom(bounds, clearZoomCallback) {
         if(this.zoomLayer) {
            if(this.clearZoomCallback) {
               this.clearZoomCallback();
            }
            this.zoomLayer.remove();
            clearTimeout(this.zoomTimer);
         }
         this.clearZoomCallback = clearZoomCallback;

         let options = Object.assign({}, this.names["zoom"])
         let layer = this.zoomLayer = L.rectangle(bounds, options).addTo(this.map);
         options.opacity = 1;
         // Give it two seconds before we fade...
         this.zoomTimer = setTimeout(fader, 2000);

         return this.map.fitBounds(bounds);

         function fader() {
            if(options.opacity > 0) {
               options.opacity -= 0.05;
               layer.setStyle(options);
               this.zoomTimer = setTimeout(fader, 150);
            } else {
               layer.remove();
            }
         }
      }
   }

   angular.module("finder.shape", [])

      .service("shapeService", ShapeService);

   ShapeService.$inject = ["mapService"];
}