define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 30,
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
		"$refObj": "rias.webApp.datas.xdict"
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
			return m.additionRootItems ? m.additionRootItems.concat(r) : r;
		}
		children.push({
			_riaswType: "rias.riasw.widget.Tree",
			_riaswIdOfModule: "tree",
			//"class": "riaswTreeMenu",
			region: "center",
			persist: false,
			showRoot: false,
			isSource: false,
			accept: [],
			model: {
				_riaswType: "rias.riasw.widget.TreeModel",
				rootId: "1",
				rootLabel: "条目",
				store: {
					_riaswType: "rias.riasw.store.MemoryStore",
					idProperty: "id",
					labelProperty: "text",
					data: getData()
				},
				onGetLabel: function(item){
					return item.text + (item.dgg ? "(" + item.dgg + item.dggdw + ")" : "");
				}
			},
			onClick: function(item, node, evt){
				var m = this._riasrModule,
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
				var m = this._riasrModule,
					p = node.tree.model.mayHaveChildren(item),
					t = rias.getSelectTreeModeInt(m.selectMode);
				if(!p && t === 2 || p && t === 1){
					return;
				}
				m.submit();
			}
		});
		rias.bind(children, m.panTree).then(function(result){
			rias.forEach(result.widgets, function(pane){
				m.resize();
			});
		});
	},
	"afterBind": function (result){
		var m = this,
			q;
		this._store = this.store || rias.webApp.datas.xdict;
		q = this._store.query(this.query || {});
		//rias.when(q.total, onBegin);
		rias.when(q, function(items){
			//m.buildTree(items);
			m.resize();
		}, function(error){
			console.error(error);
		});
	},
	"_riaswChildren": [
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
