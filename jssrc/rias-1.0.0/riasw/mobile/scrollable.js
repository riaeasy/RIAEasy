
//RIAStudio client runtime widget - ComboBox

define([
	"rias",
	"dojox/mobile/scrollable"
], function(rias, _Widget){

	var _count = 0;

	rias.extend(_Widget, {

		/*onFlickAnimationStart: function(e){
			this._inFlickAnimation = true;
			if(e){
				rias.event.stop(e);
			}
		},

		onFlickAnimationEnd: function(e){
			if(rias.has("ios")){
				this._keepInputCaretInActiveElement();
			}
			if(e){
				var an = e.animationName;
				if(an && an.indexOf("scrollableViewScroll2") === -1){
					if(an.indexOf("scrollableViewScroll0") !== -1){ // scrollBarV
						if(this._scrollBarNodeV){
							rias.dom.removeClass(this._scrollBarNodeV, "mblScrollableScrollTo0");
						}
					}else if(an.indexOf("scrollableViewScroll1") !== -1){ // scrollBarH
						if(this._scrollBarNodeH){
							rias.dom.removeClass(this._scrollBarNodeH, "mblScrollableScrollTo1");
						}
					}else{ // fade or others
						if(this._scrollBarNodeV){
							this._scrollBarNodeV.className = "";
						}
						if(this._scrollBarNodeH){
							this._scrollBarNodeH.className = "";
						}
					}
					return;
				}
				if(this._useTransformTransition || this._useTopLeft){
					var n = e.target;
					if(n === this._scrollBarV || n === this._scrollBarH){
						var cls = "mblScrollableScrollTo" + (n === this._scrollBarV ? "0" : "1");
						if(rias.dom.hasClass(n, cls)){
							rias.dom.removeClass(n, cls);
						}else{
							n.className = "";
						}
						return;
					}
				}
				if(e.srcElement){
					rias.event.stop(e);
				}
			}
			this._inFlickAnimation = false;
			this.stopAnimation();
			if(this._bounce){
				var _this = this;
				var bounce = _this._bounce;
				setTimeout(function(){
					_this.slideTo(bounce, 0.3, "ease-out");
					_this.hideScrollBar();
					_this.removeCover();
				}, 0);
				_this._bounce = undefined;
			}else{
				this.hideScrollBar();
				this.removeCover();
			}
		},*/

		getScreenSize: function(){
			// summary:
			//		Returns the dimensions of the browser window.
			/*return this._riasrModule ? {
				h: this._riasrModule._contentBox ? this._riasrModule._contentBox.h : this._riasrModule.domNode.innerHeight,
				w: this._riasrModule._contentBox ? this._riasrModule._contentBox.w : this._riasrModule.domNode.innerWidth
			} :*/return rias.webApp ? {
				h: rias.webApp._contentBox ? rias.webApp._contentBox.h : rias.webApp.domNode.innerHeight,
				w: rias.webApp._contentBox ? rias.webApp._contentBox.w : rias.webApp.domNode.innerWidth
			} : {
				h: rias.global.innerHeight || rias.dom.doc.documentElement.clientHeight || rias.dom.doc.documentElement.offsetHeight,
				w: rias.global.innerWidth || rias.dom.doc.documentElement.clientWidth || rias.dom.doc.documentElement.offsetWidth
			};
		},

		cleanup: function(){
			// summary:
			//		Uninitialize the module.
			if(this._ch){
				for(var i = 0; i < this._ch.length; i++){
					rias.connect.disconnect(this._ch[i]);
				}
				this._ch = null;
			}
			if(this._onScroll && rias.global.removeEventListener){ // all supported browsers but IE8
				rias.global.removeEventListener("scroll", this._onScroll, true);
				this._onScroll = null;
			}

			if(this._onFocusScroll && this.domNode.removeEventListener){
				this.domNode.removeEventListener("focus", this._onFocusScroll, true);
				this._onFocusScroll = null;
			}

			///解决动画未完时关闭会导致的问题。
			this.stopAnimation();
			if(this._bounce){
				var _this = this;
				var bounce = _this._bounce;
				setTimeout(function(){
					_this.slideTo(bounce, 0.3, "ease-out");
					_this.hideScrollBar();
					_this.removeCover();
				}, 0);
				_this._bounce = undefined;
			}else{
				this.hideScrollBar();
				this.removeCover();
			}
		}

	});

	return _Widget;

});
