//RIAStudio client runtime widget - JsonRpcStore

define([
	"rias",
	"rias/riasw/store/StoreBase",
	"dojox/data/JsonRestStore",
	"dojox/data/ServiceStore"
], function(rias, StoreBase, JsonRestStore, SS) {

	SS.extend({
		_processResults : function(results, deferred){
			// this should return an object with the items as an array and the total count of
			// items (maybe more than currently in the result set).
			// for example:
			//	| {totalCount:10, items: [{id:1},{id:2}]}

			// index the results, assigning ids as necessary

			var count;//修正原来的申明在 if 中的问题.
			if(results && typeof results === 'object'){
				var id = results.__id;
				if(!id){// if it hasn't been assigned yet
					if(this.idAttribute){
						// use the defined id if available
						id = results[this.idAttribute];
					}else{
						id = this._currentId++;
					}
					if(id !== undefined){
						var existingObj = this._index[id];
						if(existingObj){
							for(var j in existingObj){
								delete existingObj[j]; // clear it so we can mixin
							}
							results = rias.mixin(existingObj,results);
						}
						results.__id = id;
						this._index[id] = results;
					}
				}
				for(var i in results){
					results[i] = this._processResults(results[i], deferred).items;
				}
				count = results.length;
			}
			return {
				totalCount: count && (deferred.request.count === count) ? (deferred.request.start || 0) + count * this.estimateCountFactor : count,
				items: results
			};
		}
	});

	var riaswType = "rias.riasw.store.JsonRpcStore";
	var Widget = rias.declare(riaswType, [StoreBase, JsonRestStore], {

		postscript: function(/*Object?*/params){
			var rpc = rias.getObject("dojox.rpc"),
				s = rpc.JsonRest.services[params.target],
				obj = this;
			if(!params.service && !s){
				obj.service._getRequest = function(id, args){
					if(rias.isObject(id)){
						id = rias.objectToQuery(id);
						id = id ? "?" + id: "";
					}else if(!id){//修正 dojo 的问题，当 id = undefined
						id = "";
					}
					if(args && args.sort && !args.queryStr){
						id += (id ? "&" : "?") + "sort(";
						for(var i = 0; i<args.sort.length; i++){
							var sort = args.sort[i];
							id += (i > 0 ? "," : "") + (sort.descending ? '-' : '+') + encodeURIComponent(sort.attribute);
						}
						id += ")";
					}
					var request = {
						url: this.servicePath + (id == null ? "" : id),
						handleAs: this.isJson ? 'json' : 'text',
						contentType: this.isJson ? 'application/json' : 'text/plain',
						sync: rpc._sync,
						headers: {
							Accept: this.isJson ? 'application/json,application/javascript' : '*/*'
						}
					};
					if(args && (args.start >= 0 || args.count >= 0)){
						request.headers.Range = "items=" + (args.start || '0') + '-' +
							(("count" in args && args.count != Infinity) ?
								(args.count + (args.start || 0) - 1) : '');
					}
					rpc._sync = false;
					return request;
				};
			}
			this.inherited(arguments);
		},

		destroy: function(){
			this.close();
		},

		close: function(/*dojo/data/api/Request|Object?*/ request){
			this._index = {};
			this.inherited(arguments);
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