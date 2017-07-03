//RIAStudio Client Widget - Loader.

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/Underlay"
], function(rias, _WidgetBase, _TemplatedMixin, Underlay) {

	//rias.theme.loadThemeCss([
	//	"riasw/sys/Loadingtip.css"
	//]);

	var riaswType = "riasw.sys.Loadingtip";

	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin], {

		templateString:
			'<div class="dijitReset">'+
				'<span class="riaswButtonIcon riaswNoIcon" data-dojo-attach-point="iconNode"></span>'+
				'<span class="dijitInline riaswNoLabel" data-dojo-attach-point="containerNode">'+
					'<span data-dojo-attach-point="requiringNode" class="riaswLoadingtipLabel riaswLoadingtipLoading"></span>'+
					'<span data-dojo-attach-point="ioLoadingNode" class="riaswLoadingtipLabel riaswLoadingtipIoLoading"></span>'+
					'<span data-dojo-attach-point="parsingNode" class="riaswLoadingtipLabel riaswLoadingtipParsing"></span>'+
					//'<span data-dojo-attach-point="destroyingNode" class="riaswLoadingtipLabel riaswLoadingtipDestroying"></span>'+
					'<span data-dojo-attach-point="doingNode" class="riaswLoadingtipLabel riaswLoadingtipDoing"></span>'+
					'<span data-dojo-attach-point="textNode" class="riaswLoadingtipLabel riaswLoadingtipText"></span>'+
				'</span>'+
			'</div>',
		baseClass: "riaswLoadingtip",
		iconClass: "riaswLoadingBusyIcon",

		showRequiring: true,
		showIoLoading: true,
		showParsing: true,
		//showDestroying: true,
		showDoing: true,

		content: rias.i18n.message.loading,
		// attachToPointer
		//		true to use visual indicator where cursor is
		attachToPointer: true,
		// duration: Integer
		//		time in ms to toggle in/out the visual load indicator
		duration: rias.defaultDuration / 2,
		loadingtipUnderlayOpacity: 0.1,///用 css 存在 placeAt 时 获取不准确的问题，还是显式控制好些。
		// _offset: Integer
		//		distance in px from the mouse pointer to show attachToPointer avatar
		_offset: 24,
		// holder for mousemove connection
		_pointerConnect: null,

		postCreate: function(){
			var self = this;
			self.inherited(arguments);
			if(self.attachToPointer){
				rias.dom.addClass(self.domNode, "riaswLoadingtipPointer");
			}

			self._setNodeContent(self.requiringNode, "");
			self._setNodeContent(self.ioLoadingNode, "");
			self._setNodeContent(self.parsingNode, "");
			//self._setNodeContent(self.destroyingNode, "");
			self._setNodeContent(self.doingNode, "");
			self._setNodeContent(self.textNode, rias.i18n.message.waiting);
			self._requirings = [];
			self._parsings = [];
			//self._destroyings = [];
			self._ioLoadings = [];
			self._doings = [];
			self._requireIdle = true;
			self.own(rias.subscribe("/rias/require/start", function(params){
				if(self.showRequiring){
					self._requirings.push(params[0]);
				}
				self.toggle();
			}), rias.subscribe("/rias/require/done", function(params){
				if(self.showRequiring){
					rias.removeItems(self._requirings, params[0]);
				}
				self.toggle();
			}), rias.subscribe("/dojo/io/send", function(params){
				///注意：xhr 是 dojo.publish(connnect.publish)，params 不是 Array
				if(self.showIoLoading){
					self._ioLoadings.push(params);
				}
				self.toggle();
			}), rias.subscribe("/dojo/io/done", function(params){
				///注意：xhr 是 dojo.publish(connnect.publish)，params 不是 Array
				if(self.showIoLoading){
					rias.removeItems(self._ioLoadings, params);
				}
				self.toggle();
			}), rias.subscribe("/rias/desktop/doing", function(params){
				if(self.showDoing){
					self._doings.push(params[0]);
				}
				self.toggle();
			}), rias.subscribe("/rias/desktop/done", function(params){
				if(self.showDoing){
					rias.removeItems(self._doings, params[0]);
				}
				self.toggle();
			}), rias.subscribe("/rias/parse/start", function(params){
				if(self.showParsing){
					self._parsings.push(params[0]);
				}
				self.toggle();
			}), rias.subscribe("/rias/parse/done", function(params){
				if(self.showParsing){
					rias.removeItems(self._parsings, params[0]);
				}
				self.toggle();
			//}), rias.subscribe("/rias/destroy/start", function(params){
			//	if(self.showDestroying){
			//		self._destroyings.push(params[0]);
			//	}
			//	self.toggle();
			//}), rias.subscribe("/rias/destroy/done", function(params){
			//	if(self.showDestroying){
			//		rias.removeItems(self._destroyings, params[0]);
			//	}
			//	self.toggle();
			}), rias.after(rias.require, "injectUrl", function(){
				self._requireIdle = rias.require.idle();
				self.toggle();
			}, true), rias.require.on("idle", function(){
				self._requireIdle = rias.require.idle();
				self.toggle();
			}, true));
		},
		_onDestroy: function(){
			//this._stopPlaying();
			if(this._debounceToggleHandle){
				this._debounceToggleHandle.remove();
				this._debounceToggleHandle = undefined;
			}
			if(this._riasrUnderlay){
				rias.destroy(this._riasrUnderlay);
				this._riasrUnderlay = undefined;
			}
			if(this._pointerConnect){
				this._pointerConnect.remove();
			}
			this.inherited(arguments);
		},

		startup: function(){
			this.inherited(arguments);
			/// 用 rias.dom.desktopBody 而不是 rias.desktop，可以闪避 desktop.resize
			/// 存在 Underlay，还是需要 desktop.resize
			var p = rias.desktop && rias.desktop.containerNode || rias.dom.desktopBody;
			rias.dom.placeAndPosition(this.domNode, this, {
				parent: p,
				around: {
					x: p.clientWidth >> 1,
					y: p.clientHeight >> 1
				},
				popupPositions: ["centered"]
			});
		},

		_setNodeContent: function(node, content){
			if(node){
				node.innerHTML = content;
				rias.dom.visible(node, !!content);
			}
		},
		_setContentAttr: function(/* String */ content){
			this._set("content", content);
			this._setNodeContent(this.textNode, content);
		},

		onMouseMove: function(/* Event */ e){
			// summary:
			//		place the floating loading element based on mousemove connection position
			rias.dom.placeAndPosition(this.domNode, this, {
				around: {
					x: e.clientX + this._offset,
					y: e.clientY + this._offset + this._offset
				},
				popupPositions: ["centered"]
			});
		},

		showUnderlay: function(){
			if(!this._riasrUnderlay){
				this._riasrUnderlay = new Underlay({
					ownerRiasw: this,
					targetWidget: this,
					opacity: this.loadingtipUnderlayOpacity
				});
			}
			this._riasrUnderlay.show();
			this._underlayShowing = true;
		},
		hideUnderlay: function(){
			if(this._riasrUnderlay){
				this._riasrUnderlay.hide();
			}
			this._underlayShowing = false;
		},
		/*_stopPlaying: function(){
			if(this._playing){
				this._playing.stop(true);
			}
			this._playing = undefined;
		},*/
		_show: function(){
			var self = this;
			if(self._showing){
				return;
			}
			self._showing = true;
			if(self.attachToPointer){
				self._pointerConnect = rias.on(rias.dom.doc, rias.touch.move, rias.hitch(self, "onMouseMove"));
			}
			/*this._stopPlaying();
			self._playing = rias.fx.fadeIn({
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
			/*this._stopPlaying();
			self._playing = rias.fx.fadeOut({
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
		debounceToggleDelay: 50,
		toggle: function(delay){
			this._debounceToggleHandle = rias._throttleDelayed(this.id + "toggle", function(){
				this._debounceToggleHandle = undefined;
				///debounce 后，有可能 this 的状态已经改变。
				this._setNodeContent(this.requiringNode, this.showRequiring && this._requirings.length > 0 ? rias.i18n.message.requiring + " [" + this._requirings.length + "]" : "");
				this._setNodeContent(this.ioLoadingNode, this.showIoLoading && this._ioLoadings.length > 0 ? rias.i18n.message.ioLoading + " [" + this._ioLoadings.length + "]" : "");
				this._setNodeContent(this.parsingNode, this.showParsing && this._parsings.length > 0 ? rias.i18n.message.parsing + " [" + this._parsings.length + "]" : "");
				//this._setNodeContent(this.destroyingNode, this.showDestroying && this._destroyings.length > 0 ? rias.i18n.message.destroying + " [" + this._destroyings.length + "]" : "");
				//this._setNodeContent(this.doingNode, this.showDoing && this._doings.length > 0 ? rias.i18n.message.doing + " [" + this._doings.length + "]" : "");
				this._setNodeContent(this.doingNode, this.showDoing && this._doings.length > 0 ? this._doings.join("<br />") : "");
				//console.debug(this._requirings.length, this._ioLoadings.length, this._parsings.length);
				if(this._doings.length > 0){
					if(!this._underlayShowing){
						this.showUnderlay();
					}
				}else if(this._underlayShowing){
					this.hideUnderlay();
				}
				if(this.showRequiring && this._requirings.length > 0 || this.showIoLoading && this._ioLoadings.length > 0// || this.showDestroying && this._destroyings.length > 0
					|| this.showParsing && this._parsings.length > 0 || this.showDoing && this._doings.length > 0){
					//console.info("show");
					this._show();
				}else{
					//console.info("hide");
					this._hide();
				}
			}, this, (delay == undefined ? this.debounceToggleDelay : delay), function(){
				//console.debug("debounceToggle pass... - " + this.id);
			})();
		}

	});

	/*Widget._riasdMeta = {
		visual: true
	};*/

	return Widget;

});
