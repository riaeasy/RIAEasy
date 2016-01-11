define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/BackgroundIframe"
], function(rias, _Widget, _TemplatedMixin, BackgroundIframe){

	rias.theme.loadCss([
		"layout/Underlay.css"
	]);

	var riasType = "rias.riasw.layout.Underlay";

	var Widget = rias.declare(riasType, [_Widget, _TemplatedMixin], {

		templateString: "<div class='riaswUnderlayWrapper'><div class='riaswUnderlay' tabIndex='-1' data-dojo-attach-point='containerNode'></div></div>",

		dialog: null,

		//"class": "",

		// This will get overwritten as soon as show() is call, but leave an empty array in case hide() or destroy()
		// is called first.   The array is shared between instances but that's OK because we never write into it.
		//_modalConnects: [],

		_setDialogAttr: function(dlg){
			rias.dom.setAttr(this.containerNode, "id", dlg.id + "_underlay");
			if(dlg){
				if(dlg.parent){
					this.placeAt(dlg.parent);
				}else{
					this.placeAt(dlg._riasrParent);
				}
			}else{
				this.placeAt(this.ownerDocument);
			}
			this._set("dialog", dlg);
			if(this.open){
				this.resize();
			}
		},

		_setClassAttr: function(clazz){
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
		},

		resize: function(){
			var cs = this.containerNode.style,
				ds = this.domNode.style.display;

			// hide the background temporarily, so that the background itself isn't
			// causing scrollbars to appear (might happen when user shrinks browser
			// window and then we are called to resize)
			this.domNode.style.display = "none";

			var box = rias.dom.getMarginBox(this.domNode.parentNode || rias.body(this.ownerDocument));
			rias.dom.setMarginBox(this.domNode, box);
			if(this.containerNode != this.domNode){
				rias.dom.setMarginBox(this.containerNode, box);
			}

			this.domNode.style.display = ds;
		},

		show: function(){
			this.domNode.style.display = "block";
			this.open = true;
			this.resize();
			this.bgIframe = new BackgroundIframe(this.domNode);

			var win = rias.dom.getWindow(this.ownerDocument);
			///考虑到可以 hide / show 的时候动态解除绑定，故不用 own()
			//this._modalConnects = [
			//	//rias.dom.Viewport.on("resize", rias.debounce(this.id + "_show", this.resize, this, 50)),
			//	//rias.on(win, "scroll", rias.debounce(this.id + "_show", this.resize, this, 50))
			//];

		},

		hide: function(){
			if(this.bgIframe){
				this.bgIframe.destroy();
				delete this.bgIframe;
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
