
define([
	"rias",
	"rias/riasw/store/StoreBase",
	"dojox/data/QueryReadStore"
], function(rias, StoreBase, _Widget) {

	_Widget.extend({

		serverStore: true,

		close: function(/*dojo/data/api/Request|Object?*/ request){
			this._items = [];
			this._numRows = 0;
		}
	});

	var riasType = "rias.riasw.store.QueryReadStore";
	var Widget = rias.declare(riasType, [StoreBase, _Widget],{
	});

	Widget._riasdMeta = {
		visual: false,
		iconClass: "riaswRestStoreIcon",
		iconClass16: "riaswRestStoreIcon16",
		defaultParams: function(params){
			params = rias.mixinDeep({}, {
				idAttribute: 'id',
				data: {
					identifier: "id",
					label: "label",
					items: []
				}
			}, params);
			return params;
		},
		"property": {
			"data": {
				"datatype": "json",
				"title": "Data"
			},
			"url": {
				"datatype": "string",
				"format": "url",
				"title": "URL"
			}
		}
	};

	return Widget;
});
