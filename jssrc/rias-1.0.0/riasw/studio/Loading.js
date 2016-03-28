//RIAStudio Client Widget - Loader.

define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin"
], function(rias, _Widget, _TemplatedMixin) {

	rias.theme.loadRiasCss([
		"studio/Loading.css"
	]);

	var riasType = "rias.riasw.studio.Loading";

	var Widget = rias.declare(riasType, [_Widget, _TemplatedMixin], {
		hasVisuals: true,

		// attachToPointer
		//		true to use visual indicator where cursor is
		attachToPointer: true,

		// duration: Integer
		//		time in ms to toggle in/out the visual load indicator
		duration: rias.defaultDuration,

		// _offset: Integer
		//		distance in px from the mouse pointer to show attachToPointer avatar
		_offset: 16,

		// holder for mousemove connection
		_pointerConnect: null,

		templateString:
			'<div class="riaswLoading">'+
				'<span class="dijitReset dijitInline dijitIcon riaswLoadingIcon" data-dojo-attach-point="iconNode"></span>'+
				'<span data-dojo-attach-point="textNode" class="dijitReset dijitInline riaswLoadingCaption"></span>'+
			'</div>',

		postCreate: function(){
			var self = this;
			if(!self.hasVisuals){
				self.domNode.style.display = "none"; // _destroy()?
			}else{
				if(self.attachToPointer){
					//rias.dom.removeClass(self.domNode, "riaswLoading");
					rias.dom.addClass(self.domNode, "riaswLoadingPointer");
				}
			}

			self.set("content", rias.i18n.message.loading);
			self._isLoading = false;
			self._ioLoading = false;
			self._requireIdle = true;
			self.own(rias.subscribe("riaswLoading/start", function(){
				self._isLoading = true;
				self.toggle();
			}), rias.subscribe("riaswLoading/end", function(){
				self._isLoading = false;
				self.toggle();
			}), rias.subscribe("/dojo/io/start", function(){
				self._ioLoading = true;
				self.toggle();
			//}), rias.subscribe("/dojo/io/send", function(){
			//	self._ioLoading = true;
			//	self.toggle();
			//}), rias.subscribe("/dojo/io/done", function(){
			//	self._ioLoading = false;
			//	self.toggle();
			}), rias.subscribe("/dojo/io/stop", function(){
				self._ioLoading = false;
				self.toggle();
			//}), rias.subscribe("/dojo/io/load", function(){
			//	self._ioLoading = false;
			//	self.toggle();
			//}), rias.subscribe("/dojo/io/error", function(){
			//	self._ioLoading = false;
			//	self.toggle();
			}), rias.after(rias.require, "injectUrl", function(){
				self._requireIdle = rias.require.idle();
				self.toggle();
			}, true), rias.require.on("idle", function(){
				self._requireIdle = rias.require.idle();
				self.toggle();
			}, true));
			//self.own(rias.after(rias.require, "idle", function(){
			//	//self._requireIdle = rias.require.idle();
			//	self.toggle();
			//}, true));
		},

		startup: function(){
			this.inherited(arguments);
			rias.dom.positionAt(this, {
				around: {
					x: rias.dom.webAppNode.clientWidth >> 1,
					y: rias.dom.webAppNode.clientHeight >> 1
				},
				positions: ["centered"]
			});
		},

		destroy: function(){
			if(this._pointerConnect){
				this._pointerConnect.remove();
			}
		},

		_setContentAttr: function(/* String */ content){
			this._set("content", content);
			if(this.textNode){
				this.textNode.innerHTML = content;
			}
		},

		onMouseMove: function(/* Event */ e){
			// summary:
			//		place the floating loading element based on mousemove connection position
			//rias.placeAt(this.domNode, {
			//	x: e.clientX + this._offset,
			//	y: e.clientY + this._offset + this._offset
			//}, ["after", "before", "BL", "BR"]);
			rias.dom.positionAt(this, {
				around: {
					x: e.clientX + this._offset,
					y: e.clientY + this._offset + this._offset
				},
				positions: ["centered"]
			});
		},
		_show: function(){
			var self = this;
			if(self._showing){
				return;
			}
			self._showing = true;
			rias.publish("Loader",[{
				widget: self,
				message: 'started'
			}]);
			if(self.hasVisuals){
				if(self.attachToPointer){
					self._pointerConnect = rias.on(rias.dom.doc, rias.touch.move, rias.hitch(self, "onMouseMove"));
				}
				rias.dom.setStyle(self.domNode, {
					opacity: 0
				});
				rias.fx.fadeIn({
					node: self.domNode,
					duration: self.duration,
					onBegin: function(){
						//console.info("show begin.");
						rias.dom.setStyle(self.domNode, "display", "block");
					}
				}).play();
			}
		},
		_hide: function(){
			var self = this;
			if(!self._showing){
				return;
			}
			//console.info("hide.");
			self._showing = false;
			rias.publish("Loading", [{
				widget: self,
				message: 'ended'
			}]);
			if(self.hasVisuals){
				if(self._pointerConnect){
					self._pointerConnect.remove();
				}
				rias.fx.fadeOut({
					node: self.domNode,
					duration: self.duration,
					onEnd: function(){
						rias.dom.setStyle(self.domNode, "display", "none");
						//console.info("hide end.");
						if(rias.dom.getStyle(self.domNode, "display") != "none"){
							console.error("Loading's visible: " + rias.dom.getStyle(self.domNode, "display"));
						}
					}
				}).play();
			}
		},
		toggle: function(){
			if(this._isLoading || this._ioLoading || !this._requireIdle){
				//console.info("show");
				this._show();
			}else{
				//console.info("hide");
				this._hide();
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswLoadingIcon",
		iconClass16: "riaswLoadingIcon16",
		defaultParams: {
			//duration: rias.defaultDuration
		}
	};

	return Widget;

});
