{
   class RootCtrl {
      constructor(configService, mapService) {
         mapService.getMap().then(map => {
            // TODO: Remove this hack when we rewrite the map library.
            map.fitBounds([[-9, 155], [-45, 112]]);
            this.map = map;
         });
         configService.getConfig().then(data => {
            this.data = data;
         });
      }
   }
   RootCtrl.$invoke = ['configService', 'mapService'];

   angular.module("FinderApp", [
      'explorer.config',
      'explorer.confirm',
      'explorer.enter',
      'explorer.flasher',
      'explorer.googleanalytics',
      'explorer.info',
      'explorer.message',
      'explorer.modal',
      'explorer.persist',
      'explorer.version',

      'exp.ui.templates',
      'explorer.map.templates',

      'ui.bootstrap',
      'ngAutocomplete',
      'ngSanitize',
      'page.footer',

      'geo.map',
      'geo.maphelper',

      'finder.about',
      'finder.cc',
      'finder.contributors',
      'finder.extent',
      'finder.find',
      'finder.header',
      'finder.help',
      'finder.lock',
      'finder.maps',
      'finder.navigation',
      'finder.panes',
      'finder.popover',
      'finder.proxy',
      'finder.reset',
      'finder.side-panel',
      'finder.shape',
      'finder.solr',
      'finder.splash',
      'finder.templates',
      'finder.toolbar',
      'finder.utils'
   ])

      // Set up all the service providers here.
      .config(['configServiceProvider', 'persistServiceProvider', 'projectsServiceProvider', 'versionServiceProvider',
         function (configServiceProvider, persistServiceProvider, projectsServiceProvider, versionServiceProvider) {
            configServiceProvider.location("finder/resources/config/config.json?v=4");
            configServiceProvider.dynamicLocation("finder/resources/config/configclient.json?");
            versionServiceProvider.url("finder/assets/package.json");
            persistServiceProvider.handler("local");
            projectsServiceProvider.setProject("finder");
         }])

      .controller("RootCtrl", RootCtrl)

      .filter('bytes', function () {
         return function (bytes, precision) {
            if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
            if (typeof precision === 'undefined') precision = 0;
            let units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
               number = Math.floor(Math.log(bytes) / Math.log(1024));
            return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
         };
      })

      .factory("userService", [function () {
         return {
            login: noop,
            hasAcceptedTerms: noop,
            setAcceptedTerms: noop,
            getUsername: function () {
               return "anon";
            }
         };
         function noop() { return true; }
      }]);


   // A couple of polyfills for ie11
   if (!('every' in Array.prototype)) {
      Array.prototype.every = function (tester, that /*opt*/) {
         for (let i = 0, n = this.length; i < n; i++)
            if (i in this && !tester.call(that, this[i], i, this))
               return false;
         return true;
      };
   }

   if (!Array.from) {
      Array.from = (function () {
         let toStr = Object.prototype.toString;
         let isCallable = function (fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
         };
         let toInteger = function (value) {
            let number = Number(value);
            if (isNaN(number)) { return 0; }
            if (number === 0 || !isFinite(number)) { return number; }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
         };
         let maxSafeInteger = Math.pow(2, 53) - 1;
         let toLength = function (value) {
            let len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
         };

         // The length property of the from method is 1.
         return function from(arrayLike/*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            let C = this;

            // 2. Let items be ToObject(arrayLike).
            let items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike === null) {
               throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }

            // 4. If mapfn is undefined, then let mapping be false.
            let mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            let T;
            if (typeof mapFn !== 'undefined') {
               // 5. else
               // 5. a If IsCallable(mapfn) is false, throw a TypeError exception.
               if (!isCallable(mapFn)) {
                  throw new TypeError('Array.from: when provided, the second argument must be a function');
               }

               // 5. b. If thisArg was supplied, let T be thisArg; else let T be undefined.
               if (arguments.length > 2) {
                  T = arguments[2];
               }
            }

            // 10. Let lenValue be Get(items, "length").
            // 11. Let len be ToLength(lenValue).
            let len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method
            // of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            let A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            let k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            let kValue;
            while (k < len) {
               kValue = items[k];
               if (mapFn) {
                  A[k] = typeof T === 'undefined' ? mapFn(kValue, k) : mapFn.call(T, kValue, k);
               } else {
                  A[k] = kValue;
               }
               k += 1;
            }
            // 18. Let putStatus be Put(A, "length", len, true).
            A.length = len;
            // 20. Return A.
            return A;
         };
      }());
   }
}
