define([
	"riasw/riaswBase"
], function(rias){
	return {
	"_rsfVersion": 47,
	"_riaswType": "riasw.sys.Module",
	"_riaswVersion": "1.0",
	"caption": "菜单",
	"iconClass": "outlineIcon",
	"minSize": {
		"h": 360,
		"w": 240
	},
	"tooltip": "菜单",
	"afterLoadedAll": function (loadOk){
			this.loadMenu();
	},
	"onRestore": function (){
		this.menuTree.refresh();
		},
	"onShow": function (){
		},
	"onHide": function (){
			//if(this.menuPane){
			//	this.menuPane.destroyDescendants();
			//}
		if(this.menuTree){
			this.menuTree.clear();
		}
		},
	"buildMenu": function (items){
			function getItem(item){
				var c = getChildren(item);
				return {
					id: item.id,
					code: item.code,
					text: item.text,
					leaf: item.leaf,
					isExpanded: item.expanded,
					disabled: (item.disabled == true) || (!c.length && !rias.trim(item.dcmd)),
					cmd: item.dcmd ? item.dcmd : "",
					iconClass: item.dicon ? item.dicon : undefined,
					children: c
				};
			}
			function getChildren(item){
				var r = [];
				rias.forEach(rias.filter(items, function(i){
					return i.parentId === item.id && i.typ === 1;
				}), function(i){
					r.push(getItem(i));
				});
				return r;
			}

			if(!rias.isArray(items)){
				items = [];
			}
			items.push({
				id: "99",
				parentId: "1",
				typ: 1,
				code: "about",
				text: rias.i18n.sys.about,
				leaf: true,
				isExpanded: true,
				disabled: false,
				dcmd: "rias.showAbout();",
				//iconClass: item.dicon ? item.dicon : undefined,
				children: 0
			});
		this.menuTree.model.store.objectStore.setData(getChildren({
			id: "1",
			parentId: "0",
			typ: 1,
			code: "root",
			text: "菜单",
			leaf: false,
			isExpanded: true,
			dcmd: "",
			disabled: false,
			children: true
		}));
		},
	"loadMenu": function (){
			var m = this,
				q;
			if(rias.ownerSceneBy(m).oper.logged){
				q = this.menuStore.query({});
			}else{
				q = [];
			}
			rias.when(q, function(items){
				m.buildMenu(items);
			}, function(error){
				console.error(error);
			});
		},
	"launch": function (args){
			var m = this;
			if(rias.isString(args)){
				args = {
					moduleMeta: args
				};
			}
			args = rias.mixin({
				_riaswIdInModule: rias.trim(m.currentItem.code) || m.currentItem.id,
				caption: m.currentItem.text,
				moduleMeta: "",
				reCreate: false,
				iconClass: m.currentItem.iconClass
			}, args);
			return rias.ownerSceneBy(m).launch(args).then(function(){
				m.submit();
			}, function(e){
				rias.warn("启动【" + args.caption + "】模块失败：\n" + e, m);
			});
		},
	"treeOnClick": function (item, node, evt){
			var m = this;
			m.currentItem = item;
			if(!m._busy && item && item.cmd && !node.tree.model.mayHaveChildren(item)){
				m._busy = true;
				rias.$script(m, item.cmd, "mainMenu_" + item.id);
				m.defer(function(){
					m._busy = false;
				}, 1000);
			}
		},
	"_riaswElements": [
		{
			"_riaswType": "riasw.store.JsonXhrStore",
			"_riaswIdInModule": "menuStore",
			"target": "act/appMain/getMenu"
		},
		{
			"_riaswType": "riasw.layout.Panel",
			"_riaswIdInModule": "menuPane",
			"region": "center",
			"style": {
			},
			"_riaswElements": [
				{
					"_riaswType": "riasw.tree.Tree",
					"_riaswIdInModule": "menuTree",
					"class": "riaswTreeMenu",
					"region": "center",
					"persist": true,
					"autoFocusWhenSelectNode": true,
					"showRoot": false,
					"isSource": false,
					"accept": [
					],
					"model": {
						"_riaswType": "riasw.tree.TreeModel",
						"rootId": "1",
						"rootLabel": "菜单",
						"rootItems": {
							"items": [
								{
									"id": "1",
									"parentId": "0",
									"typ": 1,
									"code": "root",
									"text": "菜单",
									"leaf": false,
									"isExpanded": true,
									"dcmd": "",
									"disabled": false,
									"children": true
								},
								{
									"id": "99",
									"parentId": "1",
									"typ": 1,
									"code": "about",
									"text": "关于...",
									"leaf": true,
									"isExpanded": true,
									"disabled": false,
									"dcmd": "rias.showAbout();",
									"children": 0
								}
							],
							"query": {
								"parentCode": "parentId"
							}
						},
						"store": {
							"_riaswType": "riasw.store.MemoryStore",
							"idProperty": "id",
							"labelProperty": "text",
							"target": "act/appMain/getMenu",
							"data": [
							]
						}
					},
					"onClick": function (item, node, evt){
					this.ownerModule().treeOnClick(item, node, evt);
				}
				}
			]
		}
	]
};
	
});
