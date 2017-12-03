/**
Licensed to the Apache Software Foundation (ASF) under one
or more contributor license agreements.  See the NOTICE file
distributed with this work for additional information
regarding copyright ownership.  The ASF licenses this file
to you under the Apache License, Version 2.0 (the
"License"); you may not use this file except in compliance
with the License.  You may obtain a copy of the License at

  http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing,
software distributed under the License is distributed on an
"AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
KIND, either express or implied.  See the License for the
specific language governing permissions and limitations
under the License.
*/

"use strict";

{
   angular.module("finder.authorities", []).directive('finderAuthorities', ["groupsService", "searchService", function (groupsService, searchService) {
      return {
         restrict: 'EA',
         templateUrl: "authorities/authorities.html",
         link: function link(scope) {
            groupsService.getAuthorities().then(function (authorities) {
               return scope.authorities = authorities;
            });
            scope.change = function (item) {
               searchService.filtered();
            };
         }
      };
   }]);
}
'use strict';

{
   angular.module('finder.autoscroll', []).directive('autoScroll', ['$timeout', '$rootScope', function ($timeout, $rootScope) {
      return {
         scope: {
            trigger: "@",
            y: "@",
            height: "@"
         },
         link: function link(scope, element, attrs) {
            var timeout = void 0,
                oldBottom = void 0,
                startHeight = void 0;

            if (scope.height) {
               startHeight = +scope.height;
            } else {
               startHeight = 100;
            }
            oldBottom = startHeight;

            element.on("scroll", function (event) {
               var scrollHeight = element.scrollTop(),
                   target = element.find(attrs.autoScroll),
                   totalHeight = target.height(),
                   scrollWindow = element.height(),
                   scrollBottom = void 0,
                   up = void 0;

               if (scrollWindow >= totalHeight) {
                  return;
               }
               scrollBottom = totalHeight - scrollHeight - scrollWindow;
               up = oldBottom < scrollBottom;
               oldBottom = scrollBottom;
               if (scrollBottom < startHeight && !up) {
                  // Add some debounce
                  if (timeout) {
                     $timeout.cancel(timeout);
                  }
                  timeout = $timeout(function () {
                     $rootScope.$broadcast(scope.trigger);
                  }, 30);
               }
            });
         }
      };
   }]);
}
"use strict";

{

   var versions = {
      3: {
         version: "3.0",
         link: "https://creativecommons.org/licenses/by/3.0/au/"
      },
      4: {
         version: "4.0",
         link: "https://creativecommons.org/licenses/by/4.0/"
      }
   };

   angular.module("finder.cc", ['finder.contributors']).directive('finderCc', ["contributorsService", function (contributorsService) {
      return {
         templateUrl: 'cc/cc.html',
         scope: {
            orgName: "=?"
         },
         link: function link(scope) {
            var version = contributorsService.getCcLicence(scope.orgName);
            scope.details = versions[version];
            scope.template = 'cc/cctemplate.html';
         }
      };
   }]);
}
"use strict";

{

   angular.module('finder.contributors', []).directive("finderContributors", ["$interval", "contributorsService", function ($interval, contributorsService) {
      return {
         templateUrl: "contributors/contributors.html",
         scope: {},
         link: function link(scope, element) {
            var timer = void 0;

            scope.contributors = contributorsService.getState();

            scope.over = function () {
               $interval.cancel(timer);
               scope.contributors.ingroup = true;
            };

            scope.out = function () {
               timer = $interval(function () {
                  scope.contributors.ingroup = false;
               }, 1000);
            };

            scope.unstick = function () {
               scope.contributors.ingroup = scope.contributors.show = scope.contributors.stick = false;
               element.find("a").blur();
            };
         }
      };
   }]).directive("finderContributorsLink", ["$interval", "contributorsService", function ($interval, contributorsService) {
      return {
         restrict: "AE",
         templateUrl: "contributors/show.html",
         scope: {},
         link: function link(scope) {
            var timer = void 0;
            scope.contributors = contributorsService.getState();
            scope.over = function () {
               $interval.cancel(timer);
               scope.contributors.show = true;
            };

            scope.toggleStick = function () {
               scope.contributors.stick = !scope.contributors.stick;
               if (!scope.contributors.stick) {
                  scope.contributors.show = scope.contributors.ingroup = false;
               }
            };

            scope.out = function () {
               timer = $interval(function () {
                  scope.contributors.show = false;
               }, 700);
            };
         }
      };
   }]).factory("contributorsService", ContributorsService).filter("activeContributors", function () {
      return function (contributors) {
         if (!contributors) {
            return [];
         }
         return contributors.filter(function (contributor) {
            return contributor.enabled;
         });
      };
   });

   ContributorsService.$inject = ["$http"];
}

function ContributorsService($http) {
   var state = {
      show: false,
      ingroup: false,
      stick: false
   };

   $http.get("finder/resources/config/contributors.json").then(function (response) {
      state.orgs = response.data;
   });

   return {
      getState: function getState() {
         return state;
      },

      getCcLicence: function getCcLicence(name) {
         var org = state.orgs.find(function (org) {
            return org.name === name;
         });

         return !org || !org.ccLicence ? 4 : org.ccLicence;
      }
   };
}
'use strict';

{
   angular.module('finder.header', []).controller('headerController', ['$scope', '$q', '$timeout', function ($scope, $q, $timeout) {

      var modifyConfigSource = function modifyConfigSource(headerConfig) {
         return headerConfig;
      };

      $scope.$on('headerUpdated', function (event, args) {
         $scope.headerConfig = modifyConfigSource(args);
      });
   }]).directive('finderHeader', [function () {
      var defaults = {
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
         link: function link(scope, element, attrs) {
            var data = angular.copy(defaults);
            angular.forEach(defaults, function (value, key) {
               if (!(key in scope)) {
                  scope[key] = value;
               }
            });
         }
      };
   }]);
}
"use strict";

{
   angular.module("finder.tree", []).directive("finderTree", ["groupsService", "searchService", function (groupsService, searchService) {
      return {
         templateUrl: "filters/tree.html",
         restrict: "AE",
         link: function link(scope) {
            groupsService.getGroups().then(function (groups) {
               return scope.groups = groups;
            });

            scope.change = function (group) {
               searchService.filtered();
               if (group.selected) {
                  group.expanded = true;
               }
            };
         }
      };
   }]).filter("withTotals", function () {
      return function (list) {
         if (list) {
            return list.filter(function (item) {
               return item.total;
            });
         }
      };
   });
}
"use strict";

{
	angular.module("finder.help", []).directive("finderHelp", [function () {
		return {
			templateUrl: "help/help.html"
		};
	}]).directive("finderFaqs", [function () {
		return {
			restrict: "AE",
			templateUrl: "help/faqs.html",
			scope: {
				faqs: "="
			},
			link: function link(scope) {
				scope.focus = function (key) {
					$("#faqs_" + key).focus();
				};
			}
		};
	}]).controller("HelpCtrl", HelpCtrl).factory("helpService", HelpService);

	HelpCtrl.$inject = ['$log', 'helpService'];
}

function HelpCtrl($log, helpService) {
	var self = this;
	$log.info("HelpCtrl");
	helpService.getFaqs().then(function (faqs) {
		self.faqs = faqs;
	});
}

HelpService.$inject = ['$http'];
function HelpService($http) {
	var FAQS_SERVICE = "finder/resources/config/faqs.json";

	return {
		getFaqs: function getFaqs() {
			return $http.get(FAQS_SERVICE, { cache: true }).then(function (response) {
				return response.data;
			});
		}
	};
}
"use strict";

{
   angular.module("finder.lock", []).directive("finderLock", [function () {
      return {
         scope: {
            hover: "="
         },
         template: '<i class="fa fa-lock" aria-hidden="true" title="The features shown on the map are locked to the current search results. Clear your search results to show more features"></i>'
      };
   }]);
}
'use strict';

{
   angular.module('finder.altthemes', ['finder.storage'])

   /**
      *
      * Override the original mars user.
      *
        */
   .directive('altThemes', ['altthemesService', function (themesService) {
      return {
         restrict: 'AE',
         templateUrl: 'navigation/altthemes.html',
         scope: {
            current: "="
         },
         link: function link(scope) {
            themesService.getThemes().then(function (themes) {
               scope.themes = themes;
            });

            themesService.getCurrentTheme().then(function (theme) {
               scope.theme = theme;
            });

            scope.changeTheme = function (theme) {
               scope.theme = theme;
               themesService.setTheme(theme.key);
            };
         }
      };
   }]).controller('altthemesCtrl', ['altthemesService', function (altthemesService) {
      this.service = altthemesService;
   }]).filter('altthemesFilter', function () {
      return function (features, theme) {
         var response = [];
         // Give 'em all if they haven't set a theme.
         if (!theme) {
            return features;
         }

         if (features) {
            features.forEach(function (feature) {
               if (feature.themes) {
                  if (feature.themes.some(function (name) {
                     return name === theme.key;
                  })) {
                     response.push(feature);
                  }
               }
            });
         }
         return response;
      };
   }).factory('altthemesService', ['$q', '$http', 'storageService', function ($q, $http, storageService) {
      var THEME_PERSIST_KEY = 'finder.current.theme';
      var THEMES_LOCATION = 'finder/resources/config/themes.json';
      var DEFAULT_THEME = "All";
      var waiting = [];
      var self = this;

      this.themes = [];
      this.theme = null;

      storageService.getItem(THEME_PERSIST_KEY).then(function (value) {
         if (!value) {
            value = DEFAULT_THEME;
         }
         $http.get(THEMES_LOCATION, { cache: true }).then(function (response) {
            var themes = response.data.themes;

            self.themes = themes;
            self.theme = themes[value];
            // Decorate the key
            angular.forEach(themes, function (theme, key) {
               theme.key = key;
            });
            waiting.forEach(function (wait) {
               wait.resolve(self.theme);
            });
         });
      });

      this.getCurrentTheme = function () {
         if (this.theme) {
            return $q.when(self.theme);
         } else {
            var waiter = $q.defer();
            waiting.push(waiter);
            return waiter.promise;
         }
      };

      this.getThemes = function () {
         return $http.get(THEMES_LOCATION, { cache: true }).then(function (response) {
            return response.data.themes;
         });
      };

      this.setTheme = function (key) {
         this.theme = this.themes[key];
         storageService.setItem(THEME_PERSIST_KEY, key);
      };

      return this;
   }]).filter('altthemesEnabled', function () {
      return function (headers) {
         if (headers) {
            return headers.filter(function (value) {
               return !!value.enabled;
            });
         }
         return headers;
      };
   }).filter('altthemesMatchCurrent', function () {
      return function (headers, current) {
         if (headers) {
            return headers.filter(function (value) {
               return !!value.keys.find(function (key) {
                  return key === current;
               });
            });
         }
         return headers;
      };
   });
}
'use strict';

{
   angular.module('finder.navigation', ['finder.altthemes'])
   /**
    *
    * Override the original mars user.
    *
    */
   .directive('finderNavigation', [function () {
      return {
         restrict: 'AE',
         template: "<alt-themes current='current'></alt-themes>",
         scope: {
            current: "=?"
         },
         link: function link(scope) {
            scope.username = "Anonymous";
            if (!scope.current) {
               scope.current = "none";
            }
         }
      };
   }]).factory('navigationService', [function () {
      return {};
   }]);
}
'use strict';

{
   angular.module("finder.pill", []).directive('finderPill', ['searchService', function (searchService) {
      return {
         restrict: 'EA',
         templateUrl: "pill/pill.html",
         scope: {
            item: "=",
            update: "&",
            name: "@?"
         },
         link: function link(scope) {
            if (scope.item.label) {
               scope.label = scope.item.label.charAt(0).toUpperCase() + scope.item.label.slice(1) + ": ";
            }

            if (!scope.name) {
               scope.name = "name";
            }
            scope.deselect = function () {
               scope.item.selected = false;
               searchService.filtered();
            };
         }
      };
   }]);
}
"use strict";

{
   angular.module("finder.proxy", []).provider("proxy", function () {

      this.$get = ['$http', '$q', function ($http, $q) {
         var base = "proxy/";

         this.setProxyBase = function (newBase) {
            base = newBase;
         };

         return {
            get: function get(url, options) {
               return this._method("get", url, options);
            },

            post: function post(url, options) {
               return this._method("post", url, options);
            },

            put: function put(url, options) {
               return this._method("put", url, options);
            },

            _method: function _method(method, url, options) {
               return $http[method](base + url, options).then(function (response) {
                  return response.data;
               });
            }
         };
      }];
   });
}
'use strict';

{
   angular.module('finder.reset', []).directive('resetPage', function ($window) {
      return {
         restrict: 'AE',
         scope: {},
         templateUrl: 'reset/reset.html',
         controller: ['$scope', function ($scope) {
            $scope.reset = function () {
               $window.location.reload();
            };
         }]
      };
   });
}
"use strict";

{

   angular.module("finder.scroll", []).directive("commonScroller", ['$timeout', function ($timeout) {
      return {
         scope: {
            more: "&",
            buffer: "=?"
         },
         link: function link(scope, element, attrs) {
            var fetching = void 0;
            if (!scope.buffer) scope.buffer = 100;

            element.on("scroll", function (event) {
               var target = event.currentTarget;
               $timeout.cancel(fetching);
               fetching = $timeout(bouncer, 120);

               function bouncer() {
                  if (scope.more && target.scrollHeight - target.scrollTop <= target.clientHeight + scope.buffer) {
                     scope.more();
                  }
               }
            });
         }
      };
   }]);
}
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

{
   var ShapeService = function () {
      function ShapeService(mapService) {
         var _this = this;

         _classCallCheck(this, ShapeService);

         mapService.getMap().then(function (map) {
            _this.map = map;
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
            }
         };
      }

      _createClass(ShapeService, [{
         key: "rectangle",
         value: function rectangle(name, bounds) {
            return L.rectangle(bounds, this.names[name]).addTo(this.map);
         }
      }, {
         key: "zoom",
         value: function zoom(bounds, clearZoomCallback) {
            if (this.zoomLayer) {
               if (this.clearZoomCallback) {
                  this.clearZoomCallback();
               }
               this.zoomLayer.remove();
               clearTimeout(this.zoomTimer);
            }
            this.clearZoomCallback = clearZoomCallback;

            var options = Object.assign({}, this.names["zoom"]);
            var layer = this.zoomLayer = L.rectangle(bounds, options).addTo(this.map);
            options.opacity = 1;
            // Give it two seconds before we fade...
            this.zoomTimer = setTimeout(fader, 2000);

            return this.map.fitBounds(bounds);

            function fader() {
               if (options.opacity > 0) {
                  options.opacity -= 0.05;
                  layer.setStyle(options);
                  this.zoomTimer = setTimeout(fader, 150);
               } else {
                  layer.remove();
               }
            }
         }
      }]);

      return ShapeService;
   }();

   angular.module("finder.shape", []).service("shapeService", ShapeService);

   ShapeService.$inject = ["mapService"];
}
'use strict';

{
   angular.module("finder.side-panel", []).factory('panelSideFactory', ['$rootScope', '$timeout', function ($rootScope, $timeout) {
      var state = {
         left: {
            active: null,
            width: 0
         },

         right: {
            active: null,
            width: 0
         }
      };

      function setSide(state, value) {
         var response = state.active;

         if (response === value) {
            state.active = null;
            state.width = 0;
         } else {
            state.active = value;
         }
         return !response;
      }

      return {
         state: state,
         setLeft: function setLeft(value) {
            var result = setSide(state.left, value);
            if (result) {
               state.left.width = 320; // We have a hard coded width at the moment we will probably refactor to parameterize it.
            }
            return result;
         },

         setRight: function setRight(data) {
            state.right.width = data.width;
            var response = setSide(state.right, data.name);
            $rootScope.$broadcast('side.panel.change', {
               side: "right",
               data: state.right,
               width: data.width
            });
            return response;
         }
      };
   }]).directive('sidePanelRightOppose', ["panelSideFactory", function (panelSideFactory) {
      return {
         restrict: 'E',
         transclude: true,
         template: '<div class="contentContainer" ng-attr-style="right:{{right.width}}">' + '<ng-transclude></ng-transclude>' + '</div>',
         link: function link(scope) {
            scope.right = panelSideFactory.state.right;
         }
      };
   }]).directive('sidePanelRight', ["panelSideFactory", function (panelSideFactory) {
      return {
         restrict: 'E',
         transclude: true,
         templateUrl: 'side-panel/side-panel-right.html',
         link: function link(scope) {
            scope.right = panelSideFactory.state.right;

            scope.closePanel = function () {
               panelSideFactory.setRight({ name: null, width: 0 });
            };
         }
      };
   }]).directive('panelTrigger', ["panelSideFactory", function (panelSideFactory) {
      return {
         restrict: 'E',
         transclude: true,
         templateUrl: 'side-panel/trigger.html',
         scope: {
            default: "@?",
            panelWidth: "@",
            name: "@",
            iconClass: "@",
            panelId: "@"
         },
         link: function link(scope) {
            scope.toggle = function () {
               panelSideFactory.setRight({
                  width: scope.panelWidth,
                  name: scope.panelId
               });
            };
            if (scope.default) {
               panelSideFactory.setRight({
                  width: scope.panelWidth,
                  name: scope.panelId
               });
            }
         }
      };
   }]).directive('panelOpenOnEvent', ["$rootScope", "panelSideFactory", function ($rootScope, panelSideFactory) {
      return {
         restrict: 'E',
         scope: {
            panelWidth: "@",
            eventName: "@",
            panelId: "@",
            side: "@?"
         },
         link: function link(scope) {
            if (!scope.side) {
               scope.side = "right";
            }
            $rootScope.$on(scope.eventName, function (event, data) {
               var state = panelSideFactory.state[scope.side];
               if (state && (!state.active || scope.panelId !== state.active)) {
                  var params = {
                     width: scope.panelWidth,
                     name: scope.panelId
                  };

                  if (scope.side === "right") {
                     panelSideFactory.setRight(params);
                  } else {
                     panelSideFactory.setLeft(params);
                  }
               }
            });
         }
      };
   }]).directive('panelCloseOnEvent', ["$rootScope", "panelSideFactory", function ($rootScope, panelSideFactory) {
      return {
         restrict: 'E',
         scope: {
            eventName: "@",
            side: "@?"
         },
         link: function link(scope) {
            if (!scope.side) {
               scope.side = "right";
            }
            $rootScope.$on(scope.eventName, function (event, data) {
               var state = panelSideFactory.state[scope.side];
               if (state && state.active) {
                  var params = {
                     name: null
                  };

                  if (scope.side === "right") {
                     panelSideFactory.setRight(params);
                  } else {
                     panelSideFactory.setLeft(params);
                  }
               }
            });
         }
      };
   }]).directive('sidePanelLeft', ['panelSideFactory', function (panelSideFactory) {
      return {
         restrict: 'E',
         transclude: true,
         templateUrl: 'side-panel/side-panel-left.html',
         link: function link(scope) {
            scope.left = panelSideFactory.state.left;

            scope.closeLeft = function () {
               panelSideFactory.setLeft(null);
            };
         }
      };
   }]);
}
"use strict";

{

   angular.module("finder.storage", []).factory("storageService", ['$log', '$q', function ($log, $q) {
      var project = "elvis.finder";
      return {
         setGlobalItem: function setGlobalItem(key, value) {
            this._setItem("_system", key, value);
         },

         setItem: function setItem(key, value) {
            this._setItem(project, key, value);
         },

         _setItem: function _setItem(project, key, value) {
            $log.debug("Fetching state for key locally" + key);
            localStorage.setItem(project + "." + key, JSON.stringify(value));
         },

         getGlobalItem: function getGlobalItem(key) {
            return this._getItem("_system", key);
         },

         getItem: function getItem(key) {
            var deferred = $q.defer();
            this._getItem(project, key).then(function (response) {
               deferred.resolve(response);
            });
            return deferred.promise;
         },

         _getItem: function _getItem(project, key) {
            $log.debug("Fetching state locally for key " + key);
            var item = localStorage.getItem(project + "." + key);
            if (item) {
               try {
                  item = JSON.parse(item);
               } catch (e) {
                  // Do nothing as it will be a string
               }
            }
            return $q.when(item);
         }
      };
   }]);
}
"use strict";

{

   angular.module("finder.restrict.pan", []).directive("restrictPan", ['mapService', function (mapService) {
      return {
         restrict: "AE",
         scope: {
            bounds: "="
         },
         link: function link(scope) {
            mapService.getMap().then(function (map) {

               // We expect ll and ur in bounds
               var bounds = scope.bounds,
                   ll = bounds[0],
                   ur = bounds[1],
                   southWest = L.latLng(ll[0], ll[1]),
                   northEast = L.latLng(ur[0], ur[1]),
                   restrict = L.latLngBounds(southWest, northEast);

               map.setMaxBounds(restrict);
               map.on('drag', function () {
                  map.panInsideBounds(restrict, { animate: false });
               });
            });
         }
      };
   }]);
}
"use strict";

{

   angular.module("finder.utils", []).filter("finderSplitBar", function () {
      return function () {
         var val = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : "";

         var buffer = "";
         val.split("|").forEach(function (name, index, variants) {
            buffer += (index && index < variants.length - 1 ? "," : "") + " ";
            if (index && index === variants.length - 1) {
               buffer += "or ";
            }
            buffer += name;
         });
         return buffer;
      };
   }).filter("finderGoogleLink", ['configService', function (configService) {
      var template = "https://www.google.com/maps/search/?api=1&query=${lat},${lng}";

      return function (what) {
         if (!what) return "";
         var location = what.location.split(" ");

         return template.replace("${lng}", location[0]).replace("${lat}", location[1]);
      };
   }]).directive("finderGoogleAnchor", ['configService', function (configService) {
      var template = "https://www.google.com/maps/search/?api=1&query=${lat},${lng}";
      return {
         scope: {
            linkTitle: "@",
            item: "="
         },
         template: '<span ng-if="hide">{{item.name}}</span>' + '<a ng-if="!hide" ng-href="{{item | finderGoogleLink}}" target="_google" title="{{linkTitle}}">{{item.name}}</a>',
         link: function link(scope) {
            configService.getConfig("hideGoogleLink").then(function (val) {
               scope.hide = !!val;
            });
         }
      };
   }]).factory('finderUtilsService', ['configService', function (configService) {
      var service = {};

      return service;
   }]);
}
"use strict";

{
   AboutService.$inject = ["configService"];

   angular.module('finder.about', []).directive("finderAbout", ["$interval", "aboutService", function ($interval, aboutService) {
      return {
         templateUrl: "about/about.html",
         scope: {},
         link: function link(scope, element) {
            var timer = void 0;

            scope.about = aboutService.getState();

            scope.over = function () {
               $interval.cancel(timer);
               scope.about.ingroup = true;
            };

            scope.out = function () {
               timer = $interval(function () {
                  scope.about.ingroup = false;
               }, 1000);
            };

            scope.unstick = function () {
               scope.about.ingroup = scope.about.show = scope.about.stick = false;
               element.find("a").blur();
            };
         }
      };
   }]).directive("finderAboutLink", ["$interval", "aboutService", function ($interval, aboutService) {
      return {
         restrict: "AE",
         templateUrl: "about/button.html",
         scope: {},
         link: function link(scope) {
            var timer = void 0;
            scope.about = aboutService.getState();
            scope.over = function () {
               $interval.cancel(timer);
               scope.about.show = true;
            };

            scope.toggleStick = function () {
               scope.about.stick = !scope.about.stick;
               if (!scope.about.stick) {
                  scope.about.show = scope.about.ingroup = false;
               }
            };

            scope.out = function () {
               timer = $interval(function () {
                  scope.about.show = false;
               }, 700);
            };
         }
      };
   }]).factory("aboutService", AboutService);
}

function AboutService(configService) {
   var state = {
      show: false,
      ingroup: false,
      stick: false
   };

   configService.getConfig("about").then(function (response) {
      state.items = response;
   });

   return {
      getState: function getState() {
         return state;
      }
   };
}
'use strict';

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

{
   var RootCtrl = function RootCtrl(configService, mapService) {
      var _this = this;

      _classCallCheck(this, RootCtrl);

      mapService.getMap().then(function (map) {
         // TODO: Remove this hack when we rewrite the map library.
         map.fitBounds([[-9, 155], [-45, 112]]);
         _this.map = map;
      });
      configService.getConfig().then(function (data) {
         _this.data = data;
      });
   };

   RootCtrl.$invoke = ['configService', 'mapService'];

   angular.module("FinderApp", ['explorer.config', 'explorer.confirm', 'explorer.enter', 'explorer.flasher', 'explorer.googleanalytics', 'explorer.info', 'explorer.message', 'explorer.modal', 'explorer.persist', 'explorer.version', 'exp.ui.templates', 'explorer.map.templates', 'ui.bootstrap', 'ngAutocomplete', 'ngSanitize', 'page.footer', 'geo.map', 'geo.maphelper', 'finder.about', 'finder.cc', 'finder.contributors', 'finder.extent', 'finder.find', 'finder.header', 'finder.help', 'finder.lock', 'finder.maps', 'finder.navigation', 'finder.panes', 'finder.popover', 'finder.proxy', 'finder.reset', 'finder.side-panel', 'finder.shape', 'finder.solr', 'finder.splash', 'finder.templates', 'finder.toolbar', 'finder.utils'])

   // Set up all the service providers here.
   .config(['configServiceProvider', 'persistServiceProvider', 'projectsServiceProvider', 'versionServiceProvider', function (configServiceProvider, persistServiceProvider, projectsServiceProvider, versionServiceProvider) {
      configServiceProvider.location("finder/resources/config/config.json?v=4");
      configServiceProvider.dynamicLocation("finder/resources/config/configclient.json?");
      versionServiceProvider.url("finder/assets/package.json");
      persistServiceProvider.handler("local");
      projectsServiceProvider.setProject("finder");
   }]).controller("RootCtrl", RootCtrl).filter('bytes', function () {
      return function (bytes, precision) {
         if (isNaN(parseFloat(bytes)) || !isFinite(bytes)) return '-';
         if (typeof precision === 'undefined') precision = 0;
         var units = ['bytes', 'kB', 'MB', 'GB', 'TB', 'PB'],
             number = Math.floor(Math.log(bytes) / Math.log(1024));
         return (bytes / Math.pow(1024, Math.floor(number))).toFixed(precision) + ' ' + units[number];
      };
   }).factory("userService", [function () {
      return {
         login: noop,
         hasAcceptedTerms: noop,
         setAcceptedTerms: noop,
         getUsername: function getUsername() {
            return "anon";
         }
      };
      function noop() {
         return true;
      }
   }]);

   // A couple of polyfills for ie11
   if (!('every' in Array.prototype)) {
      Array.prototype.every = function (tester, that /*opt*/) {
         for (var i = 0, n = this.length; i < n; i++) {
            if (i in this && !tester.call(that, this[i], i, this)) return false;
         }return true;
      };
   }

   if (!Array.from) {
      Array.from = function () {
         var toStr = Object.prototype.toString;
         var isCallable = function isCallable(fn) {
            return typeof fn === 'function' || toStr.call(fn) === '[object Function]';
         };
         var toInteger = function toInteger(value) {
            var number = Number(value);
            if (isNaN(number)) {
               return 0;
            }
            if (number === 0 || !isFinite(number)) {
               return number;
            }
            return (number > 0 ? 1 : -1) * Math.floor(Math.abs(number));
         };
         var maxSafeInteger = Math.pow(2, 53) - 1;
         var toLength = function toLength(value) {
            var len = toInteger(value);
            return Math.min(Math.max(len, 0), maxSafeInteger);
         };

         // The length property of the from method is 1.
         return function from(arrayLike /*, mapFn, thisArg */) {
            // 1. Let C be the this value.
            var C = this;

            // 2. Let items be ToObject(arrayLike).
            var items = Object(arrayLike);

            // 3. ReturnIfAbrupt(items).
            if (arrayLike === null) {
               throw new TypeError('Array.from requires an array-like object - not null or undefined');
            }

            // 4. If mapfn is undefined, then let mapping be false.
            var mapFn = arguments.length > 1 ? arguments[1] : void undefined;
            var T = void 0;
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
            var len = toLength(items.length);

            // 13. If IsConstructor(C) is true, then
            // 13. a. Let A be the result of calling the [[Construct]] internal method
            // of C with an argument list containing the single item len.
            // 14. a. Else, Let A be ArrayCreate(len).
            var A = isCallable(C) ? Object(new C(len)) : new Array(len);

            // 16. Let k be 0.
            var k = 0;
            // 17. Repeat, while k < len… (also steps a - h)
            var kValue = void 0;
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
      }();
   }
}
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

{
   var ExtentService = function ExtentService(mapService, searchService) {
      _classCallCheck(this, ExtentService);

      var bbox = searchService.getSearchCriteria().bbox;

      if (bbox.fromMap) {
         enableMapListeners();
      }

      return {
         getParameters: function getParameters() {
            return bbox;
         }
      };

      function enableMapListeners() {
         mapService.getMap().then(function (map) {
            map.on("moveend", execute);
            map.on("zoomend", execute);
            execute();
         });
      }

      function disableMapListeners() {
         return mapService.getMap().then(function (map) {
            map.off("moveend", execute);
            map.off("zoomend", execute);
            return map;
         });
      }

      function execute() {
         mapService.getMap().then(function (map) {
            var bounds = map.getBounds();
            bbox.yMin = bounds.getSouth();
            bbox.xMin = bounds.getWest();
            bbox.yMax = bounds.getNorth();
            bbox.xMax = bounds.getEast();
            searchService.refresh();
         });
      }
   };

   ExtentService.$inject = ['mapService', 'searchService'];

   angular.module("finder.extent", ["explorer.switch"]).directive("finderExtent", ['extentService', function (extentService) {
      return {
         restrict: "AE",
         templateUrl: "extent/extent.html",
         controller: ['$scope', function ($scope) {
            $scope.parameters = extentService.getParameters();
         }],
         link: function link(scope, element, attrs) {}
      };
   }]).factory("extentService", ExtentService);
}
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

{
   var FindService = function FindService(mapService, solrService) {
      _classCallCheck(this, FindService);

      var _this = this;
      this.data = {};
      mapService.getMap().then(function (map) {
         map.on('resize moveend viewreset', update);

         function update() {
            var bounds = map.getBounds();
            solrService.facets(bounds).then(function (list) {
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
   };

   FindService.$inject = ["mapService", "solrService"];

   angular.module('finder.find', ['finder.metadata']).directive('findList', ['$rootScope', 'findService', 'metadataService', function ($rootScope, findService, metadataService) {
      return {
         restrict: "AE",
         templateUrl: 'find/findlist.html',
         link: function link(scope) {
            scope.data = findService.data;
            scope.metadata = metadataService.data;
            scope.selection = false;

            $rootScope.$on("metadata.selected", function () {
               scope.selection = true;
            });
            $rootScope.$on("metadata.cleared", function () {
               scope.metadata = metadataService.data;
               scope.selection = false;
            });
         }
      };
   }]).directive('metadataMatch', ["$rootScope", "shapeService", function ($rootScope, shapeService) {
      return {
         restrict: "AE",
         templateUrl: 'find/metadatamatches.html',
         scope: {
            metadata: "=",
            item: "="
         },
         link: function link(scope) {
            var layer = null;

            scope.select = function () {
               $rootScope.$broadcast("metadata.selected", Object.assign({}, scope.item, scope.metadata));
            };

            scope.show = function (item) {
               console.log("show...");
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
               console.log("Destroying...");
               if (layer) {
                  layer.remove();
               }
            });
         }
      };
   }]).directive('finderQuickfind', ['findService', function (findService) {
      return {
         restrict: "AE",
         templateUrl: 'find/quickfind.html',
         link: function link(scope) {
            scope.state = findService.data;

            scope.loadDocs = function () {
               return findService.filtered().then(function (fetched) {
                  return fetched.response.docs;
               });
            };

            scope.clear = function () {
               scope.state.searched = null;
               $timeout(function () {
                  $rootScope.$broadcast("clear.button.fired");
               }, 10);
            };

            scope.search = function search(item) {
               scope.showFilters = false;
               searchService.search(item);
               $timeout(function () {
                  $rootScope.$broadcast("search.button.fired");
               }, 100);
            };
         }
      };
   }]).directive("finderZoom", ["shapeService", function (shapeService) {
      return {
         templateUrl: "find/zoombutton.html",
         restrict: "AE",
         scope: {
            item: "=",
            title: "@"
         },
         link: function link(scope) {
            var timer = null;

            scope.zoom = function () {
               clearTimeout(timer);

               var bounds = [[scope.item.bbox__minY, scope.item.bbox__minX], [scope.item.bbox__maxY, scope.item.bbox__maxX]];
               scope.item.lastZoom = true;
               shapeService.zoom(bounds, function () {
                  scope.item.lastZoom = false;
               });

               timer = setTimeout(function () {
                  scope.item.lastZoom = false;
               }, 4000);
            };
         }
      };
   }]).filter('findTooltip', [function () {
      return function (model) {
         var buffer = "<div style='text-align:left'>";
         if (model.variant) {
            var variants = model.variant.split("|");
            variants.forEach(function (name, index) {
               buffer += index ? "" : "Also known as";
               buffer += (index && index < variants.length - 1 ? "," : "") + " ";
               if (index && index === variants.length - 1) {
                  buffer += "or ";
               }
               buffer += name;
            });
            buffer += "<br/>";
         }
         buffer += "Lat " + model.location.split(" ").reverse().join("&deg; Lng ") + "&deg;<br/>Feature type: " + model.feature + "</div>";

         return buffer;
      };
   }]).filter('fileSize', function () {
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
   }).service('findService', FindService);
}
'use strict';

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

{
   var MapsCtrl = function () {
      function MapsCtrl(mapsService) {
         _classCallCheck(this, MapsCtrl);

         this.mapService = mapService;
      }

      _createClass(MapsCtrl, [{
         key: 'toggleLayer',
         value: function toggleLayer(data) {
            this.mapsService.toggleShow(data);
         }
      }]);

      return MapsCtrl;
   }();

   MapsCtrl.$inject = ['mapsService'];

   var MapsService = function () {
      function MapsService(configService, mapService) {
         _classCallCheck(this, MapsService);

         this.CONFIG_KEY = "layersTab";
         this.configService = configService;
         this.mapService = mapService;
         this.configService = configService;
      }

      _createClass(MapsService, [{
         key: 'getConfig',
         value: function getConfig() {
            return this.configService.getConfig(this.CONFIG_KEY);
         }
      }, {
         key: 'toggleShow',
         value: function toggleShow(item, groupName) {
            var _this = this;

            this.configService.getConfig(this.CONFIG_KEY).then(function (config) {
               if (item.layer) {
                  item.displayed = false;
                  _this.mapService.removeFromGroup(item, config.group);
               } else {
                  _this.mapService.addToGroup(item, config.group);
                  item.displayed = true;
               }
            });
         }
      }]);

      return MapsService;
   }();

   MapsService.$inject = ['configService', 'mapService'];

   angular.module("finder.maps", ["explorer.layer.slider"]).directive("finderMaps", ["mapsService", function (mapsService) {
      return {
         templateUrl: "maps/maps.html",
         link: function link(scope) {
            mapsService.getConfig().then(function (data) {
               scope.layersTab = data;
            });
         }
      };
   }]).controller("MapsCtrl", MapsCtrl).service("mapsService", MapsService);
}
"use strict";

{
   angular.module("finder.metadata.item", []).directive("metadataItem", ['shapeService', function (shapeService) {
      return {
         templateUrl: "metadata/item.html",
         scope: {
            item: "="
         },
         link: function link(scope, element) {
            var layer = null;

            scope.show = function () {
               var item = scope.item;
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
"use strict";

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

{
   var MetadataService = function MetadataService($http, $q, configService) {
      var _this = this;

      _classCallCheck(this, MetadataService);

      this.configService = configService;
      this.request = $http;
      this.data = {};
      this.configService.getConfig("metadata").then(function (config) {
         _this.request.get(config.allMetadataUrl).then(function (solrResponse) {
            var map = {};
            solrResponse.data.response.docs.forEach(function (item) {
               map[item.metadata_id] = item;
            });

            _this.data.map = map;
         });
      });
   };

   MetadataService.$inject = ["$http", "$q", "configService"];

   angular.module('finder.metadata', ['bw.paging', 'finder.metadata.item']).directive("metadataView", ["$rootScope", "flashService", "mapService", "solrService", "shapeService", function ($rootScope, flashService, mapService, solrService, shapeService) {
      return {
         restrict: "AE",
         templateUrl: "metadata/metadataview.html",
         link: function link(scope) {
            var layer = null;

            $rootScope.$on("metadata.selected", function (event, data) {
               var flasher = flashService.add("Retrieving file information", 30000, true);
               mapService.getMap().then(function (map) {
                  scope.bounds = map.getBounds();
                  layer = shapeService.rectangle("bounds", scope.bounds);
                  solrService.tree(data.metadata_id, scope.bounds).then(function (datasets) {
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
   }]).directive("metadataType", [function () {
      return {
         scope: {
            type: "="
         },
         templateUrl: "metadata/type.html",
         link: function link(scope) {
            scope.toggleAll = function (items) {
               console.log("yes");
               var allSelected = true;
               items.forEach(function (item) {
                  allSelected &= item.selected;
               });

               items.forEach(function (item) {
                  item.selected = !allSelected;
               });
            };

            scope.allSelected = function (items) {
               return items.reduce(function (value, item) {
                  return value && item.selected;
               }, true);
            };
         }
      };
   }]).directive("metadataSubtype", ["$rootScope", function ($rootScope) {
      return {
         scope: {
            subtypes: "="
         },
         templateUrl: "metadata/subtype.html",
         link: function link(scope, element) {
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
   }]).directive('finderMetadataLink', [function () {

      return {
         restrict: 'AE',
         template: "<a target='_blank' ng-if='url' ng-href='{{url}}' title='{{hover}}'>{{name}}</a><span ng-if='!url'>{{name}}</span>",
         scope: {
            url: "=?",
            hover: "=?",
            name: "="
         },
         link: function link(scope, element) {}
      };
   }]).filter("sumFiles", [function () {
      return function (items) {
         return items.reduce(function (sum, item) {
            return sum + item.file_size;
         }, 0);
      };
   }]).filter("anySelected", [function () {
      return function (items) {
         return items.some(function (item) {
            return item.selected;
         });
      };
   }]).filter("allSelected", [function () {
      return function (items) {
         return items.reduce(function (value, item) {
            return value && item.selected;
         }, true);
      };
   }]).filter("selected", [function () {
      return function (items) {
         return items.filter(function (item) {
            return item.selected;
         });
      };
   }]).filter("length", [function () {
      return function (items) {
         return items.length;
      };
   }]).service('metadataService', MetadataService);
}
'use strict';

{
	angular.module('finder.popover', []).directive('finderPopover', [function () {
		return {
			templateUrl: "popover/popover.html",
			restrict: 'A',
			transclude: true,
			scope: {
				closeOnEscape: "@",
				show: "=",
				containerClass: "=",
				direction: "@"
			},
			link: function link(scope, element) {
				if (!scope.direction) {
					scope.direction = "bottom";
				}

				if (scope.closeOnEscape && (scope.closeOnEscape === true || scope.closeOnEscape === "true")) {
					element.on('keyup', keyupHandler);
				}

				function keyupHandler(keyEvent) {
					if (keyEvent.which === 27) {
						keyEvent.stopPropagation();
						keyEvent.preventDefault();
						scope.$apply(function () {
							scope.show = false;
						});
					}
				}
			}

		};
	}]);
}
"use strict";

{
   angular.module("finder.panes", []).directive("finderPanes", ['$rootScope', '$timeout', 'mapService', function ($rootScope, $timeout, mapService) {
      return {
         templateUrl: "panes/panes.html",
         scope: {
            defaultItem: "@",
            data: "="
         },
         controller: ['$scope', function ($scope) {
            var changeSize = false;

            $scope.view = $scope.defaultItem;

            $rootScope.$on('side.panel.change', function (event) {
               emitter();
               $timeout(emitter, 100);
               $timeout(emitter, 200);
               $timeout(emitter, 300);
               $timeout(emitter, 500);
               function emitter() {
                  var evt = document.createEvent("HTMLEvents");
                  evt.initEvent("resize", false, true);
                  window.dispatchEvent(evt);
               }
            });

            $scope.setView = function (what) {
               var oldView = $scope.view;
               var delay = 0;

               if ($scope.view === what) {
                  if (what) {
                     changeSize = true;
                     delay = 1000;
                  }
                  $scope.view = "";
               } else {
                  if (!what) {
                     changeSize = true;
                  }
                  $scope.view = what;
               }

               $rootScope.$broadcast("view.changed", $scope.view, oldView);

               if (changeSize) {
                  mapService.getMap().then(function (map) {
                     map._onResize();
                  });
               }
            };
            $timeout(function () {
               $rootScope.$broadcast("view.changed", $scope.view, null);
            }, 50);
         }]
      };
   }]);
}
"use strict";

{
   angular.module("finder.download", []).directive("downloadContinue", [function () {
      return {
         scope: {
            datatree: "="
         },
         link: function link(scope) {
            scope.$watch("datatree", function (tree) {});
         }
      };
   }]);
}
"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var Solr = function () {
   function Solr(config, requester) {
      _classCallCheck(this, Solr);

      this.requester = requester;
      this.config = config;
   }

   _createClass(Solr, [{
      key: "facets",
      value: function facets(bounds) {
         // {!field+f=bbox+score=overlapRatio}Intersects(ENVELOPE(3.3398437500000004,180,-12.554563528593656,-53.95608553098789))
         return this.requester.get(this.config.metadataFacetUrl + "&fq=" + getBounds(bounds)).then(function (response) {
            return response.data.facets.categories.buckets.filter(function (item) {
               return item.count;
            }).map(function (item) {
               return {
                  name: item.val,
                  count: item.count,
                  file_size: item.x
               };
            });
         });
      }
   }, {
      key: "records",
      value: function records(id, bounds) {
         return this.requester.get(this.config.metadataRecordsUrl + "&fq=" + getBounds(bounds) + "&q=metadata_id:" + id).then(function (response) {
            var records = response.data.response.docs;
            records.sort(function (a, b) {
               return a.file_name < b.file_name ? -1 : a.file_name === b.file_name ? 0 : 1;
            });
            return records;
         });
      }
   }, {
      key: "tree",
      value: function tree(id, bounds) {
         return this.records(id, bounds).then(function (records) {
            var response = {};
            records.forEach(function (record) {
               var type = response[record.type];
               if (!type) {
                  response[record.type] = type = {};
               }

               var subType = type[record.subType];
               if (!subType) {
                  subType = type[record.subType] = [];
               }
               subType.push(record);
            });

            return response;
         });
      }
   }, {
      key: "arrayToCounts",
      value: function arrayToCounts(arr) {
         var lastElement = void 0;
         var counts = [];

         arr.forEach(function (value, index) {
            if (index % 2) {
               counts.push({ name: lastElement, count: value });
            } else {
               lastElement = value;
            }
         });
         return counts;
      }
   }, {
      key: "arrayToMap",
      value: function arrayToMap(arr) {
         var lastElement = void 0;
         var counts = {};

         arr.forEach(function (value, index) {
            if (index % 2) {
               counts[lastElement] = value;
            } else {
               lastElement = value;
            }
         });
         return counts;
      }
   }]);

   return Solr;
}();

{
   angular.module('finder.solr', []).factory("solrService", SolrService);
   SolrService.$inject = ['$http', '$rootScope', '$timeout', 'configService'];
}

function SolrService($http, $rootScope, $timeout, configService) {
   var service = {};
   configService.getConfig('solr').then(function (config) {
      service.config = config;
      service.solr = new Solr(config, $http);
   });

   service.records = function (id, bounds) {
      return this.solr.records(id, bounds);
   };

   service.tree = function (id, bounds) {
      return this.solr.tree(id, bounds);
   };

   service.facets = function (bounds) {
      return this.solr.facets(bounds);
   };

   service.arrayToMap = function (facets) {
      return this.solr.arrayToMap(facets);
   };

   return service;
}
"use strict";

{

   angular.module("finder.splash", ["ui.bootstrap.modal"]).directive('finderSplash', ['$rootScope', '$uibModal', '$log', 'splashService', function ($rootScope, $uibModal, $log, splashService) {
      return {
         controller: ['$scope', 'splashService', function ($scope, splashService) {
            $scope.acceptedTerms = true;

            splashService.getReleaseNotes().then(function (messages) {
               $scope.releaseMessages = messages;
               $scope.acceptedTerms = splashService.hasViewedSplash();
            });
         }],
         link: function link(scope, element) {
            var modalInstance = void 0;

            scope.$watch("acceptedTerms", function (value) {
               if (value === false) {
                  modalInstance = $uibModal.open({
                     templateUrl: 'splash/splash.html',
                     size: "lg",
                     backdrop: "static",
                     keyboard: false,
                     controller: ['$scope', 'acceptedTerms', 'messages', function ($scope, acceptedTerms, messages) {
                        $scope.acceptedTerms = acceptedTerms;
                        $scope.messages = messages;
                        $scope.accept = function () {
                           modalInstance.close(true);
                        };
                     }],
                     resolve: {
                        acceptedTerms: function acceptedTerms() {
                           return scope.acceptedTerms;
                        },
                        messages: function messages() {
                           return scope.releaseMessages;
                        }
                     }
                  });
                  modalInstance.result.then(function (acceptedTerms) {
                     $log.info("Accepted terms");
                     scope.acceptedTerms = acceptedTerms;
                     splashService.setHasViewedSplash(acceptedTerms);
                  }, function () {
                     $log.info('Modal dismissed at: ' + new Date());
                  });
               }
            });

            $rootScope.$on("logoutRequest", function () {
               userService.setAcceptedTerms(false);
            });
         }
      };
   }]).factory("splashService", ['$http', function ($http) {
      var VIEWED_SPLASH_KEY = "finder.accepted.terms",
          releaseNotesUrl = "finder/resources/config/releasenotes.json";

      return {
         getReleaseNotes: function getReleaseNotes() {
            return $http({
               method: "GET",
               url: releaseNotesUrl + "?t=" + Date.now()
            }).then(function (result) {
               return result.data;
            });
         },
         hasViewedSplash: hasViewedSplash,
         setHasViewedSplash: setHasViewedSplash
      };

      function setHasViewedSplash(value) {
         if (value) {
            sessionStorage.setItem(VIEWED_SPLASH_KEY, true);
         } else {
            sessionStorage.removeItem(VIEWED_SPLASH_KEY);
         }
      }

      function hasViewedSplash() {
         return !!sessionStorage.getItem(VIEWED_SPLASH_KEY);
      }
   }]).filter("priorityColor", [function () {
      var map = {
         IMPORTANT: "red",
         HIGH: "blue",
         MEDIUM: "orange",
         LOW: "gray"
      };

      return function (priority) {
         if (priority in map) {
            return map[priority];
         }
         return "black";
      };
   }]).filter("wordLowerCamel", function () {
      return function (priority) {
         return priority.charAt(0) + priority.substr(1).toLowerCase();
      };
   }).filter("sortNotes", [function () {
      return function (messages) {
         if (!messages) {
            return;
         }
         var response = messages.slice(0).sort(function (prev, next) {
            if (prev.priority == next.priority) {
               return prev.lastUpdate == next.lastUpdate ? 0 : next.lastUpdate - prev.lastUpdate;
            } else {
               return prev.priority == "IMPORTANT" ? -11 : 1;
            }
         });
         return response;
      };
   }]);
}
"use strict";

function getBounds(bounds, restrictTo) {
   var fq = void 0;

   var left = void 0,
       right = void 0,
       top = void 0,
       bottom = void 0;

   if (restrictTo) {

      left = Math.max(bounds.getWest(), -180, restrictTo.getWest());
      right = Math.min(bounds.getEast(), 180, restrictTo.getEast());
      top = Math.min(bounds.getNorth(), 90, restrictTo.getNorth());
      bottom = Math.max(bounds.getSouth(), -90, restrictTo.getSouth());

      fq = "location:[" + (bottom > top ? top : bottom) + "," + (left > right ? right : left) + " TO " + top + "," + right + "]";
   } else {
      bottom = Math.max(bounds.getSouth(), -90);
      left = Math.max(bounds.getWest(), -180);
      top = Math.min(bounds.getNorth(), 90);
      right = Math.min(bounds.getEast(), 180);
   }

   return "{!field f=bbox score=overlapRatio}Intersects(ENVELOPE(" + left + "," + right + "," + top + "," + bottom + "))";
}
"use strict";

{

   angular.module("finder.toolbar", []).directive("finderToolbar", [function () {
      return {
         templateUrl: "toolbar/toolbar.html",
         controller: 'toolbarLinksCtrl',
         transclude: true
      };
   }]).controller("toolbarLinksCtrl", ["$scope", "configService", function ($scope, configService) {
      var self = this;
      configService.getConfig().then(function (config) {
         self.links = config.toolbarLinks;
      });

      $scope.item = "";
      $scope.toggleItem = function (item) {
         $scope.item = $scope.item === item ? "" : item;
      };
   }]);
}
angular.module("finder.templates", []).run(["$templateCache", function($templateCache) {$templateCache.put("about/about.html","<span class=\"about\" ng-mouseenter=\"over()\" ng-mouseleave=\"out()\"\r\n      ng-class=\"(about.show || about.ingroup || about.stick) ? \'transitioned-down\' : \'transitioned-up\'\">\r\n   <button class=\"undecorated about-unstick\" ng-click=\"unstick()\" style=\"float:right\">X</button>\r\n   <div class=\"aboutHeading\">About Composite Gazetteer of Australia</div>\r\n   <div ng-repeat=\"item in about.items\">\r\n      <a ng-href=\"{{item.link}}\" name=\"about{{$index}}\" title=\"{{item.heading}}\" target=\"_blank\">\r\n         {{item.heading}}\r\n      </a>\r\n   </div>\r\n</span>");
$templateCache.put("about/button.html","<button ng-mouseenter=\"over()\" ng-mouseleave=\"out()\"\r\n      ng-click=\"toggleStick()\" tooltip-placement=\"left\" uib-tooltip=\"About Composite Gazetteer of Australia\"\r\n      class=\"btn btn-primary btn-default\">About</button>");
$templateCache.put("extent/extent.html","<div class=\"row\" style=\"border-top: 1px solid gray; padding-top:5px\">\r\n	<div class=\"col-md-5\">\r\n		<div class=\"form-inline\">\r\n			<label>\r\n				<input id=\"extentEnable\" type=\"checkbox\" ng-model=\"parameters.fromMap\" ng-click=\"change()\"></input> \r\n				Restrict area to map\r\n			</label>\r\n		</div>\r\n	</div>\r\n	 \r\n	<div class=\"col-md-7\" ng-show=\"parameters.fromMap\">\r\n		<div class=\"container-fluid\">\r\n			<div class=\"row\">\r\n				<div class=\"col-md-offset-3 col-md-8\">\r\n					<strong>Y Max:</strong> \r\n					<span>{{parameters.yMax | number : 4}}</span> \r\n				</div>\r\n			</div>\r\n			<div class=\"row\">\r\n				<div class=\"col-md-6\">\r\n					<strong>X Min:</strong>\r\n					<span>{{parameters.xMin | number : 4}}</span> \r\n				</div>\r\n				<div class=\"col-md-6\">\r\n					<strong>X Max:</strong>\r\n					<span>{{parameters.xMax | number : 4}}</span> \r\n				</div>\r\n			</div>\r\n			<div class=\"row\">\r\n				<div class=\"col-md-offset-3 col-md-8\">\r\n					<strong>Y Min:</strong>\r\n					<span>{{parameters.yMin | number : 4}}</span> \r\n				</div>\r\n			</div>\r\n		</div>\r\n	</div>\r\n</div>");
$templateCache.put("find/findlist.html","<div ng-show=\"selection\">\r\n   <metadata-view></metadata-view>\r\n</div>\r\n<div ng-show=\"!selection\">\r\n   <h4 style=\"padding-right:10px\">\r\n      Projects in Map View\r\n   </h4>\r\n   <div style=\"padding: 5px;padding-bottom:10px\">Bounded by: {{state.bounds.west | number : 4}}° west,\r\n   {{state.bounds.north | number : 4}}° north,\r\n   {{state.bounds.east | number : 4}}° east,\r\n   {{state.bounds.south | number : 4}}° south\r\n   </div>\r\n   <div ng-repeat=\"item in data.list\">\r\n      <metadata-match item=\"item\" metadata=\"metadata.map[item.name]\"></metadata-match>\r\n   </div>\r\n</div>");
$templateCache.put("find/metadatamatches.html","<div style=\"padding:5px\" ng-mouseenter=\"show(metadata)\" ng-mouseleave=\"hide(metdata)\">\r\n   <div class=\"row\" style=\"font-weight:bold\" ng-hide=\"metadata.show\">\r\n      <div class=\"col-md-8\">\r\n         <button type=\"button\" class=\"undecorated\" title=\"View full title and abstract of this dataset\" ng-click=\"metadata.show= true\">\r\n            <i class=\"fa fa-2x fa-caret-right\" style=\"font-size:120%\"></i>\r\n         </button>\r\n         <button type=\"button\" class=\"undecorated\" title=\"Select project\" ng-click=\"select()\">\r\n            <i class=\"fa fa-2x fa-square-o\" style=\"font-size:120%\"></i>\r\n         </button>\r\n         <finder-zoom title=\"Zoom to and restrict search to this data set\'s extent\" item=\"metadata\"></finder-zoom>\r\n         <div style=\"width:85%;float:right;\" class=\"ellipsis\" title=\"{{metadata.title}}\">\r\n            {{metadata.source}} -\r\n            <finder-metadata-link hover=\"metadata.title\" url=\"metadata.metadata_url\" name=\"metadata.title\"></finder-metadata-link>\r\n         </div>\r\n      </div>\r\n      <div class=\"col-md-4\">\r\n         {{item.count}} matches, {{item.file_size | fileSize}}\r\n      </div>\r\n   </div>\r\n   <div class=\"row\" ng-show=\"metadata.show\">\r\n      <div class=\"col-md-12\">\r\n         <button type=\"button\" class=\"undecorated\" title=\"Hide full title and abstract of this dataset\" ng-click=\"metadata.show = false\">\r\n            <i class=\"fa fa-2x fa-caret-down\" style=\"font-size:120%\"></i>\r\n         </button>\r\n         <button type=\"button\" class=\"undecorated\" title=\"Select project\" ng-click=\"select()\">\r\n            <i class=\"fa fa-2x fa-square-o\" style=\"font-size:120%\"></i>\r\n         </button>\r\n         <span style=\"font-weight:bold\">\r\n            {{metadata.source}} -\r\n            <finder-metadata-link hover=\"metadata.title\" url=\"metadata.metadata_url\" name=\"metadata.title\"></finder-metadata-link>\r\n         </span>\r\n         ({{item.count}} matches, {{item.file_size | fileSize}}) - {{metadata.abstract}}\r\n      </div>\r\n   </div>\r\n</div>");
$templateCache.put("find/quickfind.html","<div class=\"search-text\">\r\n   <div class=\"input-group input-group-sm\">\r\n      <input type=\"text\" ng-model=\"state.filter\" placeholder=\"Match by metadata ID...\" ng-model-options=\"{ debounce: 300}\" typeahead-on-select=\"select($item, $model, $label)\"\r\n         ng-disabled=\"state.searched\" typeahead-template-url=\"find/typeahead.html\" class=\"form-control\" typeahead-min-length=\"0\"\r\n         uib-typeahead=\"doc as doc.name for doc in loadDocs(state.filter)\" typeahead-loading=\"loadingLocations\" typeahead-no-results=\"noResults\"\r\n         elevation-clear>\r\n\r\n      <span class=\"input-group-btn\">\r\n         <button class=\"btn btn-primary\" type=\"button\" ng-click=\"showFilters = !showFilters\" ng-hide=\"state.searched\" title=\"SHow/hide filters such as source, type, category and feature type\">Filters...</button>\r\n         <button class=\"btn btn-primary\" title=\"Clear the current search and enable discovery\" type=\"button\" ng-click=\"clear()\" ng-show=\"state.searched\">Clear Search Results</button>\r\n         <button class=\"btn btn-primary\" type=\"button\" ng-click=\"search()\" title=\"Search for all features matching your search criteria\"\r\n         ng-hide=\"state.searched\">Search</button>\r\n      </span>\r\n   </div>\r\n</div>\r\n<div class=\"filters\" ng-show=\"showFilters\" style=\"background-color: white\">\r\n   <elevation-filter></elevation-filter>\r\n   <div class=\"panel panel-default\" style=\"margin-bottom:5px\">\r\n      <div class=\"panel-heading\">\r\n         <h4 class=\"panel-title\">\r\n            Filter\r\n            <span ng-if=\"summary.sources.length\">ing</span> by source...\r\n         </h4>\r\n      </div>\r\n      <div style=\"max-height: 200px; overflow-y: auto; padding:5px\">\r\n         <elevation-sources update=\"update()\"></elevation-sources>\r\n      </div>\r\n   </div>\r\n</div>");
$templateCache.put("find/typeahead.html","<a elevation-options ng-mouseenter=\"enter()\" ng-mouseleave=\"leave()\" tooltip-append-to-body=\"true\" tooltip-placement=\"bottom\"\r\n   uib-tooltip-html=\"match.model | findTooltip\">\r\n   <span ng-bind-html=\"match.model.file_name | uibTypeaheadHighlight:query\"></span>\r\n   (\r\n   <span ng-bind-html=\"match.model.source\"></span>)\r\n</a>");
$templateCache.put("find/zoombutton.html","<button type=\"button\" class=\"undecorated\" title=\"{{title}}\" ng-click=\"zoom()\">\r\n   <i class=\"fa fa-lg fa-paper-plane-o\" ng-style=\"item.lastZoom?{\'color\':\'red\'}:{}\"></i>\r\n</button>");
$templateCache.put("maps/maps.html","<div  ng-controller=\"MapsCtrl as maps\">\r\n	<div style=\"position:relative;padding:5px;padding-left:10px;\" >\r\n		<div class=\"panel panel-default\" style=\"padding:5px;\" >\r\n			<div class=\"panel-heading\">\r\n				<h3 class=\"panel-title\">Layers</h3>\r\n			</div>\r\n			<div class=\"panel-body\">\r\n				<div class=\"container-fluid\">\r\n					<div class=\"row\" ng-repeat=\"layer in layersTab.layers\" \r\n							style=\"padding:7px;padding-left:10px;position:relative\" ng-class-even=\"\'even\'\" ng-class-odd=\"\'odd\'\">\r\n						<div style=\"position:relative;left:6px;\">\r\n							<a href=\"{{layer.metadata}}\" target=\"_blank\" \r\n									class=\"featureLink\" title=\'View metadata related to \"{{layer.name}}\". (Opens new window.)\'>\r\n								{{layer.name}}\r\n							</a>\r\n							<div class=\"pull-right\" style=\"width:270px;\" tooltip=\"Show on map. {{layer.help}}\">\r\n								<span style=\"padding-left:10px;width:240px;\" class=\"pull-left\"><explorer-layer-slider layer=\"layer.layer\"></explorer-layer-slider></span>\r\n								<button style=\"padding:2px 8px 2px 2px;\" type=\"button\" class=\"undecorated featureLink pull-right\" href=\"javascript:;\" \r\n										ng-click=\"maps.toggleLayer(layer)\" >\r\n									<i class=\"fa\" ng-class=\"{\'fa-eye-slash\':(!layer.displayed), \'fa-eye active\':layer.displayed}\"></i>\r\n								</button>\r\n							</div>						\r\n						</div>\r\n					</div>\r\n				</div>\r\n			</div>\r\n		</div>\r\n	</div>\r\n</div>");
$templateCache.put("metadata/datasets.html","<div class=\"container-fluid\">\r\n   <div class=\"row\" ng-repeat=\"(key, value) in datasets\">\r\n      <h5>{{key}}</h5>\r\n      <metadata-type type=\"value\"></metadata-type>\r\n   </div>\r\n</div>");
$templateCache.put("metadata/item.html","<div ng-mouseenter=\"show()\" ng-mouseleave=\"hide()\">\r\n   <span>\r\n      <input type=\"checkbox\" ng-model=\"item.selected\" />\r\n      <finder-cc org-name=\"item.source\"></finder-cc>\r\n      {{item.file_name}}\r\n   </span>\r\n   <span class=\"pull-right\">\r\n      {{item.file_size | fileSize}}\r\n   </span>\r\n</div>");
$templateCache.put("metadata/metadataview.html","<div>\r\n   <span style=\"float:left; width:70%\">\r\n      <h4>\r\n         Project in Detail\r\n      </h4>\r\n   </span>\r\n   <button style=\"float:right; padding:4px\" class=\"undecorated\" ng-click=\"clear()\">[Return to Projects]</button>\r\n   <div class=\"container-fluid\">\r\n      <div class=\"row\">\r\n         <div class=\"col-md-12\">\r\n            <span style=\"font-weight:bold\">\r\n               {{metadata.source}} -\r\n               <finder-metadata-link\r\n                  hover=\"\'Metadata ID: \' + metadata.metadata_id\"\r\n                  url=\"metadata.metadata_url\"\r\n                  name=\"metadata.title\">\r\n               </finder-metadata-link>\r\n            </span>\r\n         </div>\r\n      </div>\r\n      <div class=\"row\">\r\n         <div class=\"col-md-12\">\r\n            {{metadata.abstract}}<br/>\r\n            <strong>\r\n               Metadata ID:\r\n               <finder-metadata-link\r\n                  hover=\"\'Metadata ID: \' + metadata.metadata_id\"\r\n                  url=\"metadata.metadata_url\"\r\n                  name=\"metadata.metadata_id\">\r\n               </finder-metadata-link>\r\n            </strong>\r\n         </div>\r\n      </div>\r\n      <div class=\"row\" ng-repeat=\"(key, value) in datasets\">\r\n         <div class=\"col-md-12\">\r\n            <h5 class=\"type-heading\">{{key}}</h5>\r\n            <metadata-type type=\"value\"></metadata-type>\r\n         </div>\r\n      </div>\r\n   </div>\r\n   <download-continue datatree=\"datasets\"></download-continue>\r\n</div>");
$templateCache.put("metadata/subtype.html","<div ng-if=\"subtypes\">\r\n   <div ng-show=\"subtypes.length > paging.pageSize\" paging page=\"paging.page\" page-size=\"paging.pageSize\" total=\"subtypes.length\" paging-action=\"setPage(page, pageSize)\"></div>\r\n</div>\r\n<div>\r\n   <div ng-repeat=\"item in data\">\r\n      <metadata-item item=\"item\"></metadata-item>\r\n   </div>\r\n</div>");
$templateCache.put("metadata/type.html","<div class=\"container-fluid\" style=\"padding-bottom: 35px;\">\r\n   <div class=\"row\" ng-repeat=\"(key, value) in type\">\r\n      <h5>\r\n         <span>{{key}} ({{value.length| number}} files, {{value | sumFiles | fileSize}})</span>\r\n         <span class=\"pull-right\">\r\n            <button class=\"pull-right undecorated ng-binding\" ng-click=\"toggleAll(value)\">\r\n               [<span ng-if=\"allSelected(value)\">Deselect</span><span ng-if=\"!allSelected(value)\">Select</span> all]\r\n            </button>\r\n         </span>\r\n      </h5>\r\n      <div ng-show=\"value | anySelected\">\r\n         Selected {{value | selected | length | number}} files, {{value | selected | sumFiles | fileSize}}\r\n      </div>\r\n      <metadata-subtype subtypes=\"value\"></metadata-subtype>\r\n   </div>\r\n</div>");
$templateCache.put("popover/popover.html","<div class=\"finder-popover {{direction}}\" ng-class=\"containerClass\" ng-show=\"show\">\r\n  <div class=\"arrow\"></div>\r\n  <div class=\"finder-popover-inner\" ng-transclude></div>\r\n</div>");
$templateCache.put("panes/panes.html","<div class=\"mapContainer\" class=\"col-md-12\" style=\"padding-right:0\">\r\n   <div class=\"panesMapContainer\" geo-map configuration=\"data.map\"></div>\r\n   <div class=\"base-layer-controller\">\r\n    	<div geo-draw data=\"data.map.drawOptions\" line-event=\"elevation.plot.data\" rectangle-event=\"bounds.drawn\"></div>\r\n   </div>\r\n   <restrict-pan bounds=\"data.map.position.bounds\"></restrict-pan>\r\n</div>");
$templateCache.put("side-panel/side-panel-left.html","<div class=\"cbp-spmenu cbp-spmenu-vertical cbp-spmenu-left\" style=\"width: {{left.width}}px;\" ng-class=\"{\'cbp-spmenu-open\': left.active}\">\r\n    <a href=\"\" title=\"Close panel\" ng-click=\"closeLeft()\" style=\"z-index: 1200\">\r\n        <span class=\"glyphicon glyphicon-chevron-left pull-right\"></span>\r\n    </a>\r\n    <div ng-show=\"left.active === \'legend\'\" class=\"left-side-menu-container\">\r\n        <legend url=\"\'img/AustralianTopogaphyLegend.png\'\" title=\"\'Map Legend\'\"></legend>\r\n    </div>\r\n</div>");
$templateCache.put("side-panel/side-panel-right.html","<div class=\"cbp-spmenu cbp-spmenu-vertical cbp-spmenu-right noPrint\" ng-attr-style=\"width:{{right.width}}\" ng-class=\"{\'cbp-spmenu-open\': right.active}\">\r\n    <a href=\"\" title=\"Close panel\" ng-click=\"closePanel()\" style=\"z-index: 1\">\r\n        <span class=\"glyphicon glyphicon-chevron-right pull-left\"></span>\r\n    </a>\r\n    <div ng-show=\"right.active === \'search\'\" class=\"right-side-menu-container\" style=\"z-index: 2\">\r\n        <div class=\"panesTabContentItem\" find-list ></div>\r\n    </div>\r\n</div>\r\n\r\n\r\n\r\n\r\n\r\n\r\n\r\n");
$templateCache.put("download/downloadcontinue.html","<div class=\"continue-container\" ng-show=\"ctrl.selected.length\">\r\n   <button class=\"btn btn-primary\" ng-click=\"review()\">\r\n      Review {{selected.length}} selected datasets (Approx: {{selectedSize | fileSize}})\r\n   </button>\r\n</div>");
$templateCache.put("splash/splash.html","<div class=\"modal-header\">\r\n   <h3 class=\"modal-title splash\">Composite Gazetteer of Australia</h3>\r\n</div>\r\n<div class=\"modal-body\" id=\"accept\" ng-form exp-enter=\"accept()\" finder-splash-modal style=\"width: 100%; margin-left: auto; margin-right: auto;\">\r\n	<div style=\"border-bottom:1px solid gray\">\r\n		<p>\r\n			Users can download the Composite Gazetteer of Australia data which is licensed under Creative Commons.\r\n		</p>\r\n		<p>\r\n			Data can be downloaded from the portal at <strong>no charge</strong> and there is no limit to how many requests you can place (please check the file size before you download your results).\r\n		</p>\r\n		<p>\r\n			If you need datasets in full, please contact <a href=\"clientservices@ga.gov.au\">clientservices@ga.gov.au</a>.\r\n		</p>\r\n		<p>\r\n			<a href=\"http://opentopo.sdsc.edu/gridsphere/gridsphere?cid=contributeframeportlet&gs_action=listTools\" target=\"_blank\">Click here for Free GIS Tools.</a>\r\n		</p>\r\n\r\n		<div style=\"padding:30px; padding-top:0; padding-bottom:40px; width:100%\">\r\n			<div class=\"pull-right\">\r\n			  	<button type=\"button\" class=\"btn btn-primary\" ng-model=\"seenSplash\" ng-focus ng-click=\"accept()\">Continue</button>\r\n			</div>\r\n		</div>\r\n	</div>\r\n	<div ng-show=\"messages.length > 0\" class=\"container\" style=\"width:100%; max-height:250px; overflow-y:auto\">\r\n		<div class=\"row\" ng-class-even=\"\'grayline\'\" style=\"font-weight:bold\">\r\n			<div class=\"col-sm-12\" ><h3>News</h3></div>\r\n		</div>\r\n\r\n		<div class=\"row\"ng-class-even=\"\'grayline\'\" style=\"max-height:400px;overflow:auto\" ng-repeat=\"message in messages | sortNotes\">\r\n			<div class=\"col-sm-12\">\r\n				<h4>{{message.title}} <span class=\"pull-right\" style=\"font-size:70%\">Created: {{message.creationDate | date : \"dd/MM/yyyy\"}}</span></h4>\r\n				<div ng-bind-html=\"message.description\"></div>\r\n			</div>\r\n		</div>\r\n	</div>\r\n</div>");
$templateCache.put("toolbar/toolbar.html","<div class=\"finder-toolbar noPrint\">\r\n    <div class=\"toolBarContainer\">\r\n        <div>\r\n            <ul class=\"left-toolbar-items\">\r\n               <li>\r\n                  <antarctic-view></antarctic-view>\r\n               </li>\r\n            </ul>\r\n            <ul class=\"right-toolbar-items\">\r\n                <li>\r\n                    <panel-trigger panel-id=\"search\" panel-width=\"540px\" default=\"true\"\r\n                        name=\"Projects\" icon-class=\"fa-list\"\r\n                        title=\"List projects that have data within current map view. Tunnel down to view individual datasets.\">\r\n                    </panel-trigger>\r\n                </li>\r\n                <li>\r\n                  <panel-trigger panel-id=\"help\" panel-width=\"540px\" name=\"Help\" icon-class=\"fa-question-circle-o\" title=\"Show help\"></panel-trigger>\r\n               </li>\r\n                <li reset-page></li>\r\n            </ul>\r\n        </div>\r\n    </div>\r\n</div>");
$templateCache.put("authorities/authorities.html","<div ng-repeat=\"item in authorities\" style=\"width:49%; display:inline-block\">\r\n   <div class=\"ellipsis\" title=\'Jurisdiction: {{item.jurisdiction}}, Authority name: {{item.name}}\'>\r\n      <input type=\"checkbox\" ng-click=\"update()\" ng-model=\"item.selected\" ng-change=\"change()\">\r\n      <span>\r\n         <a target=\"_blank\" href=\"http://www.google.com/search?q={{item.name}}\">{{item.code}}</a>\r\n         ({{(item.allCount | number) + (item.allCount || item.allCount == 0?\' of \':\'\')}}{{item.total | number}})\r\n      </span>\r\n   </div>\r\n</div>");
$templateCache.put("cc/cc.html","<button type=\"button\" class=\"undecorated\" title=\"View CCBy {{details.version}} licence details\"\r\n      popover-trigger=\"outsideClick\"\r\n      uib-popover-template=\"template\" popover-placement=\"bottom\" popover-append-to-body=\"true\">\r\n	<i ng-class=\"{active:data.isWmsShowing}\" class=\"fa fa-lg fa-gavel\"></i>\r\n</button>");
$templateCache.put("cc/cctemplate.html","<div>\r\n   <div class=\"row\">\r\n      <div class=\"col-md-12\">\r\n         <a target=\"_blank\" ng-href=\"{{details.link}}\">Creative Commons Attribution {{details.version}} </a>\r\n      </div>\r\n   </div>\r\n   <div class=\"row\">\r\n      <div class=\"col-md-2\">\r\n         <span class=\"fa-stack\" aria-hidden=\"true\">\r\n         <i class=\"fa fa-check-circle-o fa-stack-2x\" aria-hidden=\"true\"></i>\r\n      </span>\r\n      </div>\r\n      <div class=\"col-md-10\">\r\n         You may use this work for commercial purposes.\r\n      </div>\r\n   </div>\r\n   <div class=\"row\">\r\n      <div class=\"col-md-2\">\r\n         <span class=\"fa-stack\" aria-hidden=\"true\">\r\n         <i class=\"fa fa-circle-o fa-stack-2x\"></i>\r\n         <i class=\"fa fa-female fa-stack-1x\"></i>\r\n      </span>\r\n      </div>\r\n      <div class=\"col-md-10\">\r\n         You must attribute the creator in your own works.\r\n      </div>\r\n   </div>\r\n</div>");
$templateCache.put("contributors/contributors.html","<span class=\"contributors\" ng-mouseenter=\"over()\" ng-mouseleave=\"out()\" style=\"z-index:1500\"\r\n      ng-class=\"(contributors.show || contributors.ingroup || contributors.stick) ? \'transitioned-down\' : \'transitioned-up\'\">\r\n   <button class=\"undecorated contributors-unstick\" ng-click=\"unstick()\" style=\"float:right\">X</button>\r\n   <div ng-repeat=\"contributor in contributors.orgs | activeContributors\" style=\"text-align:cnter\">\r\n      <a ng-href=\"{{contributor.href}}\" name=\"contributors{{$index}}\" title=\"{{contributor.title}}\" target=\"_blank\">\r\n         <img ng-src=\"{{contributor.image}}\" alt=\"{{contributor.title}}\" class=\"elvis-logo\" ng-class=\"contributor.class\"></img>\r\n      </a>\r\n   </div>\r\n</span>");
$templateCache.put("contributors/show.html","<a ng-mouseenter=\"over()\" ng-mouseleave=\"out()\" class=\"contributors-link\" title=\"Click to lock/unlock contributors list.\"\r\n      ng-click=\"toggleStick()\" href=\"#contributors0\">Contributors</a>");
$templateCache.put("header/header.html","<div class=\"container-full common-header\" style=\"padding-right:10px; padding-left:10px\">\r\n   <div class=\"navbar-header\">\r\n\r\n      <button type=\"button\" class=\"navbar-toggle\" data-toggle=\"collapse\" data-target=\".ga-header-collapse\">\r\n         <span class=\"sr-only\">Toggle navigation</span>\r\n         <span class=\"icon-bar\"></span>\r\n         <span class=\"icon-bar\"></span>\r\n         <span class=\"icon-bar\"></span>\r\n      </button>\r\n\r\n      <a href=\"/\" class=\"appTitle visible-xs\">\r\n         <h1 style=\"font-size:120%\">{{heading}}</h1>\r\n      </a>\r\n   </div>\r\n   <div class=\"navbar-collapse collapse ga-header-collapse\">\r\n      <ul class=\"nav navbar-nav\">\r\n         <li class=\"hidden-xs\">\r\n            <a href=\"/\">\r\n               <h1 class=\"applicationTitle\">{{heading}}</h1>\r\n            </a>\r\n         </li>\r\n      </ul>\r\n      <ul class=\"nav navbar-nav navbar-right nav-icons\">\r\n         <li role=\"menuitem\" style=\"padding-right:10px;position: relative;top: -3px;\">\r\n            <span class=\"altthemes-container\">\r\n               <span>\r\n                  <a title=\"Location INformation Knowledge platform (LINK)\" href=\"http://fsdf.org.au/\" target=\"_blank\">\r\n                     <img alt=\"FSDF\" src=\"finder/resources/img/FSDFimagev4.0.png\" style=\"height: 66px\">\r\n                  </a>\r\n               </span>\r\n            </span>\r\n         </li>\r\n         <li finder-navigation role=\"menuitem\" current=\"current\" style=\"padding-right:10px\"></li>\r\n         <li mars-version-display role=\"menuitem\"></li>\r\n         <li style=\"width:10px\"></li>\r\n      </ul>\r\n   </div>\r\n   <!--/.nav-collapse -->\r\n</div>\r\n<div class=\"contributorsLink\" style=\"position: absolute; right:7px; bottom:25px\">\r\n   <finder-contributors-link></finder-contributors-link>\r\n</div>\r\n<!-- Strap -->\r\n<div class=\"row\">\r\n   <div class=\"col-md-12\">\r\n      <div class=\"strap-blue\">\r\n      </div>\r\n      <div class=\"strap-white\">\r\n      </div>\r\n      <div class=\"strap-red\">\r\n      </div>\r\n   </div>\r\n</div>");
$templateCache.put("filters/tree.html","<div style=\"max-height:300px; overflow-y:auto;padding-left:10px\">\r\n   <div ng-repeat=\"group in groups | withTotals\">\r\n      <button class=\"undecorated\" ng-click=\"group.expanded = !group.expanded\" ng-style=\"{color:group.color}\">\r\n         <i class=\"fa\" ng-class=\"{\'fa-plus\':!group.expanded, \'fa-minus\':group.expanded}\"></i>\r\n      </button>\r\n      <input type=\"checkbox\" class=\"filters-check\" ng-model=\"group.selectExpand\" ng-change=\"change(group)\" ng-style=\"{color:group.color}\">\r\n      <span title=\"{{group.definition}}\">\r\n         {{group.name}} ({{(group.allCount | number) + (group.allCount || group.allCount == 0?\' of \':\'\')}}{{group.total | number}})\r\n      </span>\r\n      <div style=\"padding-left:10px\" ng-show=\"group.expanded\">\r\n         <div ng-repeat=\"category in group.categories | withTotals | orderBy: \'name\'\"  ng-attr-title=\"{{category.definition}}\">\r\n            <button class=\"undecorated\" ng-click=\"category.expanded = !category.expanded\" ng-style=\"{color:category.color}\">\r\n               <i class=\"fa\" ng-class=\"{\'fa-plus\':!category.expanded, \'fa-minus\':category.expanded}\"></i>\r\n            </button>\r\n            <input class=\"filters-check\" type=\"checkbox\" ng-model=\"category.selectExpand\" ng-change=\"change()\" ng-style=\"{color:category.color}\">\r\n            <span title=\"{{category.definition}}\">\r\n               {{category.name}}\r\n               ({{(category.allCount | number) + (category.allCount || category.allCount == 0?\' of \':\'\')}}{{category.total}})\r\n            </span>\r\n            <div ng-show=\"category.expanded\" style=\"padding-left:20px\">\r\n               <div ng-repeat=\"feature in category.features | withTotals | orderBy: \'name\'\"  ng-attr-title=\"{{feature.definition}}\">\r\n                  <i class=\"fa fa-hand-o-right\" aria-hidden=\"true\" ng-style=\"{color:feature.color}\"></i>\r\n                  <input class=\"filters-check\" type=\"checkbox\" ng-model=\"feature.selected\" ng-change=\"change()\" ng-style=\"{color:feature.color}\">\r\n                  <span>\r\n                     {{feature.name}}\r\n                     ({{(feature.allCount | number) + (feature.allCount || feature.allCount == 0?\' of \':\'\')}}{{feature.total}})\r\n                  </span>\r\n               </div>\r\n            </div>\r\n         </div>\r\n      </div>\r\n   </div>\r\n</div>");
$templateCache.put("help/faqs.html","<p style=\"text-align: left; margin: 10px; font-size: 14px;\">\r\n   <strong>FAQS</strong>\r\n</p>\r\n\r\n<h5 ng-repeat=\"faq in faqs\"><button type=\"button\" class=\"undecorated\" ng-click=\"focus(faq.key)\">{{faq.question}}</button></h5>\r\n<hr/>\r\n<div class=\"row\" ng-repeat=\"faq in faqs\">\r\n   <div class=\"col-md-12\">\r\n      <h5 tabindex=\"0\" id=\"faqs_{{faq.key}}\">{{faq.question}}</h5>\r\n      <span ng-bind-html=\"faq.answer\"></span>\r\n      <hr/>\r\n   </div>\r\n</div>");
$templateCache.put("help/help.html","<p style=\"text-align: left; margin: 10px; font-size: 14px;\">\r\n	<strong>Help</strong>\r\n</p>\r\n\r\n<div class=\"panel-body\" ng-controller=\"HelpCtrl as help\">\r\n	The steps to get data!\r\n	<ol>\r\n		<li>Define area of interest</li>\r\n		<li>Select datasets</li>\r\n		<li>Enter email address</li>\r\n		<li>Start extract</li>\r\n	</ol>\r\n	An email will be sent to you on completion of the data extract with a link to your data.\r\n   <hr>\r\n	<finder-faqs faqs=\"help.faqs\" ></finder-faqs>\r\n</div>");
$templateCache.put("navigation/altthemes.html","<span class=\"altthemes-container\">\r\n	<span ng-repeat=\"item in themes | altthemesMatchCurrent : current\">\r\n       <a title=\"{{item.label}}\" ng-href=\"{{item.url}}\" class=\"altthemesItemCompact\" target=\"_blank\">\r\n         <span class=\"altthemes-icon\" ng-class=\"item.className\"></span>\r\n       </a>\r\n    </li>\r\n</span>");
$templateCache.put("pill/pill.html","<span class=\"btn btn-primary pn-pill\" ng-style=\"item.color?{\'background-color\':item.color, \'padding-top\': \'3px\'}: {\'padding-top\': \'3px\'}\">\r\n   <span style=\"max-width:100px;display:inline-block\" title=\"{{label + item[name]}}\" class=\"ellipsis\">{{item[name]}}</span>\r\n   <span class=\"ellipsis\" style=\"max-width:100px;display:inline-block\">\r\n      ({{item.count?item.count:0 | number}})\r\n      <a ng-click=\"deselect()\" href=\"javascript:void(0)\" title=\"Remove from filters\">\r\n         <i class=\"fa fa-close fa-xs\" style=\"color: white\"></i>\r\n      </a>\r\n   </span>\r\n</span>");
$templateCache.put("reset/reset.html","<button type=\"button\" class=\"map-tool-toggle-btn\" ng-click=\"reset()\" title=\"Reset page\">\r\n   <span class=\"hidden-sm\">Reset</span>\r\n   <i class=\"fa fa-lg fa-refresh\"></i>\r\n</button>");
$templateCache.put("side-panel/trigger.html","<button ng-click=\"toggle()\" type=\"button\" class=\"map-tool-toggle-btn\">\r\n   <span class=\"hidden-sm\">{{name}}</span>\r\n   <ng-transclude></ng-transclude>\r\n   <i class=\"fa fa-lg\" ng-class=\"iconClass\"></i>\r\n</button>");}]);