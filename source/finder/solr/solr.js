class Solr {
   constructor(config, requester) {
      this.requester = requester;
      this.config = config;
   }

   facets(bounds) {
      // {!field+f=bbox+score=overlapRatio}Intersects(ENVELOPE(3.3398437500000004,180,-12.554563528593656,-53.95608553098789))
      return this.requester.get(this.config.metadataFacetUrl + "&fq=" + getBounds(bounds)).then(response => {
         return response.data.facets.categories.buckets.filter(item => item.count).map(item => ({
            name: item.val,
            count: item.count,
            file_size: item.x
         }));
      });
   }

   records(id, bounds) {
      return this.requester.get(this.config.metadataRecordsUrl + "&fq=" + getBounds(bounds) + "&q=metadata_id:" + id).then(response => {
         let records = response.data.response.docs;
         records.sort((a, b) => a.file_name < b.file_name? -1: a.file_name === b.file_name? 0: 1);
         return records;
      });
   }

   tree(id, bounds) {
      return this.records(id, bounds).then(records => {
         var response = {};
         records.forEach(record => {
            let type = response[record.type];
            if (!type) {
               response[record.type] = type = {};
            }

            let subType = type[record.subType];
            if (!subType) {
               subType = type[record.subType] = [];
            }
            subType.push(record);
         });

         return response;
      });
   }

   arrayToCounts(arr) {
      let lastElement;
      let counts = [];

      arr.forEach((value, index) => {
         if (index % 2) {
            counts.push({ name: lastElement, count: value });
         } else {
            lastElement = value;
         }
      });
      return counts;
   }

   arrayToMap(arr) {
      let lastElement;
      let counts = {};

      arr.forEach((value, index) => {
         if (index % 2) {
            counts[lastElement] = value;
         } else {
            lastElement = value;
         }
      });
      return counts;
   }
}

{
   angular.module('finder.solr', [])

      .factory("solrService", SolrService);
   SolrService.$inject = ['$http', '$rootScope', '$timeout', 'configService'];
}

function SolrService($http, $rootScope, $timeout, configService) {
   let service = {};
   configService.getConfig('solr').then(config => {
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