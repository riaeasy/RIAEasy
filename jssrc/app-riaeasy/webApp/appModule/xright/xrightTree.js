define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 23,
	"_riaswType": "rias.riasw.studio.Module",
	"_riaswVersion": "0.7",
	"query": {
	},
	"rootItems": {
		"items": [
		],
		"query": {
			"parentCode": "root"
		}
	},
	"selectMode": "free",
	"style": {
		"min-height": "360px",
		"min-width": "200px"
	},
	"loadXright": function (query){
		var m = this;
		return this.store.loadByHttp(query || {
			_loadRights: 1
		}).then(function(){
			console.debug(m.id + ".loadXright() ok.");
		}, function(){
			console.error(m.id + ".loadXright() error.", e);
		});
	},
	"afterLoaded": function (result){
		var m = this,
			q;
		this._store = this.store;
		q = this.loadXright();///不带参数，以初始化
		//rias.when(q.total, onBegin);
		rias.when(q, function(items){
			m.tree.reload();
			m.resize();
		}, function(error){
			console.error(error);
		});
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.store.MemoryStore",
			"_riaswIdOfModule": "store",
			"defaultData": [
			],
			"idProperty": "id",
			"target": "act/xright/query",
			"timeout": {
				"$refScript": "return rias.webApp.defaultTimeout;"
			}
		},
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "panTree",
			"region": "center",
			"style": {
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.widget.Tree",
					"_riaswIdOfModule": "tree",
					"accept": [
					],
					"isSource": false,
					"loadRootOnStartup": false,
					"layoutPriority": 0,
					"model": {
						"rootId": "1",
						"rootLabel": "条目",
						"store": {
							"$refObj": "module.store"
						}
					},
					"persist": false,
					"region": "center",
					"rootItems": {
						"$refObj": "module.rootItems"
					},
					"selectionMode": "multiple",
					"showRoot": false,
					"splitter": false,
					"onGetLabel": function (item){
		return item.text + (item.dval ? "(" + item.dval + ")" : "");
	},
					"onClick": function (item, node, evt){
		var m = this._riasrModule,
			p = node.tree.model.mayHaveChildren(item);
		m.currentItem = item;
		m.setRiasrModuleResult(item, !p);
	},
					"onDblClick": function (item, node, evt){
		var m = this._riasrModule,
			p = node.tree.model.mayHaveChildren(item),
			t = rias.getSelectTreeModeInt(m.selectMode);
		if(!p && t === 2 || p && t === 1){
			return;
		}
		m.submit();
	}
				}
			]
		}
	]
}
	
});
