define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/BackgroundIframe"
], function(rias, _Widget, _TemplatedMixin, BackgroundIframe){

	///由于 css 加载的延迟，造成如果 domNode 的 css 有 padding、margin、border，可能显示不正确，最好移到 _PabelBase 中加载。
	//rias.theme.loadThemeCss([
	//	"riasw/layout/Underlay.css"
	//]);

	var riaswType = "rias.riasw.layout.Underlay";

	var Widget = rias.declare(riaswType, [_Widget, _TemplatedMixin], {

		templateString: "<div class='riaswUnderlay' tabIndex='-1' data-dojo-attach-point='containerNode'></div>",

		dialog: null,

		//"class": "",

		// This will get overwritten as soon as show() is call, but leave an empty array in case hide() or destroy()
		// is called first.   The array is shared between instances but that's OK because we never write into it.
		//_modalConnects: [],

		_setDialogAttr: function(dlg){
			rias.dom.setAttr(this.containerNode, "id", dlg.id + "_underlay");
			this._set("dialog", dlg);
			this.set("class", rias.map(dlg["class"].split(/\s/),function(s){
				return s + "_underlay";
			}).join(" "));
			this._onKeyDown = rias.hitch(dlg, "_onKey");
			if(this.open){
				if(dlg && dlg.parent){
					this.placeAt(dlg.parent);
				}else if(dlg && dlg._riasrParent){
					this.placeAt(dlg._riasrParent);
				}else{
					this.placeAt(this.ownerDocument);
				}
				this.set("zIndex", dlg.get("zIndex") - 1);
				this.ownerDocument = dlg.ownerDocument;
				this.resize();
			}
		},

		_setClassAttr: function(clazz){
			this.domNode.className = clazz;
			this.containerNode.className = "riaswUnderlay " + clazz;
			this._set("class", clazz);
		},

		postCreate: function(){
			// dialog 可以设置 parent
			if(!this.dialog){
				this.ownerDocumentBody.appendChild(this.domNode);
			}

			this.own(rias.on(this.domNode, "keydown", rias.hitch(this, "_onKeyDown")));

			this.inherited(arguments);
			this._initAttr(["zIndex"]);
		},

		_onZIndex: function(value, oldValue){
			if(rias.isNumber(value)){
				rias.dom.setStyle(this.domNode, "zIndex", value);
			}
		},

		resize: function(){
			var cs = this.containerNode.style,
				ds = this.domNode.style.display;

			// hide the background temporarily, so that the background itself isn't
			// causing scrollbars to appear (might happen when user shrinks browser
			// window and then we are called to resize)
			this.domNode.style.display = "none";

			/// 需要覆盖 parentNode 的 MarginBox
			var box = rias.dom.getMarginBox(this.getParentNode());
			rias.dom.setMarginBox(this.domNode, box);
			if(this.containerNode != this.domNode){
				rias.dom.setMarginSize(this.containerNode, box);
			}

			this.domNode.style.display = ds;
		},

		show: function(){
			var dlg = this.dialog;
			/// Underlay 可以不用 resize parent。
			if(dlg && dlg.parent){
				this.placeAt(dlg.parent, "", true);
			}else if(dlg && dlg._riasrParent){
				this.placeAt(dlg._riasrParent, "", true);
			}else{
				this.placeAt(this.ownerDocument, "", true);
			}
			this.set("zIndex", dlg.get("zIndex") - 1);
			this.ownerDocument = dlg.ownerDocument;

			this.domNode.style.display = "block";
			this.open = true;
			this.resize();
			if(!this.bgIframe){
				this.bgIframe = new BackgroundIframe(this.domNode);
			}
		},

		hide: function(){
			if(this.bgIframe){
				rias.destroy(this.bgIframe);
				this.bgIframe = undefined;
			}
			this.domNode.style.display = "none";
			//while(this._modalConnects.length){ (this._modalConnects.pop()).remove(); }
			this.open = false;
		},

		destroy: function(){
			//while(this._modalConnects.length){ (this._modalConnects.pop()).remove(); }
			this.inherited(arguments);
		},

		_onKeyDown: function(){
			// summary:
			//		Extension point so Dialog can monitor keyboard events on the underlay.
		}
	});

	Widget.show = function(/*Object*/ attrs, /*Number*/ zIndex){
		var underlay = Widget._singleton;
		if(!underlay || underlay._destroyed){
			underlay = Widget._singleton = new Widget(attrs);
		}else{
			if(attrs){
				underlay.set(attrs);
			}
		}
		rias.dom.setStyle(underlay.domNode, 'zIndex', zIndex);
		if(!underlay.open){
			underlay.show();
		}
	};

	Widget.hide = function(){
		var underlay = Widget._singleton;
		if(underlay && !underlay._destroyed){
			underlay.hide();
		}
	};

	return Widget;
});
