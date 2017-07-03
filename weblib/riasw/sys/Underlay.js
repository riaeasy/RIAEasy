define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/BackgroundIframe"
], function(rias, _WidgetBase, BackgroundIframe){

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadThemeCss([
	//	"riasw/layout/Underlay.css"
	//]);

	var riaswType = "riasw.sys.Underlay";

	var Widget = rias.declare(riaswType, [_WidgetBase], {

		//templateString: "<div class='riaswUnderlay' tabIndex='-1' data-dojo-attach-point='containerNode' tabIndex='0'></div>",
		baseClass: "riaswUnderlay",
		//tabIndex: -1,

		targetWidget: null,
		opacity: 0.35,///用 css 存在 placeAt 时 获取不准确的问题，还是显式控制好些。

		//"class": "",

		// This will get overwritten as soon as show() is call, but leave an empty array in case hide() or destroy()
		// is called first.   The array is shared between instances but that's OK because we never write into it.
		//_modalConnects: [],

		buildRendering: function(){
			this.inherited(arguments);
			this.containerNode = this.domNode;
			rias.dom.addClass(this.domNode, "dijitReset");
		},
		postCreate: function(){
			this.inherited(arguments);

			// target 可以设置 parent
			if(!this.targetWidget){
				this.ownerDocumentBody.appendChild(this.domNode);
			}

			this.own(this.on(this.domNode, "keydown", function(evt){
				if(this.targetWidget){
					this.targetWidget.focus();
				}
				evt.preventDefault();
				evt.stopPropagation();
			}));
		},
		_stopPlay: function(){
			if(this._playing){
				this._playing.stop(true);
			}
			this._playing = undefined;
		},
		_onDestroy: function(){
			if(this._onContainerChangedHandle){
				this._onContainerChangedHandle.remove();
				delete this._onContainerChangedHandle;
			}
			this._stopPlay();
			delete this.targetWidget;
			this.inherited(arguments);
		},

		_onContainerChanged: function(container){
			this.inherited(arguments);
			if(this.targetWidget){
				this.domNode._riasrPopupOwner = this.targetWidget;
				this.set("zIndex", rias.dom.getStyle(this.targetWidget.domNode, "zIndex"));
				this.ownerDocument = this.targetWidget.ownerDocument;
			}
			this.resize();///需要显式调用
		},
		_setTargetWidgetAttr: function(widget){
			rias.dom.setAttr(this.containerNode, "id", widget.id + "_underlay");
			this._set("targetWidget", widget);
			this.set("class", rias.map(widget["class"].split(/\s/),function(s){
				return s ? s + "_underlay" : "";
			}).join(" "));
			//this._onKeyDown = rias.hitch(widget, "_onKey");
			if(widget){
				this.placeAt(widget, "before");
				this._onContainerChangedHandle = this.after(widget, "_doContainerChanged", "_doContainerChanged", true);
			}else{
				if(this._onContainerChangedHandle){
					this._onContainerChangedHandle.remove();
					delete this._onContainerChangedHandle;
				}
				this.placeAt(this.ownerDocument);
			}
		},
		_setClassAttr: function(clazz){
			rias.dom.clearComputedStyle(this.domNode);
			rias.dom.clearComputedStyle(this.containerNode);
			rias.dom.replaceClass(this.domNode, clazz, this["class"]);///注意：是 replace 原来的
			rias.dom.replaceClass(this.containerNode, "riaswUnderlay " + clazz, this["class"]);///注意：是 replace 原来的
			this._set("class", clazz);
		},

		_resize: function(){
			/// 需要覆盖 parentNode 的 ContentBox
			var mb,
				node = this.getParentNode();
			//rias.dom.noOverflowCall(node, function(){
				mb = rias.dom.getContentBox(node);
				rias.dom.setMarginBox(this.domNode, mb);
				if(this.containerNode !== this.domNode){
					rias.dom.setMarginSize(this.containerNode, mb);
				}
			//}, this);
			return mb;
		},

		duration: rias.defaultDuration,
		_doPlay: function(show){
			var self = this,
				cn = self.domNode,
				duration = self.duration || rias.defaultDuration;
			this._stopPlay();
			if(show == false){
				self._playing = rias.fx.fadeOut({
					node: cn,
					duration: duration,
					end: 0,
					onEnd: function(){
						self.domNode.style.display = "none";
						self._playing = undefined;
					},
					onStop: function(){
						self.domNode.style.display = "none";
						self._playing = undefined;
					}
				});
			}else{
				self._playing = rias.fx.fadeIn({
					node: cn,
					duration: duration,
					start: 0,
					end: self.opacity || 0.35,
					beforeBegin: function(){
						self.domNode.style.display = "block";
					},
					onEnd: function(){
						self._playing = undefined;
					},
					onStop: function(){
						self._playing = undefined;
					}
				});
			}
			self._playing.play();
		},
		show: function(){
			/// Underlay 可以不用 resize parent。
			if(!this.bgIframe){
				this.bgIframe = new BackgroundIframe(this.domNode);
			}
			if(!this._showing){
				this._doPlay(true);
				this._showing = true;
			}
		},

		hide: function(){
			if(this._showing){
				this._doPlay(false);
				this._showing = false;
			}
			if(this.bgIframe){
				rias.destroy(this.bgIframe);
				this.bgIframe = undefined;
			}
		}
	});

	return Widget;
});
