//RIAStudio client runtime widget - MemoryStore

define([
	"rias",
	"rias/riasw/store/StoreBase",
	"dojo/store/Memory",
	"dojo/store/util/QueryResults"
], function(rias, StoreBase, Memory, QueryResults) {

	Memory.extend({

		serverStore: false,
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
				case "object": case "undefined":
				var queryObject = query;
				for(var key in queryObject){
					var required = queryObject[key];
					if(rias.isString(required) && rias.startWith(required, "/") && rias.endWith(required, "/")){
						required = new RegExp(required.slice(1, -1));
						queryObject[key] = required;
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
						}else if(required != object[key]){
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
					results.sort(typeof sortSet == "function" ? sortSet : function(a, b){
						for(var sort, i=0; sort = sortSet[i]; i++){
							var aValue = a[sort.attribute];
							var bValue = b[sort.attribute];
							// valueOf enables proper comparison of dates
							aValue = aValue != null ? aValue.valueOf() : aValue;
							bValue = bValue != null ? bValue.valueOf() : bValue;
							if (aValue != bValue){
								return !!sort.descending == (aValue == null || aValue > bValue) ? -1 : 1;
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
		//find: function(query){

		//},
		setData: function(/*data|items|target*/data){
			// summary:
			//		Sets the given data as the source for this store, and indexes it
			// data: Object[]
			//		An array of objects to use as the source of data.
			var self = this;
			if(data.items){
				// just for convenience with the data format IFRS expects
				self.idProperty = data.identifier || self.idProperty;
				data = self.data = data.items;
			}else{
				self.data = data;
			}
			self.index = {};
			if(!rias.isArray(data)){
				data = self.data = [];
			}
			var i, l, j, k;
			if(rias.isArray(self.defaultData)){
				k = 0;
				for(i = 0, l = self.defaultData.length; i < l; i++){
					j = rias.indexOfByAttr(data, self.defaultData[i][self.idProperty], self.idProperty);
					if(j < 0){
						data.splice(k++, 0, self.defaultData[i]);
					}
				}
			}
			for(i = 0, l = data.length; i < l; i++){
				self.index[data[i][self.idProperty]] = i;
			}
			return true;
		},
		loadByHttp: function(query, options){
			var self = this,
				d = rias.newDeferred();
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
			function _ok(){
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
				self.setData(data);
				self._currentDfd = null;
				d.resolve(data);
				results.total = range && k + rias.toNumber(range[1]);
				return results.total
			}
			function _err(e){
				d.reject(e);
			}
			var results = rias.xhrGet({
				url: self.target + (query || ""),
				handleAs: "json",
				timeout: options.timeout || self.timeout || rias.xhr.defaultTimeout,
				headers: headers
			}, {}, _ok, _err, true);
			self._currentDfd = d;
			return d;
		},
		loadByFile: function(query, options){
			var self = this,
				d = rias.newDeferred(),
				args = {
					options: {}
				};
			options = options || {};

			args.query = query || {};
			if(rias.isString(args.query)){
				args.query = rias.xhr.queryToObject(args.query);
			}

			if(options.start >= 0 || options.count >= 0){
				args.options.start = options.start || 0;
				args.options.count = options.count;
			}
			if(options.sort){
				args.options.sort = options.sort;
			}
			if(self._currentDfd){
				self._currentDfd.cancel();
			}
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
				self._currentDfd = null;
				results.total = data.length;
				d.resolve(data);
				return results.total
			}
			function _err(e){
				d.reject(e);
			}
			var results = rias.xhrGet({
				url: self.target,
				isFileLocation: true,
				handleAs: "json",
				timeout: options.timeout || self.timeout || rias.xhr.defaultTimeout
			}, {}, _ok, _err, true);
			self._currentDfd = d;
			return d;
		},
		cancelQuery: function(){
			if(this._currentDfd){
				this._currentDfd.cancel();
				this._currentDfd = null;
			}
		}

	});

	var riasType = "rias.riasw.store.MemoryStore";
	var Widget = rias.declare(riasType, [StoreBase, Memory], {
	});

	Widget._riasdMeta = {
		visual: false,
		iconClass: "riaswMemoryIcon",
		iconClass16: "riaswMemoryIcon16",
		defaultParams: function(params){
			var p = rias.mixinDeep({}, {
				idAttribute: "id",
				labelAttribute: "label",
				index: {}
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