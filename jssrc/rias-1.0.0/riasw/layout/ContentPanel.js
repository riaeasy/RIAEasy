
//RIAStudio client runtime widget - ContentPanel

define([
	"rias",
	"rias/riasw/layout/Panel",
	"rias/riasw/form/_FormMixin",
	"rias/riasw/studio/_ModuleMixin"
], function(rias, Panel, _FormMixin, _ModuleMixin){

	//rias.theme.loadThemeCss([
	//	"riasw/layout/Panel.css"
	//]);

	var riaswType = "rias.riasw.layout.ContentPanel";
	var Widget = rias.declare(riaswType, [Panel, _FormMixin, _ModuleMixin], {

		href: "",
		preventCache: false,

		//ioArgs: {},
		timeout: rias.xhr.defaultTimeout,

		postMixInProperties: function(){
			this.inherited(arguments);
			if(!rias.isObject(this.ioArgs)){
				this.ioArgs = {};
			}
		},
		/*buildRendering: function(){
			this.inherited(arguments);
		},*/
		postCreate: function(){
			this.inherited(arguments);
			///不应该初始化，否则会导致 moduleMeta、href、content 错乱
			//moduleMeta 要参与 isRiaswModule() 判断，不能在 rias.riasw.studio._ModuleMixin 中初始化，可以在 rias.riasw.studio.Module 和 rias.riasw.studio.App 中初始化。
			///this._onModuleMeta(this.moduleMeta);///无需初始化？
			///this._onHref(this.href);///无需初始化
			///this._onContent(this.content);///需要初始化
			this._initAttr([{
				name: "href",
				initialize: false
			}, {
				name: "content",
				initialize: false
			}]);
		},
		destroy: function(){
			this.cancelLoadHref();
			this.inherited(arguments);
		},

		startup: function(){
			var self = this;
			if(self._started){
				return;
			}
			self.inherited(arguments);
		},

		_afterLoadedAllAndShown: function(){
			///这里后设置 modified，因为可能在 afterLoadedAllAndShown 中会有初始化处理。
			this.inherited(arguments);
			this.set("modified", false);
		},

		cancelLoadHref: function(){
			if(this._xhrDfd && (this._xhrDfd.fired == -1)){
				this._xhrDfd.cancel();
			}
			this._xhrDfd = undefined; // garbage collect
		},

		_loading: function(){
			var self = this;
			///很重要！须在 ready 后再载入，以保证 dom 初始化正确。
			//ready(100, function())是dojo.parser.parse().
			//ready(1000, function())是缺省.
			rias.ready(1000, function(){
				if(!self.isDestroyed(true)){
					self.defer(function(){
						///需要等待 给 _started 赋值
						if(!self._riaswChildren || self._riaswChildren.length < 1){
							//self._setContent(self.loadingMessage).then(function(){
								if(self.moduleMeta){
									self._loadModuleMeta();
								}else if(self.href){
									self._loadHref();
								}else if(self.content){
									self._loadContent();
								}else{
									self._initSize();
									self._afterLoaded();
								}
							//});
						}else{
							self._initSize();
							self._afterLoaded(self._riasrElements);
						}
					}, 30);
				}
			});
		},
		_loadHref: function(){
			var self = this;
			var getArgs = {
				preventCache: self.preventCache,
				url: self.href,
				timeout: self.timeout || rias.xhr.defaultTimeout,
				handleAs: "text"
			};
			if(rias.isObject(self.ioArgs)){
				rias.mixin(getArgs, self.ioArgs);
			}
			var hand = (self._xhrDfd = (self.ioMethod || rias.xhr.get)(getArgs)),
				returnedHtml;
			hand.then(
				function(html){
					returnedHtml = html;
					self._isDownloaded = true;
					self._setContent(html).then(function(){
						self._initSize();
						self._afterLoaded(html);
					});
				},
				function(err){
					if(!hand.canceled){
						// show error message in the pane
						self._onError('Load', err);
					}else{
						self.cancelLoadHref();
					}
					self._xhrDfd = undefined;
					return err;
				}
			).then(function(){
					self._xhrDfd = undefined;
					return returnedHtml;
				});
		},
		_loadContent: function(){
			var self = this;
			self._isDownloaded = false; // mark that content is from a set('content') not a set('href')
			self._setContent(self.content || "").then(function(result){
				//rias.dom.addClass(self.containerNode, "riaswDialogPanelContentMessage");
				self._initSize();
				self._afterLoaded(self.content);
			});
		},
		_loadChildren: function(){
			var self = this;
			self._isDownloaded = false; // mark that content is from a set('content') not a set('href')
			//self._setContent("");
			rias.bind([]/*self._riaswChildren*/, self).then(function(result){
				if(result.errors){
					self._onError('Load', "Bind children error:\n" + result.errors);
				}else{
					self._initSize();
					self._afterLoaded(result);
				}
			}, function(error){
				self._onError('Load', "Bind children error:\n" + error.message);
			});
		},

		_onHref: function(/*String|Uri*/ href){
			//this.content = "";
			//this.moduleMeta = "";
			this.href = href;
			return this._load();
		},
		_onContent: function(/*String|DomNode|Nodelist*/content){
			//this.href = "";
			//this.moduleMeta = "";
			this.content = content;// rias.isString(content) ? rias.toHTMLStr(content) : content;
			return this._load();
		},
		_getContentAttr: function(){
			return this.containerNode.innerHTML;
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswPaneIcon",
		iconClass16: "riaswPaneIcon16",
		defaultParams: {
		}
	};

	return Widget;

});
