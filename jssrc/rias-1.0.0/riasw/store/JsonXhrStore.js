//RIAStudio client runtime widget - JsonXhrStore

define([
	"rias",
	"rias/riasw/store/StoreBase",
	"dojo/store/util/QueryResults"
], function(rias, StoreBase, QueryResults) {

	var riasType = "rias.riasw.store.JsonXhrStore";
	var Widget = rias.declare(riasType, [StoreBase], {

		headers: {},
		target: "",
		idProperty: "id",
		ascendingPrefix: "+",
		descendingPrefix: "-",
		accepts: "application/javascript, application/json",

		//noSuffixId: true,
		serverStore: true,
		timeout: rias.xhr.defaultTimeout,
		_currentDfd: null,

		constructor: function(options){
			// summary:
			//		This is a basic store for RESTful communicating with a server through JSON
			//		formatted data.
			// options: dojo/store/JsonRest
			//		This provides any configuration information that will be mixed into the store
			this.headers = {};
			rias.safeMixin(this, options);
		},

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

		_getTarget: function(id){
			var target = this.target;
			/*if(!this.noSuffixId){
				if(typeof id != "undefined"){
					if(target.charAt(target.length-1) == '/'){
						target += id;
					}else{
						target += '/' + id;
					}
				}
			}*/
			return target;
		},
		get: function(id, options){
			options = options || {};
			var headers = rias.mixin({
				Accept: this.accepts
			}, this.headers, options.headers || options);
			var args = {
				url: this._getTarget(id),
				query: {},
				handleAs: "json",
				headers: headers
			};
			args.query[this.idProperty] = id;
			return rias.xhrGet(args, undefined, function(result){
				///需要回调转换 array 为 object
				return rias.isArray(result) ? result[0] : result;
			});
		},
		getIdentity: function(object){
			return object[this.idProperty];
		},
		put: function(object, options){
			options = options || {};
			var id = ("id" in options) ? options.id : this.getIdentity(object);
			var hasId = typeof id != "undefined";
			object = rias.mixin({
				_idDirty: options.overwrite !== false ? id : undefined
			}, object);
			var args = {
				url: this._getTarget(id),
				postData: object,
				handleAs: "json",
				headers: rias.mixin({
					//"Content-Type": "application/json",
					//Accept: this.accepts,
					//"If-Match": options.overwrite === true ? "*" : null,
					//"If-None-Match": options.overwrite === false ? "*" : null
				}, this.headers, options.headers)
			};
			///options.incremental 未决
			return (hasId && !options.incremental && options.overwrite !== false ? rias.xhrPut : rias.xhrAdd)(args);
		},
		add: function(object, options){
			// summary:
			//		Adds an object. This will trigger a PUT request to the server
			//		if the object has an id, otherwise it will trigger a POST request.
			// object: Object
			//		The object to store.
			// options: __PutDirectives?
			//		Additional metadata for storing the data.  Includes an "id"
			//		property if a specific id is to be used.
			options = options || {};
			options.overwrite = false;
			return this.put(object, options);
		},
		remove: function(id, options){
			// summary:
			//		Deletes an object by its identity. This will trigger a DELETE request to the server.
			// id: Number
			//		The identity to use to delete the object
			// options: __HeaderOptions?
			//		HTTP headers.
			options = options || {};
			var args = {
				url: this._getTarget(id),
				postData: {
					_idDirty: id
				},
				handleAs: "json",
				headers: rias.mixin({}, this.headers, options.headers)
			};
			return rias.xhrDelete(args);
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