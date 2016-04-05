//RIAStudio client runtime widget - JsonRestStore

define([
	"rias",
	"rias/riasw/store/StoreBase",
	"dojo/store/JsonRest",
	"dojo/store/util/QueryResults"
], function(rias, StoreBase, JsonRest, QueryResults) {

	JsonRest.extend({

		serverStore: true,
		timeout: rias.xhr.defaultTimeout,
		_currentDfd: null,

		postscript: function(params){
			this.inherited(arguments);
		},
		destroy: function(){
			this.cancelQuery();
			this.close();
			this.inherited(arguments);
		},

		close: function(/*dojo/data/api/Request|Object?*/ request){
		},

		query: function(query, options){
			var self = this;
			options = options || {};

			var headers = rias.mixin({ Accept: self.accepts }, self.headers, options.headers);

			var hasQuestionMark = self.target.indexOf("?") > -1;
			query = query || "";
			if(typeof query == "object"){
				query = rias.xhr.objectToQuery(query);
				query = query ? (hasQuestionMark ? "&" : "?") + query: "";
			}
			if(options.start >= 0 || options.count >= 0){
				headers["X-Range"] = "items=" + (options.start || '0') + '-' +
					(("count" in options && options.count != Infinity) ?
						(options.count + (options.start || 0) - 1) : '');
				if(self.rangeParam){
					query += (query || hasQuestionMark ? "&" : "?") + self.rangeParam + "=" + headers["X-Range"];
					hasQuestionMark = true;
				}else{
					headers.Range = headers["X-Range"];
				}
			}
			if(options && options.sort){
				var sortParam = self.sortParam;
				query += (query || hasQuestionMark ? "&" : "?") + (sortParam ? sortParam + '=' : "sort(");
				for(var i = 0; i<options.sort.length; i++){
					var sort = options.sort[i];
					query += (i > 0 ? "," : "") + (sort.descending ? self.descendingPrefix : self.ascendingPrefix) + encodeURIComponent(sort.attribute);
				}
				if(!sortParam){
					query += ")";
				}
			}
			if(self._currentDfd){
				self._currentDfd.cancel();
			}
			var results = rias.xhrGet({
				url: self.target + (query || ""),
				handleAs: "json",
				timeout: options.timeout || self.timeout || rias.xhr.defaultTimeout,
				headers: headers
			});
			self._currentDfd = results;
			results.total = results.then(function(){
				var range = results.ioArgs.xhr.getResponseHeader("Content-Range");
				if (!range){
					// At least Chrome drops the Content-Range header from cached replies.
					range = results.ioArgs.xhr.getResponseHeader("X-Content-Range");
				}
				range && (range = range.match(/\/(.*)/));
				var data = results.results[0];
				if(!data){
					data = results.results[0] = [];
				}
				var i, l, j, k = 0;
				if(rias.isArray(self.defaultData)){
					for(i = 0, l = self.defaultData.length; i < l; i++){
						j = rias.indexOfByAttr(data, self.defaultData[i][self.idProperty], self.idProperty);
						if(j < 0){
							data.splice(k++, 0, self.defaultData[i]);
						}
					}
				}
				self._currentDfd = null;
				self.dataTotal = results.total;
				return range && k + range[1];
			});
			return QueryResults(results);
		},
		cancelQuery: function(){
			if(this._currentDfd){
				this._currentDfd.cancel();
				this._currentDfd = null;
			}
		}
	});

	var riasType = "rias.riasw.store.JsonRestStore";
	var Widget = rias.declare(riasType, [StoreBase, JsonRest], {

	});

	Widget._riasdMeta = {
		visual: false,
		iconClass: "riaswStoreIcon",
		iconClass16: "riaswStoreIcon16",
		defaultParams: function(params){
			var p = rias.mixinDeep({}, {
				idAttribute: "id",
				labelAttribute: "label",
				target: ""
			}, params);
			return p;
		},
		"property": {
			"idAttribute": {
				"datatype": "string",
				"title": "idAttribute"
			},
			"labelAttribute": {
				"datatype": "string",
				"title": "labelAttribute"
			},
			"target": {
				"datatype": "string",
				"format": "url",
				"title": "URL"
			}
		}
	};

	return Widget;

});