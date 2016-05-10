
//RIAStudio Client Runtime(rias) in Browser.

define([
	"rias/riasw/riasw",
	"dojo/i18n!rias/nls/riasi18n",
	"rias/riasw/fx",
	"rias/riasw/xhr",
	"rias/riasw/theme"
], function(rias, riasi18n) {

///studio******************************************************************************///

	rias.i18n.studio = rias.delegate(riasi18n.studio);
	rias.i18n.action = rias.delegate(riasi18n.action);
	rias.i18n.message = rias.delegate(riasi18n.message);
	rias.studioHome = "http://www.riaeasy.com:8081/";
	rias.studioVersion = {
		major: 0, minor: 8, patch: 0, flag: "",
		revision: 0.80,
		toString: function(){
			var v = dojo.version;
			return this.major + "." + this.minor + "." + this.patch + this.flag + " (" + this.revision + ")" +
				" (dojo:" + v.major + "." + v.minor + "." + v.patch + v.flag + " (" + v.revision + "))";
		}
	};
	rias.studioBuildtime = "";
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
	rias.createWebApp = function(params, refNode){
		var d = rias.newDeferred();
		rias.require([
			"rias/riasw/studio/App",
			"rias/riasw/studio/Module",
			"rias/riasw/studio/DefaultError"
		], function(App){
			rias.webApp = rias.createRiasw(App, params, refNode || rias.dom.docBody);
			rias.ready(1000, function(){
				if(rias.has("ie") < 11){
					rias.message({
						dialogType: "modal",
						content: "为了得到更好的效果，请使用 ie11+ 或者 chrome/firefox 内核的浏览器。"
					});
				}
				d.resolve(rias.webApp);
			});
		});
		return d.promise;
	};

	//if(!rias.require.packs.gridx){
	//	rias.require.packs.gridx = {name: "gridx", location: "../../gridx-1.3.7"};
	//}
	if(!rias.require.packs.dgrid){
		rias.require.packs.dgrid = {name: "dgrid", location: "../../dgrid-1.0.0"};
	}
	if(!rias.require.packs.dstore){
		rias.require.packs.dstore = {name: "dstore", location: "../../dstore-1.1.1"};
	}

	if(!rias.require.packs.orion){
		rias.require.packs.orion = {name: "orion", location: "../../orion-7.0/orion"};
		rias.require.packs.webtools = {name: "webtools", location: "../../orion-7.0/webtools"};
		rias.require.packs.javascript = {name: "javascript", location: "../../orion-7.0/javascript"};
		rias.require.packs.csslint = {name: "csslint", location: "../../orion-7.0/csslint", main: "csslint"};
		rias.require.packs.i18n = {name: "i18n", location: "../../orion-7.0/orion", main: "i18n"};
	}

	///需要延迟加载
	rias.require([
		"dijit/_WidgetBase",
		"dijit/popup",
		"rias/riasw/widget/Tooltip",
		"rias/riasw/layout/DialogPanel",
		"rias/riasw/form/Button"
	], function(_WidgetBase, popup, Tooltip, DialogPanel, Button){
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
						showDelay: 2000,
						hideDelay: 200
					})),
					delegatedEvent = function(eventType){
						return eventType;
					},
					node;
				tooltip = tooltip + "";
				self._set("tooltip", tooltip);
				if(self.focusNode && self.id){
					if(!(node = rias.dom.byId(self.focusNode, self.ownerDocument))){
						return;
					}
					///先 remove()，避免多次 on 而没有 remove()
					t.removeTarget(self.focusNode);
					//delete self.focusNode._riasrTooltip;
					///node 可能没有 id，采用 self.id
					rias.forEach(t.__h[self.id], function(h){
						rias.forEach(h, function(_h){
							_h.remove();
						})
					});
					if(tooltip){
						if(self.textDir && self.enforceTextDirWithUcc){///即 dojo.has("dojo-bidi")
							tooltip = self.enforceTextDirWithUcc(null, tooltip);
						}
						//self.focusNode._riasrTooltip = tooltip;
						t.addTarget(self.focusNode);
						/*t.__h[self.id] = t.own(
							///用 self(dijit) 而不是 node，可以在 disabled 的情况下也能响应.
							//rias.on(node, delegatedEvent(rias.mouse.enter), function(evt){
							rias.on(self, delegatedEvent(rias.mouse.enter), function(evt){
								t.domNode.innerHTML = tooltip;
								t._onHover(node);
							}),
							rias.on(self, delegatedEvent("focusin"), function(evt){
								t.domNode.innerHTML = tooltip;
								t._onHover(node);
							}),
							rias.on(self, "mouseout", rias.hitch(t, "_onUnHover")),
							rias.on(self, "focusout", rias.hitch(t, "set", "state", "DORMANT")),
							rias.before(self, "destroy", rias.hitch(t, "set", "state", "DORMANT"))
						);*/
					}
				}
			}
		});
		rias.popup = popup;
		rias.openPopup = rias.hitch(popup, popup.open);//function(/*__OpenArgs*/ args)
		rias.closePopup = rias.hitch(popup, popup.close);//function(/*Widget?*/ popup)
		rias.getTopPopup = rias.hitch(popup, popup.getTopPopup);//function()
		//rias.moveOffScreen = rias.hitch(popup, popup.moveOffScreen);//function(/*Widget*/ widget)///内部调用

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
		//	autoClose: true,
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
			delete args._riasrHookAfterSubmit;
			delete args.afterSubmit;
			delete args.onSubmit;
			delete args.onCancel;
			delete args.onClose;
			delete args.afterLoaded;
			args.afterLoaded = function(result){
				///DialogPanel 自己 loadModuleMeta，而不是创建一个 Module 作为 child，故不需要额外处理（关联） submit、cancel
				var cc = 1;
				if(_hookAfterSubmit){
					d.own(rias.before(d, "afterSubmit", function(){
						if (rias.isFunction(_hookAfterSubmit)) {
							return _hookAfterSubmit.apply(d, arguments);
						}
					}, true));
				}
				if(_afterSubmit){
					d.own(rias.after(d, "afterSubmit", function(){
						if (rias.isFunction(_afterSubmit)) {
							return _afterSubmit.apply(d, arguments);
						}
					}, true));
				}
				if(_onSubmit){
					d.own(rias.after(d, "onSubmit", function(){
						if (rias.isFunction(_onSubmit)) {
							return _onSubmit.apply(d, arguments);
						}
					}, true));
				}
				if(_onCancel){
					d.own(rias.after(d, "onCancel", function(){
						if (rias.isFunction(_onCancel)) {
							return _onCancel.apply(d, arguments);
						}
					}, true));
				}
				d.own(rias.after(d, "onClose", function(){
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
				if(d._riaswModuleMeta && rias.isFunction(d._riaswModuleMeta.afterLoaded)){
					rias.hitch(d, d._riaswModuleMeta.afterLoaded)(result);
				}

				if (rias.isFunction(_afterLoaded)) {
					rias.hitch(d, _afterLoaded)(result);
				}

			};
			//args.loadOnStartup = false;
			args.initPlaceToArgs = {
				parent: args.parent,
				around: args.around ? args.around : args.x && args.y ? {x: args.x, y: args.y} : undefined,
				positions: args.positions,
				maxHeight: args.maxHeight,
				padding: args.padding
			};
			delete args.parent;
			delete args.around;
			delete args.positions;
			delete args.maxHeight;
			delete args.padding;
			delete args.x;
			delete args.y;
			var d = rias.createRiasw(DialogPanel, args);
			//d._needPosition = !rias.dom.positionAt(d, d.initPlaceToArgs) || !rias.dom.visible(d);/// self 不可见时，positionAt 定位不正确。
			d.startup();
			return d;
		}

		///args.dialogType: 0 = win, 1 = modal, 2 = top, 3 = tip.
		function _doShowDlg(args){
			var w = rias.by(args.id)
				|| (args._riaswIdOfModule && rias.isRiaswModule(args._riasrModule) ? args._riasrModule[args._riaswIdOfModule] : undefined);
			if(rias.isRiasw(w)){
				if(rias.isInstanceOf(w, DialogPanel)){
					//return _showWinFunc(w, args);
					//w.show();
					w.focus();
					return w;
				}
			}
			if(args.around && (args.dialogType >= 3 || rias.indexOf(args.dialogType, "tip") >= 0)){
				//return _showTooltipDlg(args);
				return _showDialog(args);
			}else{
				return _showDialog(args);
			}
		}
		function _toShowArgs(args, dialogType, contentType, caption, autoClose, actionBar) {
			var _args;
			if(rias.isString(args)){
				_args = {
					content: args
				};
			}else{
				_args = rias.mixin({}, args);///因为有可能 content 中有实例，最好不用 mixinDeep，防止递归循环
			}
			if(rias.isString(_args.content)){
				_args.content = _args.content.replace(/\n/g, "<br/>");
			}
			_args.dialogType = (_args.dialogType != undefined /*&& _args.dialogType != null*/ ? _args.dialogType : dialogType);
			_args.contentType = (_args.contentType != undefined ? _args.contentType : contentType);
			_args.restrictPadding = (_args.restrictPadding >= 0 ? _args.restrictPadding : 12);
			if(!_args.caption){
				_args.caption = caption || rias.i18n.action.message;
			}
			if(rias.isBoolean(autoClose) || rias.isNumber(autoClose)){
				_args.autoClose = autoClose;
			}
			if(!_args.autoClose && !_args.actionBar){
				_args.actionBar = actionBar;
			}
			return _args;
		}
		rias.show = function(args) {
			return _doShowDlg(_toShowArgs(args));
		};
		rias.message = function(args) {
			return _doShowDlg(_toShowArgs(args, "tip", 1, rias.i18n.action.message, undefined, ["btnOk"]));
		};
		rias.warn = function(args) {
			return _doShowDlg(_toShowArgs(args, "modal", 2, rias.i18n.action.warn, undefined, ["btnOk"]));
		};
		rias.error = function(args) {
			return _doShowDlg(_toShowArgs(args, "modal", 3, rias.i18n.action.error, undefined, ["btnOk"]));
		};
		rias.choose = function(args) {
			return _doShowDlg(_toShowArgs(args, "modal", 1, rias.i18n.action.choose, 0, ["btnYes", "btnNo"]));
		};
		//rias.wait = function(args) {
		//	return _doShowDlg(_toShowArgs(args, "modal", 1, rias.i18n.action.choose, 0, ["btnYes", "btnNo"]));
		//};
		rias.input = function(args){
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
			return _doShowDlg(_toShowArgs(_args, "modal", 0, rias.i18n.action.choose, 0, ["btnOk", "btnCancel"]));
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
		rias.select = function(args){
			var _args;
			_args = rias.mixin({}, args);///因为有可能 content 中有实例，最好不用 mixinDeep，防止递归循环
			//_args.actionBar = _args.actionBar || [
			//	"btnOk",
			//	"btnCancel"
			//];
			_args.actionBarPosition = (_args.actionBarPosition != undefined ? _args.actionBarPosition : "bottom");
			return _doShowDlg(_toShowArgs(_args, "modal", 0, rias.i18n.action.choose, 0, ["btnOk", "btnCancel"]));
		};
		rias.showAbout = function(around) {
			var homeLink = "<a href='" + rias.studioHome + "' target='_blank'>" + rias.studioHome + "</a>";
			var formHTML = "<div class='about_container'>";
			if(rias.webApp){
				formHTML += "<div class='about_owner'>" + rias.substitute(rias.i18n.studio.owner, [rias.webApp.appOwner]) + "</div>";
				formHTML += "<div class='about_user'>" + rias.substitute(rias.i18n.studio.user, [rias.webApp.appUser]) + "</div>";
			}
			formHTML += "<div class='about_home'>" + rias.substitute(rias.i18n.studio.home, [homeLink]) + "</div>";
			formHTML += "<div class='about_version'>" + rias.substitute(rias.i18n.studio.version, [rias.studioVersion]) + "</div>";
			var bd = rias.studioBuildtime;
			var date = rias.dateStamp.fromISOString(bd);
			if (date) {
				bd = rias.dateLocale.format(date, {
					formatLength : "medium"
				});
			}
			if (bd) {
				formHTML += "<div class='about_date'>" + rias.substitute(rias.i18n.studio.buildDate, [ bd ]) + "</div>";
			}
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
				autoClose: 0,
				caption: (rias.webApp ? rias.webApp.appTitle : rias.i18n.studio.about),
				contentType: -1,
				content: formHTML
			});
		};

		rias.has.add("rias-riasd", 0);
		rias.has.add("rias-riasd-local", 0);
		rias.riasdUrlBase = (rias.has("rias-riasd-local") ? "" : "http://www.riaeasy.com:8081/");
		rias.getRiasdUrl = function(url){///不用 toUrl 这个名字，避免混淆，因为 toUrl 检测了 cacheBust
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
			if(rias.riasdUrlBase){
				if (n){
					url = rias.xhr.toUrl(rias.riasdUrlBase + rias.toUrl(url, dojo));
				}else{
					url = rias.xhr.toUrl(rias.riasdUrlBase + rias.toUrl(url + ".js", dojo));
				}
			}
			return url;
		};
		if(rias.has("rias-riasd")){
			rias.initRiasd = function(){
				var d = rias.newDeferred();
				try{
					rias.require([
						rias.getRiasdUrl("rias/riasd/riaswMappers")
					], function(riaswMappers){
						if(riaswMappers == "not-a-module"){
							rias.has.add("rias-riasd", 0, 0, 1);
							d.reject(rias.riasd);
						}else{
							rias.registerRiaswMappers(1, riaswMappers);
							rias.require([
								"dojo/i18n!" + rias.getRiasdUrl("rias/riasd/nls/riasdi18n")
							], function(riasdi18n){
								rias.i18n.riasd = riasdi18n;
								rias.riasd = {
									loadRiasdCss: function(url, callback) {
										var links = rias.dom.query("link");

										var csses = rias.isArray(url) ? url : url ? [url] : [];//url.split(",");
										rias.forEach(csses, function(css){
											css = rias.xhr.toUrl(css);
											if (links.some(function(val) {
												return val.getAttribute("href") === css;
											})) {
												// don't add if stylesheet is already loaded in the page
												return;
											}

											var newLink = rias.dom.create("link", {
												rel: "stylesheet",
												type: "text/css",
												href: css
											});
											// Make sure app.css is the after library CSS files, and content.css is after app.css
											// FIXME: Shouldn't hardcode this sort of thing
											var headElem = rias.dom.heads[0],
												isAppCss = css.indexOf(rias.theme.appCss) > -1,
												isRiasdCss = css.indexOf("riasd.css") > -1,
												appCssLink, riasdCssLink;
											rias.forEach(links, function(link) {
												if(link.href.indexOf(rias.theme.appCss) > -1){
													appCssLink = link;
												}
												if(link.href.indexOf("riasd.css") > -1){
													riasdCssLink = link;
												}
											});
											if(isAppCss){
												rias.dom.place(newLink, headElem, "", callback);
											}else if(!appCssLink){
												if(!riasdCssLink){
													rias.dom.place(newLink, headElem, "", callback);
												}else{
													rias.dom.place(newLink, riasdCssLink, "before", callback);
												}
											}else{
												if(!riasdCssLink){
													rias.dom.place(newLink, appCssLink, "before", callback);
												}else{
													rias.dom.place(newLink, riasdCssLink, "before", callback);
												}
											}
										});
									}
								};
								//rias.theme.loadTheme(rias.theme.currentTheme || "rias", rias.theme.currentTheme || "rias", "", "ios7");
								rias.riasd.loadRiasdCss([
									rias.getRiasdUrl("rias/riasd/resources/riasd.css")
								]);
								if(!rias.webApp.launchRiasd){
									rias.webApp.launchRiasd = function(modulename){//moduleMeta, _riaswIdOfModule, caption, moduleParams, reCreate, id
										return rias.webApp.launch({
											isRiasd: true,
											moduleMeta: rias.getRiasdUrl("rias/riasd/module/visualEditor"),
											_riaswIdOfModule: "ve_" + modulename.replace(/\//g, "_").replace(/\./g, "_").replace(/^appModule_/, ""),
											caption: modulename,
											moduleParams: {
												_riasdModulename: modulename
											},
											//reCreate: false,
											id: "ve_" + modulename.replace(/\//g, "_").replace(/\./g, "_").replace(/^appModule_/, ""),
											iconClass: "riasdIcon"
										});
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
											//autoClose: 0,
											closable: false,
											maxable: false,
											style: {
												width: "30em",
												height: "80em",
												"padding": "0px"
											},
											moduleMeta: {
												$refScript: "return rias.getRiasdUrl('rias/riasd/module/fileSelector');"
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
										}, params));
									};
								}
								d.resolve(rias.riasd);
							});
						}
					});
				}catch(e){
					rias.has.add("rias-riasd", 0, 0, 1);
					d.reject(rias.riasd);
				}
				return d.promise;
			};
		}else{
			rias.initRiasd = function(){
				return false;
			}
		}

	});

	return rias;

});
