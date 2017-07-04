define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 33,
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
	"store": {
		"$refObj": "rias.desktop.datas.xdict"
	},
	"style": {
		"min-height": "360px",
		"min-width": "200px"
	},
	"buildTree": function (items){
		var children = [],
			m = this;
		function getItem(item){
			var c = getChildren(item);
			return {
				id: item.id,
				code: item.code,
				text: item.text,
				leaf: item.leaf,
				isExpanded: item.expanded,
				dtyp: item.dtyp,
				dval: item.dval ? item.dval : "",
				disabled: false,//!c.length && rias.trim(item.dcmd) === "",
				children: c
			};
		}
		function getChildren(item){
			var r = [];
			rias.forEach(rias.filter(items, function(i){
				return i.parentId == item.id;// && i.typ == 1;
			}), function(i){
				r.push(getItem(i));
			});
			return r;
		}
		function getData(){
			var r = [],
				p = [];
			if(m.rootItems){
				if(m.rootItems.query){
					p = m._store.query(m.rootItems.query);
				}
				if(m.rootItems.items){
					p = p.concat(m.rootItems.items);
				}
			}
			if(!rias.isArray(p)){
				p = [p];
			}
			rias.forEach(p, function(i){
				r.push(getItem(i));
			});
			return m.additionItems ? m.additionItems.concat(r) : r;
		}
		children.push({
			_riaswType: "riasw.tree.Tree",
			_riaswIdInModule: "tree",
			//"class": "riaswTreeMenu",
			region: "center",
			showRoot: false,
			isSource: false,
			accept: [],
			model: {
				_riaswType: "riasw.tree.TreeModel",
				rootId: "1",
				rootLabel: "条目",
				store: {
					_riaswType: "riasw.store.MemoryStore",
					idProperty: "id",
					labelProperty: "text",
					data: getData()
				},
				onGetLabel: function(item){
					return item.text + (item.dgg ? "(" + item.dgg + item.dggdw + ")" : "");
				}
			},
			onClick: function(item, node, evt){
				var m = this.getOwnerModule(),
					p = node.tree.model.mayHaveChildren(item);
				m.currentItem = item;
				if(p){
					if(node.isExpanded){
						node.tree._collapseNode(node);
					}else{
						node.tree._expandNode(node);
					}
				}
				m._onSelect(item, !p);
			},
			onDblClick: function(item, node, evt){
				var m = this.getOwnerModule(),
					p = node.tree.model.mayHaveChildren(item),
					t = rias.getSelectTreeModeInt(m.selectMode);
				if(!p && t === 2 || p && t === 1){
					return;
				}
				m.submit(evt);
			}
		});
	},
	"afterParse": function (result){
		var m = this,
			q;
		this._store = this.store || rias.desktop.datas.xdict;
		q = this._store.query(this.query || {});
		//rias.when(q.total, onBegin);
		rias.when(q, function(items){
			//m.buildTree(items);
			//m.resize();
		}, function(error){
			console.error(error);
		});
	},
	"_riaswElements": [
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
					"showRoot": false,
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
