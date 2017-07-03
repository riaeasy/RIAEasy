//RIAStudio client runtime widget - MemoryStore

define([
	"rias/riasBase",
	"riasw/store/StoreBase",
	"dojo/store/Memory",
	"dojo/store/util/QueryResults"
], function(rias, StoreBase, Memory, QueryResults) {

	function convertRegex(character){
		return character === '*' ? '.*' : character === '?' ? '.' : character;
	}

	Memory.extend({

		serverStore: false,
		timeout: rias.xhr.defaultTimeout,

		postscript: function(params){
			this._currentDfd = [];
			this.inherited(arguments);
		},
		//postCreate: function(){
		//	this.inherited(arguments);
		//},
		_onDestroy: function(){
			this.cancelQuery();
			this.inherited(arguments);
		},

		put: function(object, options){
			// summary:
			//		Stores an object
			// object: Object
			//		The object to store.
			// options: dojo/store/api/Store.PutDirectives?
			//		Additional metadata for storing the data.  Includes an "id"
			//		property if a specific id is to be used.
			// returns: Number
			var data = this.data,
				index = this.index,
				idProperty = this.idProperty;
			var id = object[idProperty] = (options && "id" in options) ? options.id : idProperty in object ? object[idProperty] : Math.random();
			if(id in index){
				// object exists
				if(options && options.overwrite === false){
					throw new Error("Object already exists");
				}
				// replace the entry in data
				/// 允许部分修改。
				data[index[id]] = rias.mixinDeep(data[index[id]], object);
			}else{
				// add the new object
				///TODO:zensst. 缺少属性值时，怎样补齐？
				index[id] = data.push(object) - 1;
			}
			return id;
		},

		queryEngine: function(query, options){
			// create our matching query function
			var self = this;
			switch(typeof query){
				default:
					throw new Error("Can not query with a " + typeof query);
				case "object":
				case "undefined":
					var queryObject = query;
					for(var key in queryObject){
						var required = queryObject[key];
						//if(rias.isString(required) && required.startWith("/") && required.endWith("/")){
						//	required = new RegExp(required.slice(1, -1));
						//	queryObject[key] = required;
						//}
						if(typeof required === "string"){
							if(required.startWith("/") && required.endWith("/")){
								queryObject[key] = new RegExp(required.slice(1, -1));
							}else{
								queryObject[key] = new RegExp("^" + rias.regexp.escapeString(required, "*?\\").replace(/\\.|\*|\?/g, convertRegex) + "$", options && options.ignoreCase ? "mi" : "m");
							}
						}
					}
					query = function(object){
						for(var key in queryObject){
							var required = queryObject[key];
							if(required && required.test){
								// an object can provide a test method, which makes it work with regex
								if(!required.test(object[key], object)){
									return false;
								}
							}else if(required !== object[key]){
								return false;
							}
						}
						return true;
					};
					break;
				case "string":
					// named query
					if(!this[query]){
						throw new Error("No filter function " + query + " was found in store");
					}
					query = rias.hitch(this, this[query]);///zensst. hitch
				// fall through
				case "function":
				// fall through
			}
			function execute(array){
				// execute the whole query, first we filter
				var results = rias.filter(array, query);
				// next we sort
				var sortSet = options && options.sort;
				if(sortSet){
					results.sort(typeof sortSet === "function" ? sortSet : function(a, b){
						for(var sort, i=0; (sort = sortSet[i]); i++){
							var aValue = a[sort.attribute];
							var bValue = b[sort.attribute];
							// valueOf enables proper comparison of dates
							aValue = aValue != null ? aValue.valueOf() : aValue;
							bValue = bValue != null ? bValue.valueOf() : bValue;
							if (aValue !== bValue){
								return ((!!sort.descending) === (aValue == null || aValue > bValue) ? -1 : 1);
							}
						}
						return 0;
					});
				}
				// now we paginate
				if(options && (options.start || options.count)){
					var total = results.length;
					results = results.slice(options.start || 0, (options.start || 0) + (options.count || Infinity));
					results.total = total;
				}
				self.dataTotal = results.total;
				return results;
			}
			execute.matches = query;
			return execute;
		},
		query: function(query, options){
			// summary:
			//		Queries the store for objects.
			// query: Object
			//		The query to use for retrieving objects from the store.
			// options: dojo/store/api/Store.QueryOptions?
			//		The optional arguments to apply to the resultset.
			// returns: dojo/store/api/Store.QueryResults
			//		The results of the query, extended with iterative methods.
			//
			// example:
			//		Given the following store:
			//
			// 	|	var store = new Memory({
			// 	|		data: [
			// 	|			{id: 1, name: "one", prime: false },
			//	|			{id: 2, name: "two", even: true, prime: true},
			//	|			{id: 3, name: "three", prime: true},
			//	|			{id: 4, name: "four", even: true, prime: false},
			//	|			{id: 5, name: "five", prime: true}
			//	|		]
			//	|	});
			//
			//	...find all items where "prime" is true:
			//
			//	|	var results = store.query({ prime: true });
			//
			//	...or find all items where "even" is true:
			//
			//	|	var results = store.query({ even: true });
			return QueryResults(this.queryEngine(query, options)(this.data));
		},
		find:function (query, options) {
			return this.queryEngine(query, options)(this.data);
		},

		setData: function(/*data|items|target*/data){
			// summary:
			//		Sets the given data as the source for this store, and indexes it
			// data: Object[]
			//		An array of objects to use as the source of data.
			if(!rias.isArray(data)){
				data = this.data = [];
			}
			if(data.items){
				// just for convenience with the data format IFRS expects
				this.idProperty = data.identifier || this.idProperty;
				data = this.data = data.items;
			}else{
				this.data = data;
			}
			this.index = {};
			var i, l, j, k;
			if(rias.isArray(this.defaultData)){
				k = 0;
				for(i = 0, l = this.defaultData.length; i < l; i++){
					j = rias.indexOfByAttr(data, this.defaultData[i][this.idProperty], this.idProperty);
					if(j < 0){
						data.splice(k++, 0, this.defaultData[i]);
					}
				}
			}
			for(i = 0, l = data.length; i < l; i++){
				this.index[data[i][this.idProperty]] = i;
			}
			return true;
		},
		initByHttp: function(query, options){
			var d = rias.newDeferred("MemoryStore.initByHttp", rias.defaultDeferredTimeout << 1, function(){
					this.cancel();
				});
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
			var self = this;
			function _ok(){
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
				self.setData(data);
				//self._currentDfd = null;
				rias.removeItems(self._currentDfd, results);
				results.total = range && k + rias.toNumber(range[1]);
				d.resolve(data);
				return results.total;
			}
			function _err(e){
				d.reject(e);
			}
			var results = rias.xhr.get({
				url: this.target + (query || ""),
				handleAs: "json",
				timeout: options.timeout || this.timeout || rias.xhr.defaultTimeout,
				headers: headers
			}, {}, _ok, _err, true);
			//this._currentDfd = d;
			this._currentDfd.push(results);
			return d;
		},
		initByFile: function(query, options){
			var d = rias.newDeferred("MemoryStore.initByFile", rias.defaultDeferredTimeout << 1, function(){
					this.cancel();
				}),
				args = {
					options: {}
				};
			options = options || {};

			args.query = query || {};
			if(rias.isString(args.query)){
				args.query = rias.urlParamsToObj(args.query);
			}

			if(options.start >= 0 || options.count >= 0){
				args.options.start = options.start || 0;
				args.options.count = options.count;
			}
			if(options.sort){
				args.options.sort = options.sort;
			}
			//this.cancelQuery();
			var self = this;
			function _ok(data){
				if(!data){
					data = [];
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
				self.setData(data);
				//self._currentDfd = null;
				rias.removeItems(self._currentDfd, results);
				results.total = data.length;
				d.resolve(data);
				return results.total;
			}
			function _err(e){
				d.reject(e);
			}
			var results = rias.xhr.get({
				url: this.target,
				isFileLocation: true,
				handleAs: "json",
				timeout: options.timeout || this.timeout || rias.xhr.defaultTimeout
			}, {}, _ok, _err, true);
			//this._currentDfd = d;
			this._currentDfd.push(results);
			return d;
		},
		cancelQuery: function(){
			rias.forEach(this._currentDfd, function(dfd){
				dfd.cancel();
			});
			this._currentDfd.length = 0;
		}

	});

	var riaswType = "riasw.store.MemoryStore";
	var Widget = rias.declare(riaswType, [StoreBase, Memory], {
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
			"index": {
				"datatype": "object",
				"description": "An index of data indices into the data array by id",
				"title": "Index",
				"hidden": "true"
			}
		}
	};

	return Widget;

});