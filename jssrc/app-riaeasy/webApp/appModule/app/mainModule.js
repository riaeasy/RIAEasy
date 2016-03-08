define([
	"rias"
], function(rias){
	return {
	"_rsfVersion": 126,
	"_riaswVersion": "1.0",
	"gutters": false,
	"region": "center",
	"requires": [
	],
	"afterFiler": function (){
			var m = this;
			if(!rias.webApp.mainDock){
				rias.webApp.mainDock = m.appMainDockBottom;
			}
			if(!rias.webApp.launch){
				rias.webApp.launch = function(args){//moduleMeta, _riaswIdOfModule, caption, moduleParams, reCreate, id
					if(rias.isArray(args)){
						var ds = [];
						rias.forEach(args, function(arg){
							ds.push(rias.webApp.launch(arg));
						});
						return rias.all(ds);
					}else{
						var d = rias.newDeferred();
						if(!rias.webApp.logged && args.requireLogged != false){
							m.doLogin(function(){
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
					}
				};
			}
			if(!rias.webApp.launchRiasd){
				rias.webApp.launchRiasd = function(modulename, owner){//moduleMeta, _riaswIdOfModule, caption, moduleParams, reCreate, id
					rias.webApp.launch({
						isRiasd: true,
						moduleMeta: rias.getRiasdUrl("rias/riasd/module/visualEditor"),
						_riaswIdOfModule: "ve_" + modulename.replace(/\//g, "_").replace(/\./g, "_").replace(/^appModule_/, ""),
						caption: modulename,
						moduleParams: {
							ownerRiasw: owner || m,
							_riasdModulename: modulename
						},
						//reCreate: false,
						id: "ve_" + modulename.replace(/\//g, "_").replace(/\./g, "_").replace(/^appModule_/, ""),
						iconClass: "riasdIcon"
					});
				};
			}
			m.showLogInfo();
		},
	"afterLoaded": function (){
			var m = this,
				meta = [{
					requireLogged: false,
					moduleMeta: "appModule/app/myHome",
					_riaswIdOfModule: "myHome",
					//caption: "主页",
					moduleParams: {},
					//reCreate: true,
					closable: false
				},{
					requireLogged: false,
					"moduleMeta": "appModule/tools/infos",
					"_riaswType": "rias.riasw.layout.DialogPanel",
					_riaswIdOfModule: "appInfos",
					//caption: "公告",
					moduleParams: {},
					//reCreate: true,
					closable: false,

					//"$refNote": "",
					//"cookieName": "appInfos",
					//"persist": false,
					"initDisplayState": "hidden",
					"dockTo": {
						"$refObj": "appMainDockTop"
					},
					//"maxable": true,
					"minSize": {
						"h": 320,
						"w": 200
					},
					"_riaswChildren": []
				}];

			if(!m._riasrDesigning){
				rias.webApp.launch(meta).then(function(){
					rias.when(rias.initRiasd(), function(){
						rias.webApp.launch({
								requireLogged: false,
								"_riaswType": "rias.riasw.layout.DialogPanel",
								"_riaswIdOfModule": "riasdFileSelector",
								"$refNote": "",
								"caption": {
									$refObj: "rias.i18n.riasd.visualEditor"
								},
								"tooltip": {
									$refScript: "return rias.i18n.riasd.visualEditor + '<br/>IE11及以下版本只能使用部分功能';"
								},
								"closable": false,
								submitDisplayState: "collapsed",
								"initDisplayState": "hidden",
								"initPlaceToArgs": {
									parent: m,
									around: "riasdFileSelector._riasrDockNode",
									orient: ["below-centered"]
								},
								"dockTo": {
									"$refObj": "appMainDockTop"
								},
								"maxable": false,
								"persist": false,
								//"toggleable": false,
								//toggleOnEnter: true,
								//toggleOnLeave: false,
								dialogType: "top",
								//autoClose: 0,
								minSize: {
									h: 360,
									w: 240
								},
								style: {
									width: "30em",
									height: rias.toInt(m.domNode.clientHeight * 0.7, 600) + "px",//"80em"//rias.toInt(m.domNode.clientHeight * 0.7) + "px"
									"padding": "0px"
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
								onRestore: function(){
									this.resize({
										h: rias.toInt(this._riasrParent.domNode.clientHeight * 0.8, 480)
									})
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
										return rias.webApp.launchRiasd(mn);
									}
								}
							}).then(function(){
						});
					});
				});
			}
		},
	"showLogInfo": function (){
			var m = this,
				b = rias.webApp.logged;
			if(m.panOper){
				m.panOper.set("content", b ? rias.webApp.oper.code + "/" + rias.webApp.oper.name : "尚未登录");
			}
		},
	"doLogin": function (okcall, errcall){
			var m = this;
			function _login(){
				m.appDockPanel.restore();
				rias.webApp.launch([{
						//requireLogged: true,
						"moduleMeta": "appModule/app/mainMenu",
						"_riaswType": "rias.riasw.layout.DialogPanel",
						_riaswIdOfModule: "mainMenu",
						//caption: "菜单",
						moduleParams: {},
						reCreate: true,
						closable: false,

						dialogType: "top",
						maxable: false,
						"toggleOnEnter": true,
						toggleOnLeave: false,
						//alwaysShowDockNode:true,
						submitDisplayState: "collapsed",
						"initDisplayState": "hidden",
						//"initDisplayBox": {
						//	"h": 360,
						//	"w": 240
						//},
						"initPlaceToArgs": {
							parent: m,
							around: "mainMenu._riasrDockNode",
							orient: ["after"]
						},
						"minSize": {
							"h": 360,
							"w": 240
						},

						"style": {
							//"display": "none",
							"padding": "0px",
							"width": "30em",
							height: "60em"// rias.toInt(this.domNode.clientHeight * 0.8, 480) + "px"//"80em"//rias.toInt(m.domNode.clientHeight * 0.7) + "px"
						},
						onRestore: function(){
							this.resize({
								h: rias.toInt(this._riasrParent.domNode.clientHeight * 0.8, 480)
							})
						},
						"_riaswChildren": []
					},{
						moduleMeta: "appModule/app/workbench",
						_riaswIdOfModule: "tabWorkbench",
						//caption: "工作台",
						moduleParams: {},
						reCreate: true,

						"closable": false
					}]).then(function(){
						m.mainMenu.loadMenu();
						if(rias.isFunction(okcall)){
							okcall(rias.webApp.logged, rias.webApp.oper);
						}
					});
			}
			function _logout(){
				if(m.mainMenu){
					rias.destroy(m.mainMenu);
				}
				if(m.tabWorkbench){
					rias.destroy(m.tabWorkbench);
				}
				m.appDockPanel.hide();
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
		args = rias.decodeRiaswParams(this, args);
		var self = this,
				d = rias.newDeferred(),
				asDialog = (args._riaswType === "rias.riasw.layout.DialogPanel"),
				parentModule = args._riasrModule || (args.moduleParams && args.moduleParams._riasrModule ? args.moduleParams._riasrModule : self),
				parent = (asDialog ? (rias.by(args.parent) || (args.initPlaceToArgs && rias.by(args.initPlaceToArgs.parent)) || self.mainCenter) : self.tabs),
				c, cs = (args.caption || "").split("/"), ts = "",
				i, l;
			function _getStyle(moduleParams, meta){
				var _box;
				if(meta){
					_box = rias.dom.getContentBox(parent.containerNode);
					moduleParams.style = rias.mixinDeep({}, {
						height: rias.toInt(rias.max(_box.h * 0.8, 360)) + "px",
						width: rias.toInt(rias.max(_box.w * 0.8, 640)) + "px"
					}, meta.style, moduleParams.style);
				}
				return moduleParams.style;
			}
			function _filer(){
				var dMeta;
				if(rias.isString(args.moduleMeta)){
					dMeta = rias.newDeferred();
					try{
						rias.require([args.moduleMeta], function(meta){
							dMeta.resolve(meta);
						});
					}catch(e){
						dMeta.reject(e);
					}
				}else{
					dMeta = args.moduleMeta;
				}
				rias.when(dMeta, function(meta){
					var moduleParams = rias.mixinDeep({}, args, {
						ownerRiasw: parentModule,
						//parent: panel,
						"_riaswType": args._riaswType || (asDialog ? "rias.riasw.layout.DialogPanel" : "rias.riasw.layout.CaptionPanel"),
						_riaswIdOfModule: args._riaswIdOfModule,
						id: args.id,
						moduleMeta: meta,
						"captionClass": (args.captionClass != undefined
							? args.captionClass.indexOf("appModuleCaption") >= 0 ? args.captionClass : args.captionClass + " appModuleCaption"
							: "appModuleCaption"),
						"contentClass": (args.contentClass != undefined
							? args.contentClass.indexOf("appModuleContent") >= 0 ? args.contentClass : args.contentClass + " appModuleContent"
							: "appModuleContent"),
						closable: (args.closable != undefined ? args.closable : true),
						"dockTo": args.dockTo || self.appDock,//args.isRiasd ? self.appMainDockBottom : self.appDock,
						region: (args.region != undefined ? args.region : asDialog ? "" : "center"),///Dialod 强制 region = ""
						resizable: (args.resizable != undefined ? args.resizable : !!asDialog),// !meta.region,
						maxable: (args.maxable != undefined ? args.maxable : !!asDialog),
						"toggleable": (args.toggleable != undefined ? args.toggleable : !!asDialog),
						"toggleOnEnter": (args.toggleOnEnter != undefined ? args.toggleOnEnter : false),
						toggleOnLeave: (args.toggleOnLeave != undefined ? args.toggleOnLeave : false),
						alwaysShowDockNode: (args.alwaysShowDockNode != undefined ? args.alwaysShowDockNode : true),
						//watchTargetState: true,// !args.isRiasd,
						dockNodeParams: {
							style: {}
						}
					});
					if(moduleParams.dockTo == self.appDock || moduleParams.dockTo == self.appDock._riaswIdOfModule){
						moduleParams.dockNodeParams.iconLayoutTop = true;
						moduleParams.dockNodeParams.style.width = "5em";
					}
					moduleParams.style = rias.dom.styleToObject(moduleParams.style);
					if(asDialog){
						_getStyle(moduleParams, meta);
					}else{
						rias.mixinDeep(moduleParams, {
							dockNodeParams: {
								toggle: function(){
									var target = this.targetWidget;
									if(target === parent.selectedChildWidget){
										//parent.back();
									}else{
										parent.selectChild(target, true);
									}
								},
								_onMouseEnter: function(e){
									var self = this,
										target = self.targetWidget;
									if(target && !self._autoToggleDelay && !target._playing){
										self._autoToggleDelay = self.defer(function(){
											rias.when(parent.selectChild(target, true), function(){
												if(self._autoToggleDelay){
													self._autoToggleDelay.remove();
													delete self._autoToggleDelay;
												}
											});
										}, rias.autoToggleDuration);
									}
								}
							}
						});
					}
					if(ts){
						moduleParams.caption = ts;
					}
					if(args.iconClass != undefined){
						moduleParams.iconClass = args.iconClass;
					}
					if(args.restrictPadding != undefined){
						if(!asDialog){
							moduleParams.restrictPadding = args.restrictPadding;
						}
					}
					rias.mixinDeep(moduleParams, args.moduleParams);
					//delete moduleParams.asDialog;
					//delete moduleParams.idOfModule;
					delete moduleParams.reCreate;
					if(moduleParams.initPlaceToArgs && moduleParams.initPlaceToArgs.parent){
						delete moduleParams.initPlaceToArgs.parent;
					}
					rias._deleDP(moduleParams);
					rias.filer([moduleParams], parent, parentModule).then(function(result){
						if(result.errors){
							rias.error(result.errors);
							d.reject(result);
						}else if(c = result.widgets[0]){
							if(asDialog){
								//c.bringToTop();///需要保持设计值的 initDisplayState
								d.resolve(c);
							}else{
								if(parent.selectedChildWidget != c){
									rias.when(parent.selectChild(c, true), function(){
										d.resolve(c);
									});
								}else{
									d.resolve(c);
								}
							}
						}else{
							d.reject(result);
						}
					});
				}, function(e){
					rias.error({
						content: e.message
					});
					d.reject(e);
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
			if(args._riaswIdOfModule){
				if(c = parentModule[args._riaswIdOfModule]){
					if(!args.reCreate){
						if(rias.isInstanceOf(c, "rias.riasw.layout.DialogPanel")){
							c.bringToTop();///已存在，则唤起。
							d.resolve(c);
						}else{
							rias.when(parent.selectChild(c, true), function(){
								d.resolve(c);
							});
						}
					}else{
						var h = rias.after(c, "destroy", function(){
							_filer();
							h.remove();
						}, false);
						rias.destroy(c);
					}
				}
			}
			if(!c){
				_filer();
			}
			return d.promise;
		},
	"_riaswChildren": [
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "mainTop",
			"region": "top",
			"design": "headline",
			"persist": false,
			"gutters": false,
			"class": "webAppHeader riaswShadow",
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
			"_riaswIdOfModule": "mainBottom",
			"class": "webAppFooter riaswShadow",
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
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "appDockPanel",
			"class": "webAppDockPanel riaswShadow",
			"region": "left",
			"layoutPriority": 0,
			"gutters": false,
			"initDisplayState": "hidden",
			"splitter": false,
			"style": {
				"border": "0px solid silver"
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.layout.DockBar",
					"_riaswIdOfModule": "appDock",
					"style": {
						"padding": "0px 0em"
					}
				}
			]
		},
		{
			"_riaswType": "rias.riasw.layout.Panel",
			"_riaswIdOfModule": "mainCenter",
			"class": "webAppCenter riaswShadow",
			"design": "headline",
			"gutters": false,
			"persist": false,
			"region": "center",
			"style": {
			},
			"_riaswChildren": [
				{
					"_riaswType": "rias.riasw.layout.StackPanel",
					"_riaswIdOfModule": "tabs",
					"class": "webAppCenterStack",
					"region": "center",
					"tabPosition": "top",
					"tabStrip": true,
					"nested": false,
					"style": {
						"padding": "0px"
					},
					"onShowChild": function (page){
							this._resizeParent();
							page.isTopmost = true;
							if(page._riasrDockNode){
								page._riasrDockNode.setTargetState();
							}
						},
					"onHideChild": function (page){
							delete page.isTopmost;
							if(page._riasrDockNode){
								page._riasrDockNode.setTargetState();
							}
						}
				}
			]
		}
	]
}
	
});
