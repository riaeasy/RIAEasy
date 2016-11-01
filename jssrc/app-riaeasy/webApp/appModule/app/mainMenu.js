define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 44,
	"_riaswType": "rias.riasw.studio.Module",
	"_riaswVersion": "1.0",
	"caption": "菜单",
	"iconClass": "menuIcon",
	"minSize": {
		"h": 360,
		"w": 240
	},
	"style": {
		"width": "240px"
	},
	"tooltip": "菜单",
	"onRestore": function (){
			this.loadMenu();
		},
	"onShow": function (){
			this.resize({
				h: rias.toInt(this._riasrParentNode.clientHeight * 0.7, 480)
			});
		},
	"onHide": function (){
			if(this.menuPane){
				this.menuPane.destroyDescendants();
			}
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
					disabled: (item.disabled == true) || (!c.length && !rias.trim(item.dcmd)),
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

			if(!rias.isArray(items)){
				items = [];
			}
			items.unshift({
				id: "89",
				idp: "1",
				typ: 1,
				code: "workbench",
				text: rias.i18n.webApp.workbench.caption,
				leaf: true,
				isExpanded: true,
				disabled: !rias.webApp.oper.logged,
				dcmd: "rias.webApp.mainModule.launchWorkbench();",
				//iconClass: item.dicon ? item.dicon : undefined,
				children: 0
			});
			items.push({
				id: "99",
				idp: "1",
				typ: 1,
				code: "about",
				text: rias.i18n.studio.about,
				leaf: true,
				isExpanded: true,
				disabled: false,
				dcmd: "rias.showAbout();",
				//iconClass: item.dicon ? item.dicon : undefined,
				children: 0
			});
			children.push({
				_riaswType: "rias.riasw.widget.Tree",
				_riaswIdOfModule: "menuTree",
				"class": "riaswTreeMenu",
				region: "center",
				persist: false,
				//selectionMode: "single",
				showRoot: false,
				isSource: false,
				accept: [],
				//toggleOnClick: true,
				//expandOnEnter: true,
				//collapseOnEnter: false,
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
						idProperty: "id",
						labelProperty: "text",
						data: getChildren({
							id: "1",
							idp: "0",
							typ: 1,
							code: "root",
							text: "菜单",
							leaf: false,
							isExpanded: true,
							dcmd: "",
							disabled: false,
							children: true
						})
					}
				},
				onClick: function(item, node, evt){
					m.treeOnClick(item, node, evt);
				}
			});
			//rias.destroy(m.menuTree);
			m.menuPane.destroyDescendants();
			rias.bind(children, m.menuPane).then(function(result){
				m.set("needLayout", true);
				m.resize();
				m.focus();
			});
		},
	"loadMenu": function (){
			var m = this,
				q;
			if(rias.webApp.oper.logged){
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
	"afterLoadedAllAndShown": function (){
			//this.loadMenu();
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
				_riaswIdOfModule: rias.trim(m.currentItem.code) || m.currentItem.id,
				caption: m.currentItem.text,
				moduleMeta: "",
				moduleParams: {},
				reCreate: false,
				iconClass: m.currentItem.iconClass
			}, args);
			return rias.webApp.launch(args).then(function(){
				m.submit();
			}, function(e){
				rias.warn("启动【" + args.caption + "】模块失败：\n" + e, null, m);
			});
		},
	"treeOnClick": function (item, node, evt){
			var m = this;
			m.currentItem = item;
			if(!m._busy && item && item.cmd && !node.tree.model.mayHaveChildren(item)){
				m._busy = true;
				rias.$runByModule(m, item.cmd, "mainMenu_" + item.id);
				m.defer(function(){
					m._busy = false;
				}, 1000);
			}
		},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "menuPane",
			"region": "center",
			"style": {
			}
		},
		{
			"_riaswType": "rias.riasw.store.JsonXhrStore",
			"_riaswIdOfModule": "menuStore",
			"target": "act/appMain/getMenu"
		}
	]
}

});
