{
   AboutService.$inject = ["configService"];

   angular.module('finder.about', [])
      .directive("finderAbout", ["$interval", "aboutService", function ($interval, aboutService) {
         return {
            templateUrl: "about/about.html",
            scope: {
            },
            link: function (scope, element) {
               let timer;

               scope.about = aboutService.getState();

               scope.over = () => {
                  $interval.cancel(timer);
                  scope.about.ingroup = true;
               };

               scope.out = () => {
                  timer = $interval(() => {
                     scope.about.ingroup = false;
                  }, 1000);
               };

               scope.unstick = () => {
                  scope.about.ingroup = scope.about.show = scope.about.stick = false;
                  element.find("a").blur();
               };
            }
         };
      }])

      .directive("finderAboutLink", ["$interval", "aboutService", function ($interval, aboutService) {
         return {
            restrict: "AE",
            templateUrl: "about/button.html",
            scope: {
            },
            link: function (scope) {
               let timer;
               scope.about = aboutService.getState();
               scope.over = () => {
                  $interval.cancel(timer);
                  scope.about.show = true;
               };

               scope.toggleStick = () => {
                  scope.about.stick = !scope.about.stick;
                  if (!scope.about.stick) {
                     scope.about.show = scope.about.ingroup = false;
                  }
               };

               scope.out = () => {
                  timer = $interval(() => {
                     scope.about.show = false;
                  }, 700);
               };
            }
         };
      }])

      .factory("aboutService", AboutService);
}



function AboutService(configService) {
   let state = {
      show: false,
      ingroup: false,
      stick: false
   };

   configService.getConfig("about").then(response => {
      state.items = response;
   });

   return {
      getState: function () {
         return state;
      }
   };
}