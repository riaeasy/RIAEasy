define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 34,
	"_riaswVersion": "0.7",
	"query": {
	},
	"rootItems": {
		"items": [
		],
		"query": {
			"idp": "1"
		}
	},
	"selectMode": "free",
	"style": {
		"min-height": "360px",
		"min-width": "200px"
	},
	"_riaswElements": [
		{
			"_riaswType": "riasw.store.MemoryStore",
			"_riaswIdInModule": "store",
			"defaultData": [
			],
			"idProperty": "id",
			"target": "act/xright/query",
			"timeout": {
				"$refScript": "return rias.desktop.defaultTimeout;"
			},
			"onInitStore": function (){
				return this.initByHttp({
						_loadRights: 1
					}).then(function(){
					console.debug(this.id + ".onInitStore ok.");
				}, function(e){
					console.error(this.id + ".onInitStore error.", e);
				});
			}
		},
		{
			"_riaswType": "riasw.layout.Panel",
			"_riaswIdInModule": "panTree",
			"region": "center",
			"style": {
			},
			"_riaswElements": [
				{
					"_riaswType": "riasw.tree.Tree",
					"_riaswIdInModule": "tree",
					"accept": [
					],
					"isSource": false,
					"layoutPriority": 0,
					"loadRootOnStartup": true,
					"model": {
						"rootId": "1",
						"rootLabel": "条目",
						"store": {
							"$refObj": "module.store"
						}
					},
					"region": "center",
					"rootItems": {
						"$refObj": "module.rootItems"
					},
					"selectionMode": "multiple",
					"showRoot": true,
					"splitter": false,
					"onGetLabel": function (item){
		return item.text + (item.dval ? "(" + item.dval + ")" : "");
	},
					"onClick": function (item, node, evt){
		var m = this.getOwnerModule();
		m.currentItem = item;
	},
					"onDblClick": function (item, node, evt){
		var m = this.getOwnerModule(),
			p = node.tree.model.mayHaveChildren(item),
			t = rias.getSelectTreeModeInt(m.selectMode);
		if(!p && t === 2 || p && t === 1){
			return;
		}
		m.submit(evt);
	}
				}
			]
		}
	]
};
	
});
