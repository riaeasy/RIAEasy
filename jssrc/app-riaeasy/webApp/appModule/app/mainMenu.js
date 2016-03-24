define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 32,
	"_riaswType": "rias.riasw.studio.Module",
	"_riaswVersion": "1.0",
		"caption": rias.i18n.webApp.menu,
		"tooltip": rias.i18n.webApp.menu,
	"iconClass": "menuIcon",
		"minSize": {
			"h": 360,
			"w": 240
		},
	"style": {
		"width": "240px"
	},
		onRestore: function(){
			this.resize({
				h: rias.toInt(this._riasrParent.domNode.clientHeight * 0.8, 480)
			});
			//this.loadMenu();
		},
	"buildMenu": function (items){
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
				disabled: !c.length && rias.trim(item.dcmd) === "",
				cmd: item.dcmd ? item.dcmd : "",
				iconClass: item.dicon ? item.dicon : undefined,
				children: c
			};
		}
		function getChildren(item){
			var r = [];
			rias.forEach(rias.filter(items, function(i){
				return i.idp == item.id && i.typ == 1;
			}), function(i){
				r.push(getItem(i));
			});
			return r;
		}
		children.push({
			_riaswType: "rias.riasw.widget.Tree",
			_riaswIdOfModule: "MenuTree",
			"class": "riaswTreeMenu",
			region: "center",
			persist: false,
			showRoot: false,
			isSource: false,
			accept: [],
			toggleOnClick: true,
			//expandOnEnter: true,
			collapseOnEnter: false,
			//style: {
			//	padding: "1px",
			//	width: "100%",
			//	height: "100%"
			//},
			model: {
				_riaswType: "rias.riasw.widget.TreeModel",
				rootId: "1",
				rootLabel: "菜单",
				store: {
					_riaswType: "rias.riasw.store.MemoryStore",
					idAttribute: "id",
					labelAttribute: "text",
					data: getChildren({
						id: "1",
						idp: "0",
						typ: 1,
						code: "root",
						text: "菜单",
						leaf: false,
						isExpanded: true,
						cmd: "",
						disabled: false,
						children: true
					})
				}
			},
			onClick: function(item, node, evt){
				m.treeOnClick(item, node, evt);
			}
		});
		rias.destroy(m.MenuTree);
		rias.filer(children, m.menuPane, m).then(function(result){
			rias.forEach(result.widgets, function(pane){
				m.resize();
			});
		});
	},
	"loadMenu": function (){
		var m = this,
			q;
		if(this.menuStore.fetch){
			this.menuStore.fetch({
				query: {
				},
				onBegin: function(size){
				},
				onComplete: function(items){
					m.buildMenu(items);
					m.resize();
				},
				onError: function(error){
					console.error(error);
				}
			});
		}else{
			q = this.menuStore.query({});
			//rias.when(q.total, onBegin);
			rias.when(q, function(items){
				m.buildMenu(items);
				//m.needLayout = true;
				m.resize();
			}, function(error){
				console.error(error);
			});
		}
	},
	"afterLoadedAndShown": function (){
		this.loadMenu();
	},
	"launch": function (meta, args){
		var m = this;
		if(rias.isString(meta)){
			args = rias.mixin({}, args, {
				moduleMeta: meta
			})
		}else{
			args = meta;
		}
		args = rias.mixin({
			_riaswIdOfModule: m.currentItem.code || m.currentItem.id,
			caption: m.currentItem.text,
			moduleMeta: "",
			moduleParams: {},
			reCreate: false,
			iconClass: m.currentItem.iconClass
		}, args);
		rias.webApp.launch(args);
		m.submit();
	},
	"treeOnClick": function (item, node, evt){
		var m = this;
		m.currentItem = item;
		if(item && item.cmd && !node.tree.model.mayHaveChildren(item)){
			rias.runByModule(m, item.cmd, "mainMenu_" + item.id);
		}
	},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "menuPane",
			"region": "center",
			"style": {
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.store.JsonRestStore",
					"_riaswIdOfModule": "menuStore",
					"target": "act/appMain/getMenu"
				}
			]
		}
	]
}
	
});
