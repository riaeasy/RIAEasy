
//RIAStudio Client Runtime(rias) in Browser.

define([
	"rias/riasw/riasw",
	"rias/riasw/fx",
	"rias/riasw/xhr",
	"rias/riasw/gesture",
	"rias/riasw/theme",
	"rias/riasw/validate",
	"rias/base/encoding"
], function(rias) {

///studio******************************************************************************///

	rias.studioHome = "http://www.riaeasy.com:8081/";
	rias.studioVersion = {
		major: 1, minor: 0, patch: 0, flag: "",
		revision: 1.0,
		toString: function(){
			var v = dojo.version;
			return this.major + "." + this.minor + "." + this.patch + this.flag + " (" + this.revision + ")" +
				" (dojo:" + v.major + "." + v.minor + "." + v.patch + v.flag + " (" + v.revision + "))";
		}
	};
	rias.studioBuildtime = new Date("2016-9-1");
	rias.studioOwner = "成都世高科技有限公司";
	rias.studioUser = "成都世高科技有限公司";
	//rias.studioTitle = rias.i18n.studio.title + "(" + (rias.i18n.studio.shell) + ")";
	rias.studioTitle = rias.i18n.studio.title;
	rias.compareVersion = function(v1, v2){
		v1 = (v1 + "").split("(")[0].split(".");
		v2 = (v2 + "").split("(")[0].split(".");
		var i = 0,
			l = 4,///注意起止点，< 判断，不是 <=
			t1, t2;
		for(;i < l; i++){
			t1 = rias.toNumber(v1[i], 0);
			t2 = rias.toNumber(v2[i], 0);
			if(t1 < t2){
				return -1;
			}else if(t1 > t2){
				return 1;
			}
		}
		return 0;
	};
	rias.startupWebApp = function(params, refNode){
		var d = rias.newDeferred("startupWebApp", rias.defaultDeferredTimeout << 1, function(){
			this.cancel();
		});
		if(!rias.getObject("rias.webApp")){
			rias.require([
				"dojo/i18n!webApp/nls/appi18n",
				"webApp/riaswMappers",
				"rias/riasw/studio/App",
				"rias/riasw/studio/Module",
				"rias/riasw/studio/DefaultError",
				"rias/riasw/layout/PanelManager"
			], function(appi18n, riaswMappers, App, Module, DefaultError, PanelManager) {

				rias.registerRiaswMappers(riaswMappers);
				rias.i18n.webApp = appi18n;

				rias.theme.loadThemeCss([
					"webApp.css"
				], true);

				params = rias.mixinDeep(params, {
					id: rias.dom.docBody.id ? rias.dom.docBody.id : "webApp"
				});
				var _webApp = rias.createRiasw(App, params, refNode || rias.dom.docBody);
				rias.webApp = _webApp;
				rias.setObject("webApp", _webApp);
				rias.webApp._scopeName = "webApp";
				dojo.scopeMap.webApp = ["webApp", _webApp];
				_webApp.panelManager = PanelManager.singleton;
				rias.ready(1000, function(){
					if(rias.has("ie") < 11){
						rias.message({
							dialogType: "modal",
							content: "为了得到更好的效果，请使用 ie11+ 或者 chrome/firefox 内核的浏览器。"
						});
					}
					//_webApp.own(_webApp._onBeforeUnload = rias.on(window, "beforeunload", function(e){
					//	return "是否退出并关闭[" + _webApp.appTitle + "]?";
					//}));
					_webApp.startup();
					d.resolve(_webApp);
				});
			});
		}
		return d.promise;
	};

	//if(!rias.require.packs.gridx){
	//	rias.require.packs.gridx = {name: "gridx", location: "../../gridx-1.3.7"};
	//}
	if(!rias.require.packs.dgrid){
		rias.require.packs.dgrid = {name: "dgrid", location: "../dgrid-1.1.0"};
	}
	if(!rias.require.packs.dstore){
		rias.require.packs.dstore = {name: "dstore", location: "../dstore-1.1.1"};
	}

	if(!rias.require.packs.orion){
		rias.require.packs.orion = {name: "orion", location: "../../orion-12.0/orion"};
		rias.require.packs.webtools = {name: "webtools", location: "../../orion-12.0/webtools"};
		rias.require.packs.javascript = {name: "javascript", location: "../../orion-12.0/javascript"};
		rias.require.packs.csslint = {name: "csslint", location: "../../orion-12.0/csslint", main: "csslint"};
		rias.require.packs.htmlparser2 = {name: "htmlparser2", location: "../../orion-12.0/htmlparser2"};
		rias.require.packs.i18n = {name: "i18n", location: "../../orion-12.0/requirejs", main: "i18n"};
	}

	rias.open = window.open;

	rias.theme.loadTheme("rias");

	///需要延迟加载
	rias.require([
		"dijit/_WidgetBase",
		"rias/riasw/widget/Tooltip",
		"rias/riasw/layout/DialogPanel"
	], function(_WidgetBase, Tooltip, DialogPanel){
		rias.tooltipPosition = ["below-centered", "above-centered", "after-centered", "before-centered"];
		_WidgetBase.extend({
			//_setTooltipAttr: {node: "focusNode", type: "attribute", attribute: "title"}, // focusNode spans the entire width, titleNode doesn't
			_setTooltipAttr: function(/*String*/ tooltip){
				var self = this,
					t = rias.riasw.__riasrTooltip ? rias.riasw.__riasrTooltip : (rias.riasw.__riasrTooltip = new Tooltip({
						ownerRiasw: rias.webApp,
						_riaswIdOfModule: "_riasrTooltip",
						__h: {},
						position: rias.tooltipPosition,
						showDelay: 1500,
						showingDuration: 3000,
						hideDelay: 200
					})),
					delegatedEvent = function(eventType){
						return eventType;
					},
					node;
				tooltip = tooltip + "";
				self._set("tooltip", tooltip);
				if(tooltip){
					if(self.focusNode && self.id){
						if(!(node = rias.dom.byId(self.focusNode, self.ownerDocument))){
							return;
						}
					}
					if(self.textDir && self.enforceTextDirWithUcc){///即 dojo.has("dojo-bidi")
						tooltip = self.enforceTextDirWithUcc(null, tooltip);
					}
					t.addTarget(self.focusNode);
				}else{
					t.removeTarget(self.focusNode);
				}
			}
		});

		//args = {
		//	id: "",///如果有值，则先 rias.by
		//	parent: parent,
		//	around: around,
		//	positions: ["below-centered", "above-centered", "after-centered", "before-centered"],//rias.tooltipPosition
		//	content: content,
		//	contentType: -1/0/1/2("innerHTML"/"info"/"warn"/"error")内部使用
		//	innerHTML: innerHTML,
		//	moduleMeta: moduleMeta,
		//	caption: caption,
		//	actionBar: [
		//		"btnOk",
		//		{label: "cancel"}
		//	],
		//	onSubmit: function(){},
		//	onCancel: function(){},
		//	closeDelay: 0,
		//	style: undefined

		//	resizable: true,
		//	maxable: false,
		//	minable: true,
		//	cookieName: "",
		//	persist: false,
		//};
		function _showDialog(args) {
			var //_onShow = args.onShow,
				_hookAfterSubmit = args._riasrHookAfterSubmit,
				_afterSubmit = args.afterSubmit,
				_onSubmit = args.onSubmit,
				_onCancel = args.onCancel,
				_onClose = args.onClose,
				_afterLoaded = args.afterLoaded;
			args.style = rias.dom.styleToObject(args.style);
			//if(!stl["min-width"]){
			//	stl["min-width"] = "16em";
			//}
			//if(!stl["min-height"]){
			//	stl["min-height"] = "6em";
			//}
			//args.minSize = (args.minWidth !== undefined ? args.minWidth : 160);
			//args.maxSize = (args.minHeight !== undefined ? args.minHeight : 80);

			args.ownerRiasw = (args.ownerRiasw != undefined ? args.ownerRiasw : rias.webApp);
			//args._riasrModule = (args._riasrModule != undefined ? args._riasrModule : rias.webApp);
			//args._riaswIdOfModule = args._riaswIdOfModule;
			args.parent = (args.parent != undefined ? args.parent :
				rias.isRiaswModule(args.ownerRiasw) ? args.ownerRiasw :
					args.ownerRiasw && rias.isRiaswModule(args.ownerRiasw._riasrModule) ? args.ownerRiasw._riasrModule :
						rias.dom.webAppNode);
			//args.id = args.id;
			//args.caption = args.caption;
			//args.moduleMeta = args.moduleMeta;
			//args.href = args.href;
			//args.content = args.content;
			//args.dialogType = args.dialogType;
			args.closable = (args.closable != undefined ? args.closable : true);
			args.resizable = (args.resizable != undefined ? args.resizable : "xy");
			args.maxable = (args.maxable != undefined ? args.maxable : false);
			args.cookieName = (args.cookieName != undefined ? args.cookieName : "");
			args.persist = (args.persist != undefined ? args.persist : 0);
			args.contentType = (args.contentType != undefined ? args.contentType : "none");
			//delete args.onShow;
			//delete args._riasrHookAfterSubmit;
			//delete args.afterSubmit;
			//delete args.onSubmit;
			//delete args.onCancel;
			delete args.onClose;
			//delete args.afterLoaded;
			args.afterLoaded = function(result){
				///DialogPanel 自己 loadModuleMeta，而不是创建一个 Module 作为 child，故不需要额外处理（关联） submit、cancel
				var cc = 1;
				/*if(_hookAfterSubmit){
					d.own(rias.before(d, "afterSubmit", function(){
						if (rias.isFunction(_hookAfterSubmit)) {
							return _hookAfterSubmit.apply(d, arguments || []);
						}
					}, true));
				}
				if(_afterSubmit){
					d.own(rias.after(d, "afterSubmit", function(){
						if (rias.isFunction(_afterSubmit)) {
							return _afterSubmit.apply(d, arguments || []);
						}
					}, true));
				}
				if(_onSubmit){
					d.own(rias.after(d, "onSubmit", function(){
						if (rias.isFunction(_onSubmit)) {
							return _onSubmit.apply(d, arguments || []);
						}
					}, true));
				}
				if(_onCancel){
					d.own(rias.after(d, "onCancel", function(){
						if (rias.isFunction(_onCancel)) {
							return _onCancel.apply(d, arguments || []);
						}
					}, true));
				}*/
				d.own(rias.after(d, "onClose", function(){
					///TODO:zensst.关于 级联 close 的处理，在需要联动的 child 的 onParent 时向 parent 中注册 child 的 onClose
					if(args.parent && d.__parentCanClose){
						args.parent.canClose = d.__parentCanClose;
					}
					if (cc && rias.isFunction(_onClose)) {
						cc = rias.hitch(d, _onClose)();
					}
					//console.info("cc:", cc);
					return cc;
				}, true));
				/// d 有可能是 content，没有 moduleMeta
				d.inheritedMeta(arguments);

				if (rias.isFunction(_afterLoaded)) {
					rias.hitch(d, _afterLoaded)(result);
				}

			};
			//args.loadMetaOnStartup = true;
			args.initPlaceToArgs = rias.mixin({
				popupParent: args.popupParent,
				parent: args.parent,
				around: args.around ? args.around : args.x && args.y ? {x: args.x, y: args.y} : undefined,
				positions: args.positions,
				maxHeight: args.maxHeight,
				padding: args.padding
			}, args.initPlaceToArgs);
			delete args.popupParent;
			delete args.parent;
			delete args.around;
			delete args.positions;
			delete args.maxHeight;
			delete args.padding;
			delete args.x;
			delete args.y;
			var d;
			try{
				if(args._riaswIdOfModule){
					if(d = rias.ownerModuleBy(args.ownerRiasw)[args._riaswIdOfModule]){
						if(!args.reCreate && rias.isInstanceOf(d, DialogPanel)){
							d.focus();
						}else{
							rias.error("已经存在[" + args.ownerRiasw.id + "." + args._riaswIdOfModule + "]", args.initPlaceToArgs.around, args.initPlaceToArgs.popupParent);
						}
						return d;
					}
				}
				d = rias.createRiasw(DialogPanel, args);
				//d._needPosition = !rias.dom.placeAt(d, d.initPlaceToArgs) || !rias.dom.visible(d);/// self 不可见时，placeAt 定位不正确。
				d.startup();
			}catch(e){
				rias.error(e.message, args.initPlaceToArgs.around, args.initPlaceToArgs.popupParent);
			}
			return d;
		}

		///args.dialogType: 0 = win, 1 = modal, 2 = top, 3 = tip.
		function _doShowDlg(args){
			var w = rias.by(args.id)
				|| (args._riaswIdOfModule && rias.isRiaswModule(args._riasrModule) ? args._riasrModule[args._riaswIdOfModule] : undefined);
			/*if(rias.isRiasw(w)){///改在 _showDialog 中检查
				if(rias.isInstanceOf(w, DialogPanel)){
					//return _showWinFunc(w, args);
					//w.show();
					w.focus();
					return w;
				}
			}*/
			if(args.around && (args.dialogType >= 3 || rias.contains(args.dialogType, "tip"))){
				//return _showTooltipDlg(args);
				return _showDialog(args);
			}else{
				return _showDialog(args);
			}
		}
		function _toShowArgs(args, around, popupParent, dialogType, contentType, caption, closeDelay, actionBar) {
			var _args;
			if(rias.isString(args)){
				_args = {
					content: args
				};
			}else{
				_args = rias.mixin({}, args);///因为有可能 content 中有实例，最好不用 mixinDeep，防止递归循环
			}
			if(around){
				_args.around = around;
			}
			if(popupParent){
				_args.popupParent = popupParent;
			}
			if(rias.isString(_args.content)){
				_args.content = _args.content.replace(/\n/g, "<br/>");
			}
			_args.dialogType = (_args.dialogType != undefined /*&& _args.dialogType != null*/ ? _args.dialogType : dialogType);
			_args.contentType = (_args.contentType != undefined ? _args.contentType : contentType);
			_args.restrictPadding = (_args.restrictPadding >= 0 ? _args.restrictPadding : rias.dom.defaultRestrict);
			if(!_args.caption){
				_args.caption = caption || rias.i18n.action.message;
			}
			if(rias.isBoolean(closeDelay) || rias.isNumber(closeDelay)){
				_args.closeDelay = closeDelay;
			}
			if(!_args.closeDelay && !_args.actionBar){
				_args.actionBar = actionBar;
			}
			return _args;
		}
		rias.show = function(args, around, popupParent) {
			if(!rias.isObjectSimple(args)){
				console.error("The rias.select\'s parameter type must be Object.", args);
				//throw s;
			}
			return _doShowDlg(_toShowArgs(args, around, popupParent));
		};
		rias.message = function(args, around, popupParent) {
			return _doShowDlg(_toShowArgs(args, around, popupParent, "tip", 1, rias.i18n.action.message, undefined, ["btnOk"]));
		};
		rias.warn = function(args, around, popupParent) {
			return _doShowDlg(_toShowArgs(args, around, popupParent, "modal", 2, rias.i18n.action.warn, undefined, ["btnOk"]));
		};
		rias.error = function(args, around, popupParent) {
			return _doShowDlg(_toShowArgs(args, around, popupParent, "modal", 3, rias.i18n.action.error, undefined, ["btnOk"]));
		};
		rias.choose = function(args, around, popupParent) {
			return _doShowDlg(_toShowArgs(args, around, popupParent, "modal", 1, rias.i18n.action.choose, 0, ["btnYes", "btnNo"]));
		};
		//rias.wait = function(args) {
		//	return _doShowDlg(_toShowArgs(args, "modal", 1, rias.i18n.action.choose, 0, ["btnYes", "btnNo"]));
		//};
		rias.input = function(args, around, popupParent){
			var _args;
			if(rias.isString(args) || rias.isNumber(args)){
				_args = {
					value: args
				};
			}else{
				_args = rias.mixin({}, args);///因为有可能 content 中有实例，最好不用 mixinDeep，防止递归循环
			}
			_args.moduleMeta = "rias/riasw/module/input";
			//_args.value = _args.value;
			//_args.actionBar = _args.actionBar || [
			//	"btnOk",
			//	"btnCancel"
			//];
			_args.actionBarPosition = (_args.actionBarPosition != undefined ? _args.actionBarPosition : "bottom");
			return _doShowDlg(_toShowArgs(_args, around, popupParent, "modal", 0, rias.i18n.action.choose, 0, ["btnOk", "btnCancel"]));
		};
		rias.getSelectTreeModeInt = function(mode){
			if(rias.isString(mode)){
				if(mode === "leaf"){
					mode = 1;
				}else if(mode === "branch"){
					mode = 2;
				}else{
					mode = 0;
				}
			}
			if(mode >= 0 && mode < 3){
				return mode;
			}
			return 0;
		};
		rias.select = function(args, around, popupParent){
			var _args;
			if(!rias.isObjectSimple(args)){
				console.error("The rias.select\'s parameter type must be Object.", args);
				//throw _args;
			}
			_args = rias.mixin({}, args);///因为有可能 content 中有实例，最好不用 mixinDeep，防止递归循环
			//_args.actionBar = _args.actionBar || [
			//	"btnOk",
			//	"btnCancel"
			//];
			_args.actionBarPosition = (_args.actionBarPosition != undefined ? _args.actionBarPosition : "bottom");
			return _doShowDlg(_toShowArgs(_args, around, popupParent, "modal", 0, rias.i18n.action.choose, 0, ["btnOk", "btnCancel"]));
		};
		rias.showAbout = function(around) {
			var formHTML = "<div class='about_container'>";
			formHTML += "<div class='about_owner'>"
				+ rias.substitute(rias.i18n.studio.owner, [rias.webApp ? rias.webApp.appOwner : rias.studioOwner]) + "</div>";
			formHTML += "<div class='about_user'>"
				+ rias.substitute(rias.i18n.studio.user, [rias.webApp ? rias.webApp.appUser : rias.studioUser]) + "</div>";
			var homeLink = (rias.webApp ? rias.webApp.appHome : rias.studioHome);
			homeLink = "<a href='" + homeLink + "' target='_blank'>" + homeLink + "</a>";
			formHTML += "<div class='about_home'>"
				+ rias.substitute(rias.i18n.studio.home, [homeLink]) + "</div>";
			formHTML += "<div class='about_version'>"
				+ rias.substitute(rias.i18n.studio.version, [rias.webApp ? rias.webApp.appVersion : rias.studioVersion]) + "</div>";
			formHTML += "<div class='about_date'>"
				+ rias.substitute(rias.i18n.studio.buildDate, [rias.formatDatetime(rias.webApp ? rias.webApp.appBuildtime : rias.studioBuildtime, "")]) + "</div>";
			//var revisionLink = "<a href='" + rias.studioHome + "' target='_blank'>" + rias.studioVersion  + "</a>";
			//formHTML += "<div class='about_build'>" + rias.substitute(rias.i18n.studio.build, [revisionLink]) + "</div>";
			formHTML += "</div>";
			//return rias.message({
			//	content: formHTML
			//});
			return rias.message({
				_riaswIdOfModule: "about",
				dialogType: "modal",
				//dialogType: "tip",
				around: around,
				ownerRiasw: rias.webApp,
				resizable: false,
				caption: (rias.webApp ? rias.webApp.appTitle : rias.i18n.studio.about),
				contentType: -1,
				content: formHTML
			});
		};

		rias.riasd = {};
		rias.has.add("rias-riasd", 0);
		rias.riasd.ServerAddr = rias.has("rias-riasd-serverAddr");
		if(!rias.isString(rias.riasd.ServerAddr)){
			rias.riasd.ServerAddr = "http://www.riaeasy.com:8081/";
		}else if(rias.riasd.ServerAddr === "local"){
			rias.riasd.ServerAddr = "";
		}
		rias.riasd.getRiasdUrl = function(url){///不用 toUrl 这个名字，避免混淆，因为 toUrl 检测了 cacheBust
			url += "";
			var p = url.lastIndexOf("/"),
				n;
			if (p > -1) {
				n = url.substring(p + 1);
			} else {
				n = url;
			}
			p = n.lastIndexOf(".");
			if (p > -1) {
				n = n.substring(p + 1);
			} else {
				n = "";
			}
			if(rias.riasd.ServerAddr){
				///应该由服务器处理转发
				/*if (n){
					url = rias.toUrl(rias.riasd.ServerAddr + rias.toUrl(url, dojo));
				}else{
					url = rias.toUrl(rias.riasd.ServerAddr + rias.toUrl(url + ".js", dojo));
				}*/
				if (n){
					url = rias.riasd.ServerAddr + url;
				}else{
					url = rias.riasd.ServerAddr + url + ".js";
				}
			}
			return url;
		};
		if(rias.has("rias-riasd") && !(rias.has("ie") < 9)){
			rias.initRiasd = function(){
				var d = rias.newDeferred("initRiasd", rias.defaultDeferredTimeout << 1, function(){
					this.cancel();
				});
				try{
					rias.require([
						rias.riasd.getRiasdUrl("rias/riasd/riaswMappers")
					], function(riaswMappers){
						if(riaswMappers == "not-a-module"){
							rias.has.add("rias-riasd", 0, 0, 1);
							d.reject(false);
						}else{
							rias.registerRiaswMappers(1, riaswMappers);
							rias.require([
								"dojo/i18n!" + rias.riasd.getRiasdUrl("rias/riasd/nls/riasdi18n")
							], function(riasdi18n){
								rias.i18n.riasd = riasdi18n;
								rias.theme.loadCss([
									rias.riasd.getRiasdUrl("rias/riasd/resources/riasd.css")
								]);
								if(!rias.webApp.launchRiasd){
									rias.webApp.launchRiasd = function(modulename){//moduleMeta, _riaswIdOfModule, caption, moduleParams, reCreate, id
										var cs = modulename.split("/"),
											l = cs.length,
											ts = "";
										if(l > 0){
											for(i = 0, --l; i < l; i++){
												ts = ts + cs[i] + "/";
											}
											//if(ts){
											//	ts = '<span style="color:blue">' + ts + '</span>';
											//}
											ts = "<span style='font-weight:bold;color:darkgray;vertical-align:initial;'>" + ts
												+ "</span><span style='font-weight:bold;color:chocolate;vertical-align:initial;'>" + cs[l] + "</span>";
										}
										var args = {
											isRiasd: true,
											moduleMeta: rias.riasd.getRiasdUrl("rias/riasd/module/visualEditor"),
											_riaswIdOfModule: "ve_" + modulename.replace(/\//g, "_").replace(/\./g, "_").replace(/^appModule_/, ""),
											caption: ts,
											moduleParams: {
												_riasdModulename: modulename
											},
											//reCreate: false,
											id: "ve_" + modulename.replace(/\//g, "_").replace(/\./g, "_").replace(/^appModule_/, ""),
											iconClass: "riasdIcon"
										};
										return rias.webApp.launch(args);
									};
								}
								if(!rias.webApp.launchRiasdFileSelector){
									rias.webApp.launchRiasdFileSelector = function(params){
										return rias.webApp.launch(rias.mixinDeep({
											requireLogged: false,
											"_riaswType": "rias.riasw.layout.DialogPanel",
											dialogType: "top",
											caption: rias.i18n.riasd.visualEditor,//"资源管理器",
											tooltip: rias.i18n.riasd.visualEditor + '<br/>IE11及以下版本只能使用部分功能',
											iconClass: "outlineIcon",
											closable: false,
											maxable: false,
											style: {
												width: "30em",
												height: "80em",
												"padding": "0px"
											},
											moduleMeta: {
												$refScript: "return rias.riasd.getRiasdUrl('rias/riasd/module/fileSelector');"
											},
											afterSubmit: function(moduleResult){
												var m = this,
													mn;
												if(!moduleResult){
													//请选择一个条目
													return false;
												}else if(moduleResult.itemType === "file"){
													mn = moduleResult.pathname.replace(/\.js$/gi, "").replace(/\.rsf$/gi, "").replace(/\./gi, "/");
													rias.undef(mn);
													///先获取文件锁，然后再打开
													//rias.xhr.post({
													//
													//});
													//m.canToggle = false;
													return rias.webApp.launchRiasd(mn).then(function(){
														//m.canToggle = true;
													});
												}
											}
										}, params));
									};
								}
								d.resolve(rias.riasd);
							});
						}
					});
				}catch(e){
					rias.has.add("rias-riasd", 0, 0, 1);
					d.resolve(false);
				}
				return d.promise;
			};
		}else{
			rias.initRiasd = function(){
				var d = rias.newDeferred();
				d.resolve(false);
				return d.promise;
			}
		}

	});

	return rias;

});
