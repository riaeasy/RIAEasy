define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 124,
	"_riaswType": "rias.riasw.studio.Module",
	"_riaswVersion": "0.7",
	"gutters": false,
	"region": "center",
	"requires": [
	],
	"afterFiler": function (){
			var m = this;
			if(!rias.webApp.mainDock){
				rias.webApp.mainDock = m.appMainDockBottom;
			}
			if(!rias.webApp.newAppModule){
				rias.webApp.newAppModule = function(args){
					var d = rias.newDeferred();
					if(!rias.webApp.logged){
						m.doLogin(function(){
							//m.defer(function(){
							//	m.newTabModule(args);
							//}, 300);
							m.newTabModule(args).then(function(){
								d.resolve.apply(this, arguments);
							}, function(){
								d.reject.apply(this, arguments);
							});
						}, function(){
							d.reject.apply(this, arguments);
						});
					}else{
						m.newTabModule(args).then(function(){
							d.resolve.apply(this, arguments);
						}, function(){
							d.reject.apply(this, arguments);
						});
					}
					return d.promise;
				};
			}
			m.showLogInfo();
		},
	"afterLoaded": function (){
		var meta = [{
			"_riaswType": "rias.riasw.layout.DialogPanel",
			"_riaswIdOfModule": "appInfos",
			"$refNote": "",
			"alwaysShowDockNode": true,
			"badge": "2",
			//"iconClass": "infoIcon",
			"badgeColor": "red",
			"badgeStyle": {
			},
			"caption": "公告",
			"closable": false,
			"cookieName": "appInfos",
			"initDisplayState": "docked",
			"dockTo": {
				"$refObj": "appMainDockTop"
			},
			"maxable": true,
			"minSize": {
				"h": 320,
				"w": 200
			},
			"persist": false,
			"placeToArgs": {
			},
			"moduleMeta": "appModule/tools/infos",
			"style": {
				"height": "36em",
				"padding": "0px",
				"width": "28em"
			},
			"toggleable": true,
			"_riaswChildren": []
		}];
		if(rias.has("rias-riasd")){
			meta.unshift({
				"_riaswType": "rias.riasw.layout.DialogPanel",
				"_riaswIdOfModule": "riasdFileSelector",
				"$refNote": "",
				"alwaysShowDockNode": true,
				"caption": {
					$refObj: "rias.i18n.riasd.visualEditor"
				},
				//"iconClass": "riasdIcon",
				"tooltip": {
					$refScript: "return rias.i18n.riasd.visualEditor + '<br/>IE11及以下版本只能使用部分功能';"
				},
				"closable": false,
				submitDisplayState: "docked",
				"initDisplayState": "docked",
				"dockTo": {
					"$refObj": "appMainDockTop"
				},
				"maxable": false,
				"persist": false,
				"toggleable": true,
				autoToggle: true,
				dialogType: "top",
				autoClose: 0,
				minSize: {
					h: 360,
					w: 240
				},
				"placeToArgs": {
					around: {
						$refObj: "appMainDockTop"
					},
					orient: ["below-alt"]
				},
				style: {
					width: "30em",
					"padding": "0px",
					height: rias.toInt(this.domNode.clientHeight * 0.7, 600) + "px"//"80em"//rias.toInt(m.domNode.clientHeight * 0.7) + "px"
				},
				moduleMeta: {
					$refScript: "return rias.getRiasdUrl('rias/riasd/module/fileSelector');"
				},
				rootId: "appModule",
				//onlyDir: true,
				actions: {
					get:		"act/riasd/getAppModule",
					//save:		"act/riasd/saveAppModule",
					newDir:		"act/riasd/newAppModuleDir",
					newFile:	"act/riasd/newAppModule",
					//rename:		"act/riasd/renameAppModule",
					dele:		"act/riasd/deleAppModule"
				},
				afterSubmit: function(){
					var m = this._riasrModule,
						item = this.get("_riasrModuleResult"),
						mn;
					if(!item){
						//请选择一个节点
						return false;
					}else if(item.itemType === "file"){
						mn = item.pathname.replace(/\.js$/gi, "").replace(/\.rsf$/gi, "").replace(/\./gi, "/");
						rias.undef(mn);
						///先获取文件锁，然后再打开
						//rias.xhrPost({
						//
						//});
						/*m.newEditor(//mn, mm, idOfModule, caption, reCreate
							pageParent || m.currentPage._riasdPageParent,
							mn,
							mn,
							mn.replace(/\//g, "_").replace(/^appModule_/, ""),
							true
						);*/
						return rias.webApp.newAppModule({//moduleMeta, idOfModule, caption, moduleParams, reCreate, id
							isRiasd: true,
							moduleMeta: rias.getRiasdUrl("rias/riasd/module/visualEditor"),
							idOfModule: "ve_" + mn.replace(/\//g, "_").replace(/\./g, "_").replace(/^appModule_/, ""),
							caption: mn,
							moduleParams: {
								ownerRiasw: m,//rias.webApp,
								_riasdModulename: mn
							},
							reCreate: false,
							id: "ve_" + mn.replace(/\//g, "_").replace(/\./g, "_").replace(/^appModule_/, ""),
							iconClass: "riasdIcon"
						});
					}
				}
			});
		}
		rias.filer(meta, this, this).then(function(result){
		});
		},
	"showLogInfo": function (){
			var m = this,
				b = rias.webApp.logged;
		if(m.panOper){
			m.panOper.set("content", b ? rias.webApp.oper.code + "/" + rias.webApp.oper.name : "尚未登录");
		}
		m.menuPanel.set("splitter", b);
		//m.menuPanel.set("toggleable", b);
		if(b){
			m.menuPanel.showMin();
		}else{
			m.menuPanel.hide();
		}
	},
	"doLogin": function (okcall, errcall){
			var m = this;
			function _login(){
				m.mainMenu.loadMenu();
				rias.webApp.newAppModule({//moduleMeta, idOfModule, caption, moduleParams, reCreate
					moduleMeta: "appModule/app/workbench",
					idOfModule: "tabWorkbench",
					//caption: "工作台",
					moduleParams: {},
					reCreate: true
				}).then(function(){
						if(rias.isFunction(okcall)){
							okcall(rias.webApp.logged, rias.webApp.oper);
						}
					});
			}
			function _logout(){
				if(m.tabWorkbench){
					m.tabs.closeChild(m.tabWorkbench);
				}
				if(rias.isFunction(errcall)){
					errcall(rias.webApp.logged, rias.webApp.oper);
				}
			}
			rias.webApp.login(m.btnLogin, function(logged, oper){
				m.showLogInfo();
				if(rias.webApp.logged){
					_login();
				}else{
					_logout();
				}
			}, function(logged, oper){
				_logout();
			});
		},
	"newTabModule": function (args){
			var self = this,
				d = rias.newDeferred(),
				tabs = self.tabs,
				children = tabs.getChildren(),
				c, cs = (args.caption || "").split("/"), ts = "",
				i, l,
				parentModule = args.moduleParams && args.moduleParams.parentModule ? args.moduleParams.parentModule : self;
			function _filer(){
				var moduleParams = rias.mixinDeep({}, args.moduleParams, {
					_riaswType: "rias.riasw.studio.Module",
					_riaswIdOfModule: args.idOfModule,
					id: args.id,
					moduleMeta: args.moduleMeta,
					region: "center",
					closable: args.idOfModule !== "tabWorkbench",
					//caption: ts,
					//iconClass: args.iconClass,
					watchPageState: !args.isRiasd
				});
				if(ts){
					moduleParams.caption = ts
				}
				if(args.iconClass != undefined){
					moduleParams.iconClass = args.iconClass
				}
				rias._deleDP(moduleParams);
				rias.filer([moduleParams], tabs, parentModule).then(function(result){
					if(result.errors){
						rias.error(result.errors);
						d.reject(result);
					}else if(c = result.widgets[0]){
						if(tabs.selectedChildWidget != c){
							rias.when(tabs.selectChild(c, true), function(){
								d.resolve(result);
							});
						}else{
							d.resolve(result);
						}
					}else{
						d.reject(result);
					}
				});
			}
			//cs = args.caption.split("/");//.slice(1);
		//ts = "";
		l = cs.length;
		if(l > 0){
			for(i = 0, --l; i < l; i++){
				ts = ts + cs[i] + " / ";
			}
			if(ts){
				ts = '<font color="blue">' + ts + '</font>';
			}
			ts = ts + cs[cs.length - 1];
		}
			if(args.idOfModule){
				rias.forEach(children, function(page){
					if(page._riaswIdOfModule === args.idOfModule){
						if(!args.reCreate){
							c = page;
							rias.when(tabs.selectChild(page, true), function(){
								d.resolve(page);
							});
						}else{
							if(page){
								var h = rias.after(page, "destroy", function(){
									_filer();
									h.remove();
								}, false);
								tabs.closeChild(page);
							}else{
								_filer();
							}
						}
					}
				});
			}
			if(!c){
				_filer();
			}
			return d.promise;
		},
	"_actMenu": function (){
			var m = this;
			if(m){
				if(!rias.webApp.logged){
					m.doLogin(function(){
						m._actMenu();
					});
				}else if(!m._menu){
					m._menu = rias.show({
						ownerRiasw: rias.webApp,
						_riaswIdOfModule: "appMainMenu",
						dialogType: "top",
						caption: rias.i18n.webApp.menu,
						around: m.btnMenu,
						autoClose: 0,
						//autoClose: 0,
						resizable: false,
						toggleable: false,
						maxable: false,
						//dockTo: rias.rias.webApp.mainDock,
						//state: 0,
						//cookieName: "",
						//persist: false,
						style: {
							"min-width": "200px",
							"min-height": "360px",
							width: "300px",
							height: rias.toInt(m.domNode.clientHeight * 0.7) + "px"
						},
						moduleMeta: "appModule/app/mainMenu",
						query: {
							//id: ""
						},
						onClose: function(){
							delete m._menu;
							return 1;
						}
					});
				}
			}
		},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "mainTop",
			"region": "top",
			"design": "headline",
			"persist": false,
			"gutters": false,
			"class": "webAppHeader",
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.layout.Panel",
					"region": "left",
					"class": "webAppHeaderLogo",
					"onClick": function (evt){
							rias.showAbout(this);
						},
					"_riaswIdOfModule": "panLogo"
				},
				{
					"_riaswType": "rias.riasw.layout.DockBar",
					"_riaswIdOfModule": "appMainDockTop",
					"region": "center",
					"float": "right",
					"class": "webAppHeaderDockBar"
				},
				{
					"_riaswType": "rias.riasw.layout.Panel",
					"_riaswIdOfModule": "btns",
					"class": "webAppHeaderBtns",
					"layoutPriority": 0,
					"region": "right",
					"style": {
						"width": "18em"
					},
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.form.Button",
							"_riaswIdOfModule": "btnLogin",
							"iconClass": "loginIcon",
							"label": {
								"$refObj": "rias.i18n.webApp.login"
							},
							"onClick": function (evt){
									var m = this._riasrModule;
									m.doLogin();
									//},
									//onMouseOver: function(evt){
									//	var m = this._riasrModule;
									//	if(rias.webApp.logged && !m._menu){
									//		m._actMenu();
									//	}
								}
						},
						{
							"_riaswType": "rias.riasw.form.Button",
							"_riaswIdOfModule": "btnOption",
							"label": {
								"$refObj": "rias.i18n.webApp.setting"
							},
							"tooltip": "暂时未提供...",
							"iconClass": "optionIcon",
							"disabled": true,
							"onClick": function (evt){
									rias.info("暂时未提供...", this);
								}
						},
						{
							"_riaswType": "rias.riasw.form.Button",
							"_riaswIdOfModule": "btnHelp",
							"label": {
								"$refObj": "rias.i18n.webApp.help"
							},
							"tooltip": "暂时未提供...",
							"iconClass": "helpIcon",
							"disabled": true,
							"onClick": function (evt){
									rias.info("暂时未提供...", this);
								}
						}
					]
				}
			]
		},
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "mainCenter",
			"class": "webAppContent",
			"design": "headline",
			"gutters": false,
			"persist": false,
			"region": "center",
			"style": {
				"border": "silver solid 1px"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.layout.TabPanel",
					"_riaswIdOfModule": "tabs",
					"region": "center",
					"tabPosition": "top",
					"tabStrip": true,
					"nested": false,
					"style": {
						"padding": "0px"
					},
					"onShowChild": function (page){
							var m = page._riasrModule;
							if(m){
								m.currentPage = page;
							}
							rias.closePopup();
						},
					"_riaswChildren": [
						{
							"_riaswType": "rias.riasw.studio.Module",
							"_riaswIdOfModule": "tabMyHome",
							"moduleMeta": "appModule/app/myHome",
							"region": "center",
							"style": {
								"border": "1px #b1badf solid",
								"padding": "0px"
							}
						}
					]
				}
			]
		},
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "mainBottom",
			"class": "webAppFooter",
			"design": "sidebar",
			"gutters": false,
			"persist": false,
			"region": "bottom",
			"splitter": false,
			"style": {
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.html.Tag",
					"_riaswIdOfModule": "panOper",
					"content": "尚未登录",
					"region": "left",
					"style": {
						"border": "1px solid silver",
						"line-height": "2em",
						"margin": "0px",
						"padding": "0px",
						"width": "16em"
					},
					"tagType": "label"
				},
				{
					"_riaswType": "rias.riasw.layout.DockBar",
					"_riaswIdOfModule": "appMainDockBottom",
					"class": "webAppFooterDockBar",
					"region": "center",
					"style": {
						"margin": "0px",
						"padding": "0px"
					}
				}
			]
		},
		{
			"_riaswType": "rias.riasw.layout.CaptionPanel",
			"_riaswIdOfModule": "menuPanel",
			"autoToggle": true,
			"caption": "菜单",
			"iconClass": "menuIcon",
			"initDisplayBox": {
				"w": 240
			},
			"initDisplayState": "hidden",
			"minSize": {
				"h": 360,
				"w": 240
			},
			"region": "left",
			"splitter": false,
			"style": {
				"display": "none",
				"padding": "0px",
				"width": "20em"
			},
			"toggleable": true,
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.studio.Module",
					"_riaswIdOfModule": "mainMenu",
					"layoutPriority": 0,
					"region": "center",
					"splitter": false,
					"moduleMeta": "appModule/app/mainMenu"
				}
			]
		}
	]
}
	
});
