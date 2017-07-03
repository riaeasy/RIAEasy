//RIAStudio client runtime widget - JsonXhrStore

define([
	"rias/riasBase",
	"riasw/store/StoreBase",
	"dojo/store/util/QueryResults"
], function(rias, StoreBase, QueryResults) {

	var riaswType = "riasw.store.JsonXhrStore";
	var Widget = rias.declare(riaswType, [StoreBase], {

		headers: {},
		target: "",
		idProperty: "id",
		ascendingPrefix: "+",
		descendingPrefix: "-",
		accepts: "application/javascript, application/json",

		//noSuffixId: true,
		serverStore: true,
		timeout: rias.xhr.defaultTimeout,

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
			this._currentDfd = [];
			this.inherited(arguments);
		},
		_onDestroy: function(){
			this.cancelQuery();
			this.inherited(arguments);
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
			return rias.xhr.get(args, undefined, function(result){
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
				silenceError: options.silenceError,
				url: this._getTarget(id),
				postData: object,
				handleAs: "json",
				headers: rias.mixin({
					//"Content-Type": "application/json",//该值会造成 servlet 不转换为 parameter
					Accept: this.accepts,
					"If-Match": options.overwrite === true ? "*" : null,
					"If-None-Match": options.overwrite === false ? "*" : null
				}, this.headers, options.headers)
			};
			///options.incremental 未决
			return (hasId && !options.incremental && options.overwrite !== false ? rias.xhr.put : rias.xhr.add)(args);
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
			return rias.xhr.dele(args);
		},

		query: function(query, options){
			options = options || {};
			var headers = rias.mixin({
				Accept: this.accepts
			}, this.headers, options.headers);
			var hasQuestionMark = this.target.indexOf("?") > -1;
			query = query || "";
			if(typeof query === "object"){
				query = rias.objToUrlParams(query);
				query = query ? (hasQuestionMark ? "&" : "?") + query: "";
			}
			if(options.start >= 0 || options.count >= 0){
				headers["X-Range"] = "items=" + (options.start || '0') + '-' +
					(("count" in options && options.count !== Infinity) ?
						(options.count + (options.start || 0) - 1) : '');
				if(this.rangeParam){
					query += (query || hasQuestionMark ? "&" : "?") + this.rangeParam + "=" + headers["X-Range"];
					hasQuestionMark = true;
				}else{
					headers.Range = headers["X-Range"];
				}
			}
			if(options && options.sort){
				var sortParam = this.sortParam;
				query += (query || hasQuestionMark ? "&" : "?") + (sortParam ? sortParam + '=' : "sort(");
				for(var i = 0; i<options.sort.length; i++){
					var sort = options.sort[i];
					query += (i > 0 ? "," : "") + (sort.descending ? this.descendingPrefix : this.ascendingPrefix) + encodeURIComponent(sort.attribute);
				}
				if(!sortParam){
					query += ")";
				}
			}
			//this.cancelQuery();
			var results = rias.xhr.get({
				url: this.target + (query || ""),
				handleAs: "json",
				timeout: options.timeout || this.timeout || rias.xhr.defaultTimeout,
				headers: headers
			});
			this._currentDfd.push(results);
			var self = this;
			results.total = results.then(function(){
				var range = results.ioArgs.xhr.getResponseHeader("Content-Range");
				if (!range){
					// At least Chrome drops the Content-Range header from cached replies.
					range = results.ioArgs.xhr.getResponseHeader("X-Content-Range");
				}
				if(range){
					range = range.match(/\/(.*)/);
				}
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
				rias.removeItems(self._currentDfd, results);
				self.dataTotal = results.total;
				return range && k + rias.toNumber(range[1]);
			});
			return QueryResults(results);
		},
		cancelQuery: function(){
			rias.forEach(this._currentDfd, function(dfd){
				dfd.cancel();
			});
			this._currentDfd.length = 0;
		}

	});

	Widget._riasdMeta = {
		visual: false,
		"property": {
			"idProperty": {
				"datatype": "string",
				"title": "idProperty"
			},
			"labelProperty": {
				"datatype": "string",
				"title": "labelProperty"
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