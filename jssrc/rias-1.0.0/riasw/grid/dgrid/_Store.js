
//RIAStudio client runtime widget - DGrid

define([
	"rias",
	"dstore/legacy/StoreAdapter",
	"dstore/QueryResults",
	"dstore/Tree"
], function(rias, StoreAdapter, QueryResults, StoreTree) {

	var riaswType = "rias.riasw.grid.dgrid._Store";
	var Widget = rias.declare(riaswType, [StoreAdapter],{//, StoreTree], {
		constructor: function () {
			this.root = this;
		},
		mayHaveChildren: function (object) {
			//return 'hasChildren' in object ? object.hasChildren : true;
			return this.root.objectStore.hasChildren && this.root.objectStore.hasChildren(this.getIdentity(object), object);
		},
		getRootCollection: function () {
			//return this.root.filter({ parent: null });
			return this.root.filter({ parentId: null });
		},
		getChildren: function (object) {
			//return this.root.filter({ parent: this.getIdentity(object) });
			return this.root.filter({ parentId: this.getIdentity(object) });
		},

		fetch: function () {
			// summary:
			//		Fetches the query results. Note that the fetch may occur asynchronously
			// returns: Array|Promise
			//		The results or a promise for the results

			// create an object store query and query options based on current collection
			// information
			return this.fetchRange.apply(this, arguments || []);
		},
		fetchRange: function (rangeArgs) {
			// summary:
			//		Fetches the query results with a range. Note that the fetch may occur asynchronously
			// returns: Array|Promise
			//		The results or a promise for the results

			// create an object store query and query options based on current collection
			// information
			var queryOptions = {},
				queryLog = this.queryLog,
				getQueryArguments = function (type) {
					return rias.map(
						rias.filter(queryLog, function (entry) {
							return entry.type === type;
						}),
						function (entry) {
							return entry.normalizedArguments[0];
						}
					);
				};

			// take the last sort since multiple sorts are not supported by dojo/store
			var sorted = getQueryArguments('sort').pop();
			if (sorted) {
				queryOptions.sort = sorted;

				if (sorted instanceof Array) {
					// object stores expect an attribute property
					for (var i = 0; i < sorted.length; i++) {
						var sortSegment = sorted[i];
						sortSegment.attribute = sortSegment.property;
					}
				}
			}
			if (rangeArgs) {
				// set the range
				queryOptions.count = rangeArgs.end - ((queryOptions.start = rangeArgs.start) || 0);
			}

			var queryObject = {};
			applyFilter(getQueryArguments('filter'));

			function applyFilter(filtered) {
				for (var i = 0; i < filtered.length; i++) {
					var filter = filtered[i];
					var type = filter.type;
					var args = filter.args;
					if (type === 'and') {
						applyFilter(args);
					} else if (type === 'eq' || type === 'match') {
						queryObject[args[0]] = args[1];
					} else if (type === 'string') {
						queryObject = args[0];
					} else if (type) {
						throw new Error('"' + type + ' operator can not be converted to a legacy store query');
					}
					// else if (!type) { no-op }
				}
			}

			///增加 this.queryObject，可以传递给 store.query
			var results = this.objectStore.query(rias.mixinDeep({}, this.queryObject, queryObject), queryOptions);
			if (results) {
				// apply the object restoration
				return new QueryResults(rias.when(results.map(this._restore, this)), {
					totalLength: rias.when(results.total)
				});
			}
			return rias.when(results);
		}
	});

	Widget._riasdMeta = {
		visual: false,
		iconClass: "riaswStoreIcon",
		iconClass16: "riaswStoreIcon16",
		defaultParams: function(params){
			var p = rias.mixinDeep({}, {
				target: ""
			}, params);
			return p;
		},
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