//RIAStudio Client Widget - Loader.

define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin"
], function(rias, _Widget, _TemplatedMixin) {

	//rias.theme.loadThemeCss([
	//	"riasw/studio/Loading.css"
	//]);

	var riaswType = "rias.riasw.studio.Loading";

	var Widget = rias.declare(riaswType, [_Widget, _TemplatedMixin], {

		showRequiring: true,
		showIoLoading: true,
		showBinding: true,
		showDoing: true,

		content: rias.i18n.message.loading,
		// attachToPointer
		//		true to use visual indicator where cursor is
		attachToPointer: true,
		// duration: Integer
		//		time in ms to toggle in/out the visual load indicator
		duration: rias.defaultDuration,
		// _offset: Integer
		//		distance in px from the mouse pointer to show attachToPointer avatar
		_offset: 24,
		// holder for mousemove connection
		_pointerConnect: null,

		templateString:
			'<div class="dijit dijitReset riaswLoading">'+
				'<span class="dijitInline dijitIcon riaswLoadingIcon" data-dojo-attach-point="iconNode"></span>'+
				'<span class="dijitInline" data-dojo-attach-point="containerNode">'+
				'<span data-dojo-attach-point="requiringNode" class="riaswLoadingCaption riaswLoadingLoading"></span>'+
				'<span data-dojo-attach-point="ioLoadingNode" class="riaswLoadingCaption riaswLoadingIoLoading"></span>'+
				'<span data-dojo-attach-point="bindingNode" class="riaswLoadingCaption riaswLoadingBinding"></span>'+
				'<span data-dojo-attach-point="doingNode" class="riaswLoadingCaption riaswLoadingDoing"></span>'+
				'<span data-dojo-attach-point="textNode" class="riaswLoadingCaption riaswLoadingText"></span>'+
				'</span>'+
				'</div>',

		postCreate: function(){
			var self = this;
			self.inherited(arguments);
			if(self.attachToPointer){
				//rias.dom.removeClass(self.domNode, "riaswLoading");
				rias.dom.addClass(self.domNode, "riaswLoadingPointer");
			}

			self._setNodeContent(self.requiringNode, "");
			self._setNodeContent(self.ioLoadingNode, "");
			self._setNodeContent(self.bindingNode, "");
			self._setNodeContent(self.textNode, rias.i18n.message.waiting);
			self._requirings = [];
			self._bindings = [];
			self._ioLoadings = [];
			self._doings = [];
			self._requireIdle = true;
			self.own(rias.subscribe("/rias/require/start", function(params){
				if(self.showRequiring){
					self._requirings.push(params[0]);
					self.toggle();
				}
			}), rias.subscribe("/rias/require/done", function(params){
				if(self.showRequiring){
					rias.removeItems(self._requirings, params[0]);
					self.toggle();
				}
			}), rias.subscribe("/dojo/io/send", function(params){
				if(self.showIoLoading){
					self._ioLoadings.push(params[0]);
					self.toggle();
				}
			}), rias.subscribe("/dojo/io/done", function(params){
				if(self.showIoLoading){
					rias.removeItems(self._ioLoadings, params[0]);
					self.toggle();
				}
			}), rias.subscribe("/rias/webApp/doing", function(params){
				if(self.showDoing){
					self._doings.push(params[0]);
					self.toggle();
				}
			}), rias.subscribe("/rias/webApp/done", function(params){
				if(self.showDoing){
					rias.removeItems(self._doings, params[0]);
					self.toggle();
				}
			}), rias.subscribe("/rias/bind/start", function(params){
				if(self.showBinding){
					self._bindings.push(params[0]);
					self.toggle();
				}
			}), rias.subscribe("/rias/bind/done", function(params){
				if(self.showBinding){
					rias.removeItems(self._bindings, params[0]);
					self.toggle();
				}
			}), rias.subscribe("/rias/destroy/start", function(params){
				if(self.showBinding){
					self._bindings.push(params[0]);
					self.toggle();
				}
			}), rias.subscribe("/rias/destroy/done", function(params){
				if(self.showBinding){
					rias.removeItems(self._bindings, params[0]);
					self.toggle();
				}
			}), rias.after(rias.require, "injectUrl", function(){
				self._requireIdle = rias.require.idle();
				self.toggle();
			}, true), rias.require.on("idle", function(){
				self._requireIdle = rias.require.idle();
				self.toggle();
			}, true));
		},

		startup: function(){
			this.inherited(arguments);
			rias.dom.placeAt(this, {
				around: {
					x: rias.dom.webAppNode.clientWidth >> 1,
					y: rias.dom.webAppNode.clientHeight >> 1
				},
				positions: ["centered"]
			});
		},

		destroy: function(){
			this._stopPlaying();
			if(this._pointerConnect){
				this._pointerConnect.remove();
			}
			this.inherited(arguments);
		},

		_setNodeContent: function(node, content){
			if(node){
				node.innerHTML = content;
				rias.dom.visible(node, !!content);
				//rias.dom.visible(node, true);
			}
		},
		_setContentAttr: function(/* String */ content){
			this._set("content", content);
			this._setNodeContent(this.textNode, content);
		},

		onMouseMove: function(/* Event */ e){
			// summary:
			//		place the floating loading element based on mousemove connection position
			rias.dom.placeAt(this, {
				around: {
					x: e.clientX + this._offset,
					y: e.clientY + this._offset + this._offset
				},
				positions: ["centered"]
			});
		},
		_stopPlaying: function(){
			if(this._playing){
				this._playing.stop();
			}
			this._playing = undefined;
		},
		_show: function(){
			var self = this;
			if(self._showing){
				return;
			}
			self._showing = true;
			if(self.attachToPointer){
				self._pointerConnect = rias.on(rias.dom.doc, rias.touch.move, rias.hitch(self, "onMouseMove"));
			}
			this._stopPlaying();
			/*self._playing = rias.fx.fadeIn({
			 node: self.domNode,
			 duration: self.duration,
			 onBegin: function(){
			 //console.info("show begin.");
			 rias.dom.setStyle(self.domNode, "display", "block");
			 }
			 }).play();*/
			rias.dom.visible(self.domNode, true, 1);
		},
		_hide: function(){
			var self = this;
			if(!self._showing){
				return;
			}
			//console.info("hide.");
			self._showing = false;
			if(self._pointerConnect){
				self._pointerConnect.remove();
			}
			this._stopPlaying();
			/*self._playing = rias.fx.fadeOut({
			 node: self.domNode,
			 duration: self.duration,
			 onEnd: function(){
			 rias.dom.setStyle(self.domNode, "display", "none");
			 //console.info("hide end.");
			 if(rias.dom.getStyle(self.domNode, "display") != "none"){
			 console.error("Loading's visible: " + rias.dom.getStyle(self.domNode, "display"));
			 }
			 }
			 }).play();*/
			rias.dom.visible(self.domNode, false);
		},
		toggle: function(){
			this._setNodeContent(this.requiringNode, this.showRequiring && this._requirings.length > 0 ? rias.i18n.message.requiring + " [" + this._requirings.length + "]" : "");
			this._setNodeContent(this.ioLoadingNode, this.showIoLoading && this._ioLoadings.length > 0 ? rias.i18n.message.ioLoading + " [" + this._ioLoadings.length + "]" : "");
			this._setNodeContent(this.bindingNode, this.showBinding && this._bindings.length > 0 ? rias.i18n.message.binding + " [" + this._bindings.length + "]" : "");
			//this._setNodeContent(this.doingNode, this.showDoing && this._doings.length > 0 ? rias.i18n.message.doing + " [" + this._doings.length + "]" : "");
			this._setNodeContent(this.doingNode, this.showDoing && this._doings.length > 0 ? this._doings[this._doings.length - 1] + " [" + this._doings.length + "]" : "");
			//console.debug(this._requirings.length, this._ioLoadings.length, this._bindings.length);
			if(this.showRequiring && this._requirings.length > 0 || this.showIoLoading && this._ioLoadings.length > 0
				|| this.showBinding && this._bindings.length > 0 || this.showDoing && this._doings.length > 0){
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
