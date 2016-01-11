
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
		major: 1, minor: 0, patch: 0, flag: "",
		revision: 1.0,
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

	if(!rias.require.packs.gridx){
		rias.require.packs.gridx = {name: 'gridx', location: '../gridx'};
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
				if(self.focusNode){
					if(!(node = rias.dom.byId(self.focusNode, self.ownerDocument))){
						return;
					}
					///先 remove()，避免多次 on 而没有 remove()
					//t.removeTarget(self.focusNode);
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
						//t.addTarget(self.focusNode);
						t.__h[self.id] = t.own(
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
							rias.after(self, "destroy", rias.hitch(t, "set", "state", "DORMANT"))
						);
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
		//	orient: ["below-centered", "above-centered", "after-centered", "before-centered"],//rias.tooltipPosition
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
		//	dockTo: rias.webApp.mainDock,
		//	initState: 0,
		//	showOnStartup: false,
		//	cookieName: "",
		//	persist: false,
		//};
		function _showDialog(args) {
			var //_onShow = args.onShow,
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
						rias.webApp || rias.body(rias.doc));
			//args.id = args.id;
			//args.caption = args.caption;
			//args.moduleMeta = args.moduleMeta;
			//args.href = args.href;
			//args.content = args.content;
			//args.dialogType = args.dialogType;
			args.closable = (args.closable != undefined ? args.closable : true);
			args.resizable = (args.resizable != undefined ? args.resizable : "xy");
			args.maxable = (args.maxable != undefined ? args.maxable : false);
			//args.dockTo = (args.dockTo != undefined ? args.dockTo : undefined);
			args.cookieName = (args.cookieName != undefined ? args.cookieName : "");
			args.persist = (args.persist != undefined ? args.persist : 0);
			args.contentType = (args.contentType != undefined ? args.contentType : "none");
			//delete args.onShow;
			delete args.onClose;
			delete args.afterLoaded;
			args.afterLoaded = function(result){
				var cc = 1;
				/*d.own(rias.after(d, "onShow", function(){
					//if(d._isShown() && d._isVisible()){
					//	d.bringToTop(d);
					//	if(!d.isTip()){
					//		d.focus();
					//	}
					//}
					if (rias.isFunction(_onShow)) {
						rias.hitch(d, _onShow)();
					}
				}, true));*/
				d.own(rias.after(d, "onClose", function(mr){
					mr = (mr == undefined /*|| mr == null*/ ? d.modalResult : mr);
					if(args.parent && d.__parentCanClose){
						args.parent._canClose = d.__parentCanClose;
					}
					if (cc && rias.isFunction(_onClose)) {
						cc = rias.hitch(d, _onClose)(mr);
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
			args.placeToArgs = {
				parent: args.parent,
				around: args.around ? args.around : args.x && args.y ? {x: args.x, y: args.y} : undefined,
				orient: args.orient,
				maxHeight: args.maxHeight,
				padding: args.padding
			};
			delete args.around;
			delete args.orient;
			delete args.maxHeight;
			delete args.padding;
			delete args.x;
			delete args.y;
			var d = rias.createRiasw(DialogPanel, args);
			d.startup();
			//rias.dom.placeTo(d, args.placeToArgs);
			return d;
		}

		///args.dialogType: 0 = win, 1 = modal, 2 = top, 3 = tip.
		function _doShowDlg(args){
			var w = rias.by(args.id)
				|| (args._riaswIdOfModule && rias.isRiaswModule(args._riasrModule) ? args._riasrModule[args._riaswIdOfModule] : undefined);
			if(rias.isRiasw(w)){
				if(rias.isInstanceOf(w, DialogPanel)){
					//return _showWinFunc(w, args);
					w.show();
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
				_args.caption = caption || rias.i18n.action.info;
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
		rias.info = function(args) {
			return _doShowDlg(_toShowArgs(args, "tip", 1, rias.i18n.action.info, undefined, ["btnOk"]));
		};
		rias.warn = function(args) {
			return _doShowDlg(_toShowArgs(args, "modal", 2, rias.i18n.action.warn, undefined, ["btnOk"]));
		};
		rias.error = function(args) {
			return _doShowDlg(_toShowArgs(args, "modal", 3, rias.i18n.action.error, undefined, ["btnOk"]));
		};
		rias.choice = function(args) {
			return _doShowDlg(_toShowArgs(args, "modal", 1, rias.i18n.action.choice, 0, ["btnYes", "btnNo"]));
		};
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
			return _doShowDlg(_toShowArgs(_args, "modal", 0, rias.i18n.action.input, 0));
		};
		/*rias.treeSelector = function(args){
			var _args;
			if(rias.isString(args) || rias.isNumber(args)){
				_args = {
					value: args,
					rootId: "rootId",
					rootLabel: "rootLabel",
					query: {},
					target: "",
					idAttribute: "id",
					labelAttribute: "label"//,
					//callDele: dumpFunc,
					//callAddChild: dumpFunc,
					//callModi: dumpFunc,
				};
			}else{
				_args = rias.mixin({}, args);///因为有可能 content 中有实例，最好不用 mixinDeep，防止递归循环
			}
			_args.dialogType = (_args.dialogType !== undefined && _args.dialogType !== null ? _args.dialogType : "modal");
			_args.moduleMeta = {
				moduleMeta: "rias/riasw/studio/treeSelector",
				value: _args.value,
				rootId: _args.rootId,
				rootLabel: _args.rootLabel,
				query: _args.query,
				target: _args.target,
				idAttribute: _args.idAttribute,
				labelAttribute: _args.labelAttribute,
				callDele: _args.callDele,
				callAddChild: _args.callAddChild,
				callModi: _args.callModi
			};
			_args.actionBar = _args.actionBar || [
				"btnOk",
				"btnCancel"
			];
			return rias.show(_args);
		};*/
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
					formatLength : 'medium'
				});
			}
			if (bd) {
				formHTML += "<div class='about_date'>" + rias.substitute(rias.i18n.studio.buildDate, [ bd ]) + "</div>";
			}
			//var revisionLink = "<a href='" + rias.studioHome + "' target='_blank'>" + rias.studioVersion  + "</a>";
			//formHTML += "<div class='about_build'>" + rias.substitute(rias.i18n.studio.build, [revisionLink]) + "</div>";
			formHTML += "</div>";
			//return rias.info({
			//	content: formHTML
			//});
			return rias.info({
				dialogType: "modal",
				//dialogType: "tip",
				around: around,
				ownerRiasw: rias.webApp,
				//parent: rias.webApp || rias.body(rias.doc),
				resizable: false,
				autoClose: 0,
				caption: (rias.webApp ? rias.webApp.appTitle : rias.i18n.studio.about),
				contentType: -1,
				content: formHTML
			});
		};
	});

	return rias;

});
