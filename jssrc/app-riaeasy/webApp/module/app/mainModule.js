define([
	"rias"
], function(rias){
	return {
		"_rsfVersion": 81,
		"_riaswType": "rias.riasw.studio.Module",
		"_riaswVersion": "0.7",
		"region": "center",
		"requires": "http://www.riaeasy.com:8081/rias/riasd/riasd.js",
		"afterFiler": function (){
			var m = this;
			if(!rias.webApp.mainDock){
				rias.webApp.mainDock = m.appMainDockBottom;
			}
			m.showLogInfo();
		},
		"showLogInfo": function (){
			var m = this;
			if(m.panOper){
				if(rias.webApp.logged){
					m.panOper.set("content", rias.webApp.oper.code + "/" + rias.webApp.oper.name);
				}else{
					m.panOper.set("content", "尚未登录");
				}
			}
		},
		"_login": function (logged, oper){
			var m = this;
			m.showLogInfo();
			if(logged){
				m.newTabModule(//moduleMeta, idOfModule, caption, moduleParams, reCreate
					"appModule/app/workbench",
					"tabWorkbench",
					"工作台",
					{},
					true
				);
			}else{
				if(m.tabWorkbench){
					m.tabs.closeChild(m.tabWorkbench);
				}
			}
		},
		"newTabModule": function (moduleMeta, idOfModule, caption, moduleParams, reCreate, id){
			var self = this,
				d = rias.newDeferred(),
				tabs = self.tabs,
				children = tabs.getChildren(),
				c, ts = "",
				p = 0, l = caption.length,
				module = moduleParams && moduleParams._riasrModule ? moduleParams._riasrModule : self;
			function _filer(){
				moduleParams = rias.mixinDeep({}, moduleParams, {
					_riaswType: "rias.riasw.studio.Module",
					_riaswIdOfModule: idOfModule,
					id: id,
					moduleMeta: moduleMeta,
					region: "center",
					closable: idOfModule !== "tabWorkbench",
					caption: ts
				});
				rias._deleDP(moduleParams);
				rias.filer([moduleParams], tabs, module).then(function(result){
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
			//while(p < l){
			//	ts = ts + caption.substr(p, 2);// + "\n";
			//	p += 2;
			//}
			ts = caption.split("/");//.slice(1);
			ts = rias.map(ts, function(item, i, arr){
				if(i + 1 === arr.length){
					return '<font color="blue">' + item + '</font>';
				}else{
					return '<font color="black">' + item + '</font>';
				}
			});
			ts = ts.join(" / ");
			rias.forEach(children, function(page){
				if(page._riaswIdOfModule === idOfModule || page.caption === ts){
					if(!reCreate){
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
			if(!c){
				_filer();
			}
			return d.promise;
		},
		"_actMenu": function (){
			var m = this;
			if(m){
				if(!rias.webApp.logged){
					rias.webApp.login(m.btnMenu, function(logged, oper){
						m._login(logged, oper);
					});
				}else{
					m._menu = rias.show({
						_riaswOwner: rias.webApp,
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
						},
						callOpen: function(item){
							var id = item.code.toString() || item.id.toString(),
								t = item.text.toString(),
								s = item.moduleMeta.toString().split("?"),
								v = s[1];
							if(v){
								try{
									v = rias.fromJson(v);
								}catch(e){
									console.error("The moduleParams error: " + v + "\n", e);
									v = undefined;
								}
							}
							s = s[0].replace(/\.js$/gi, "").replace(/\./g, "/");
							if(s.indexOf("appModule/") >= 0 || s.indexOf("/module/") >= 0){
								m.newTabModule(//moduleMeta, idOfModule, caption, moduleParams, reCreate
									s,
									id,
									t,
									v,
									false
								);
							}
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
						"class": "webAppHeaderDockBar"
					},
					{
						"_riaswType": "rias.riasw.layout.Panel",
						"_riaswIdOfModule": "btnsRiasd",
						"class": "webAppHeaderBtnsRiasd",
						"layoutPriority": 1,
						"region": "right",
						"style": {
							"width": "8em"
						},
						"_riaswChildren": [
							{
								"_riaswType": "rias.riasw.form.Button",
								"_riaswIdOfModule": "btnVe",
								"iconClass": "drawIcon",
								"label": {
									"$refObj": "rias.i18n.riasd.visualEditor"
								},
								"tooltip": "模块设计器<br/>IE9及以下版本只能使用部分功能",
								"onClick": function (evt){
									//if(rias.has("ie") < 10){
									//	rias.info("不支持IE9及以下\n推荐webkit内核的浏览器，比如360浏览器、Chrome、Firefox等");
									//	return;
									//}
									var m = this._riasrModule;
									if(!rias.webApp.datas.dataLoaded){
										rias.webApp.datas.loadDatas();
									}
									if(m._openDlg){
										return;
									}
									m._openDlg = rias.show({
										ownerRiasw: m,
										_riaswIdOfModule: "fileSelector",
										//parent: m,
										dialogType: "top",
										around: m.btnVe,
										autoClose: 0,
										caption: "资源管理器",
										style: {
											"min-width": "300px",
											"min-height": "400px",
											width: "30em",
											height: rias.toInt(m.domNode.clientHeight * 0.7) + "px"
										},
										moduleMeta: "http://www.riaeasy.com:8081/rias/riasd/module/fileSelector.js",
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
										callOpen: function(node){
											var mn;
											if(!node){
												//请选择一个节点
											}else if(node.itemType === "file"){
												mn = node.pathname.replace(/\.js$/gi, "").replace(/\.rsf$/gi, "").replace(/\./gi, "/");
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
												m.newTabModule(//moduleMeta, idOfModule, caption, moduleParams, reCreate, id
													"http://www.riaeasy.com:8081/rias/riasd/module/visualEditor.js",
													"ve_" + mn.replace(/\//g, "_").replace(/\./g, "_").replace(/^appModule_/, ""),
													mn,
													{
														ownerRiasw: m,//rias.webApp,
														_riasdModulename: mn
													},
													false,
													"ve_" + mn.replace(/\//g, "_").replace(/\./g, "_").replace(/^appModule_/, "")
												);
											}
										},
										onClose: function(mr){
											delete m._openDlg;
											return 1;
										}
									});
								}
							}
						]
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
								"_riaswIdOfModule": "btnMenu",
								"label": "菜单",
								"iconClass": "menuIcon",
								"onClick": function (evt){
									var m = this._riasrModule;
									m._actMenu();
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
								"label": "设置",
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
								"label": "帮助",
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
				"region": "center",
				"design": "headline",
				"persist": false,
				"gutters": false,
				"class": "webAppContent",
				"style": "padding: 0px; min-width:100px; min-height:200px; top: 0px; left: 0px; width: 100%; height: 100%;",
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
								"region": "center",
								"caption": "主页",
								"moduleMeta": "appModule/app/myHomeD",
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
				"_riaswType": "rias.riasw.layout.DialogPanel",
				"_riaswIdOfModule": "paneNotice",
				"$refNote": "",
				"alwaysShowDockNode": false,
				"badge": "2",
				"badgeColor": "red",
				"badgeStyle": {
					"font-size": "1.5em"
				},
				"caption": "通知",
				"closable": false,
				"cookieName": "appNotice",
				"displayState": "docked",
				"dockTo": {
					"$refObj": "appMainDockBottom"
				},
				"maxable": true,
				"minSize": {
					"h": 320,
					"w": 200
				},
				"persist": false,
				"placeToArgs": {
				},
				"style": {
					"height": "36em",
					"padding": "0px",
					"width": "28em"
				},
				"toggleable": true,
				"_riaswChildren": [
					{
						"_riaswType": "rias.riasw.studio.Module",
						"_riaswIdOfModule": "appNotice",
						"region": "center",
						"moduleMeta": "appModule/tools/notice",
						"style": {
							"padding": "0px"
						},
						"onShow": function (){
							var m = this._riasrModule;
						}
					}
				]
			}
		]
	}

});
