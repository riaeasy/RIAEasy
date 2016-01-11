
define([
	"rias",
	"rias/riasw/layout/_PanelBase",
	"rias/riasw/studio/_ModuleMixin",
	"rias/riasw/studio/Loading"
], function(rias, _PanelBase, _ModuleMixin, Loading){

	var _riasWidgets = {};
	var riasType = "rias.riasw.studio.App";
	var Widget = rias.declare(riasType, [_PanelBase, _ModuleMixin],{

		baseClass: "webApp",
		//isLayoutContainer: true,

		animated: false,
		//moduleMeta 要参与 isRiaswModule() 判断，不能在 rias.riasw.studio._ModuleMixin 中初始化，可以在 rias.riasw.studio.Module 和 rias.riasw.studio.App 中初始化。
		moduleMeta: "",

		constructor: function(params){
			this.__riasrWidgetsCount = 0;
			this._riasWidgets = _riasWidgets;
		},
		postMixInProperties: function(){
			this.inherited(arguments);
			//this.id = 'rias.webApp';///建议不设 id，即 rias.webApp 不绑定 domNode，而直接是 riasWidget。
			//this.loadOnStartup = false;
		},
		buildRendering: function(){
			this.inherited(arguments);
			this.appClientHeight = this.domNode.clientHeight;
			this.appClientWidth = this.domNode.clientWidth;
			//rias.dom.addClass(this.domNode, "webApp");
			if(rias.hostMobile){
				rias.dom.addClass(this.domNode, "mobileBody");
			}
		},
		postCreate: function(){
			var self = this;
			self._onIsNative(self.isNative);
			//self._onLocation(self.ownerDocument.location || document.location);
			//self._onIsLocal(self.location.protocol == "file:");
			self.inherited(arguments);
		},
		destroy: function(){
			this.inherited(false);
		},
		startup: function(){
			var self = this;
			if(self._started){
				return;
			}
			self.own(rias.subscribe("_riaswPostCreate", function(params){
				if(params.widget){
					self.addWidget(params.widget);
				}
			}),rias.subscribe("_riaswOrphan", function(params){
				if(params.widget){
					self.removeWidget(params.widget);
				}
			}),rias.subscribe("_riaswDestroy", function(params){
				if(params.widget){
					self.destroyWidget(params.widget);
				}
			}));
			self.inherited(arguments);
		},

		_onIsNative: function(value, oldValue){
			this.isNative = !!value;
		},
		//_onLocation: function(value, oldValue){
		//	this.location = value + "";
		//},
		//_onIsLocal: function(value, oldValue){
		//	this.isLocal = !!value;
		//},

		_beforeFiler: function(meta){
			//this._setContent("");
			//if (rias.isFunction(this._riaswModuleMeta.beforeFiler)){
			//	rias.hitch(this, this._riaswModuleMeta.beforeFiler)(meta);
			//}
			if (rias.isFunction(this.beforeFiler)){
				this.beforeFiler(meta);
			}
		},
		_load: function(){
			var self = this,
				r = self._beforeLoad();
			if(r){
				///很重要！须在 ready 后再载入，以保证 dom 初始化正确。
				//ready(100, function())是dojo.parser.parse().
				//ready(1000, function())是缺省.
				//ready(500, function())是 App.
				rias.ready(500, function(){
					if(self._beingDestroyed){
						return false;
					}
					self.defer(function(){
						self._loadModuleMeta().then(function(result){
						});
					});
				});
			}
			return r;
		},
		_afterFiler: function(){
			var self = this;
			rias.doc.title = self.appTitle;
			//if(!rias.hostMobile){
				self.own(self._appLoading = rias.createRiasw(Loading, {
					//_riaswIdOfModule: "_appLoading",
					ownerRiasw: self
				}));
				self._appLoading.set("caption", rias.i18n.message.loading);
				self._appLoading.placeAt(self);
			//}
			self.inherited(arguments);
		},

		_setDefaultTimeoutAttr: function(timeout){
			rias.isNumber(timeout) && (timeout > 999) && (rias.xhr.defaultTimeout = timeout);
			this._set("defaultTimeout", rias.xhr.defaultTimeout);
		},
		_setCurrentThemeAttr: function(theme){
			if(rias.theme.currentTheme){
				rias.dom.removeClass(this.domNode, rias.theme.currentTheme);
			}
			rias.theme.currentTheme = theme + "";
			rias.dom.addClass(this.domNode, rias.theme.currentTheme);
		},
		_getCurrentThemeAttr: function(){
			return rias.theme.currentTheme;
		},

		addWidget: function(widget){
			if(!widget.id){
				widget.id = widget._riasrModule && widget._riaswIdOfModule ? (widget._riasrModule.id + "_" + widget._riaswIdOfModule) :
					rias.getUniqueId(this.id + "_" + rias._getUniqueCat(widget, true), this);
			}
			if(this._riasWidgets[widget.id]){
				throw new Error("Tried to register widget with id['" + widget.id + "'],\n but that id is already registered.");
			}
			this._riasWidgets[widget.id] = widget;
			this.__riasrWidgetsCount++;
		},
		//removeWidget: function(/*String|dijit*/id){
		//	if(!rias.isString(id)){
		//		if(!(id = id.id)){
		//			throw new Error("rias.riasw.studio.App.removeWidget: invalid id: " + id);
		//		}
		//	}
		//	if(this._riasWidgets[id]){
		//		delete this._riasWidgets[id];
		//		this.__riasrWidgetsCount--;
		//	}
		//},
		destroyWidget: function(/*String|dijit*/id){
			if(!rias.isString(id)){
				if(!(id = id.id)){
					throw new Error("rias.riasw.studio.App.destroyWidget: invalid id: " + id);
				}
			}
			if(this._riasWidgets[id]){
				///需要检查用什么方法释放
				rias.destroy(this._riasWidgets[id]);
				delete this._riasWidgets[id];
				this.__riasrWidgetsCount--;
			}
		},
		/*removeWidgets: function(id){
			if(rias.isString(id)){
				id = [id];
			}else if(id && rias.isString(id.id)){
				id = [id.id];
			}else if(!rias.isArray(id)){
				id = [];
			}
			var i = 0;
			for(; i < id.length - 1; i++){
				if(this._riasWidgets[id[i]]){
					delete this._riasWidgets[id[i]];
					this.__riasrWidgetsCount--;
				}
			}
		},*/
		/*destroyModuleChildren: function(module){
			var id;
			for(id in this._riasWidgets){
				if(this._riasWidgets.hasOwnProperty(id)){
					if(this._riasWidgets[id]._riasrModule == module){
						this.destroyWidget(id);
					}
				}
			}
		},*/
		byId: function(/*String|Widget*/ id){
			return typeof id == "string" ? this._riasWidgets[id] : undefined;
		},
		//by: function(/*String|DOMNode|Dijit|riasWidget*/any){
		//	return typeof any == "string" ? this._riasWidgets[any] : any.id ? this._riasWidgets[any.id] : undefined;
		//},

		_internalResize: function(){
			//console.debug(this.id, "resize in.");
			//console.trace();
			if(this._destroying || this._destroyed){
				return;
			}

			rias.dom.setMarginBox(this.domNode, rias.dom.getContentBox(this.domNode.parentNode || rias.body(this.ownerDocument)));
			//this._contentBox = rias.dom.getContentBox(this.domNode);
			this.appClientHeight = this.domNode.clientHeight;
			this.appClientWidth = this.domNode.clientWidth;

			this.layout();
			//console.debug(this.id, "resize out.");
		},
		resize: function(){
			//console.warn("resize(): " + this.id);
			this.inherited(arguments);
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswModuleIcon",
		iconClass16: "riaswModuleIcon16",
		defaultParams: {
			//content: "<div></div>",
			//parseOnLoad: true,
			//doLayout: true
			//"class": "webApp"
		}
	};

	return Widget;

});