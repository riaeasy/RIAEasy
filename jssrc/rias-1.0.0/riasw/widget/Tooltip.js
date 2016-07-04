//RIAStudio client runtime widget - Tooltip

define([
	"rias",
	"dijit/Tooltip"
], function(rias, Tooltip) {

	///dijit/Tooltip
	rias.showTooltip = function(args){
		if(args.positions){
			args.positions = rias.map(args.positions, function(val){
				return {after: "after-centered", before: "before-centered"}[val] || val;
			});
		}

		if(!Tooltip._masterTT){
			///增加 ownerRiasw
			dijit._masterTT = Tooltip._masterTT = new Tooltip._MasterTooltip({
				ownerRiasw: rias.webApp,
				_riaswIdOfModule: "_MasterTooltip"
			});
		}
		//return Tooltip._masterTT.show(innerHTML, aroundNode, position, rtl, textDir, onMouseEnter, onMouseLeave);
		return Tooltip._masterTT.show(args.content, args.around, args.positions, args.rtl, args.textDir, args.onMouseEnter, args.onMouseLeave);
	};
	Tooltip.show = dijit.showTooltip = function(innerHTML, aroundNode, position, rtl, textDir, onMouseEnter, onMouseLeave){
		return rias.showTooltip({
			content: innerHTML,
			around: aroundNode,
			positions: position,
			rtl: rtl,
			textDir: textDir,
			onMouseEnter: onMouseEnter,
			onMouseLeave: onMouseLeave
		});
	};
	rias.hideTooltip = dijit.hideTooltip;// = Tooltip.hide;//hideTooltip = function(aroundNode)

	var DORMANT = "DORMANT",
		SHOW_TIMER = "SHOW TIMER",
		SHOWING = "SHOWING",
		HIDE_TIMER = "HIDE TIMER";
	var riasType = "rias.riasw.widget.Tooltip";
	var Widget = rias.declare(riasType, [Tooltip], {

		getContent: function(/*DomNode*/ node){
			// summary:
			//		User overridable function that return the text to display in the tooltip.
			// tags:
			//		extension
			node = rias.by(node);
			node = node ? node.get("tooltip") : "";
			return node || this.label || this.domNode.innerHTML;
		},

		_setStateAttr: function(val){
			if(this.state == val ||
				(val == SHOW_TIMER && this.state == SHOWING) ||
				(val == HIDE_TIMER && this.state == DORMANT)){
				return;
			}

			if(this._hideTimer){
				this._hideTimer.remove();
				delete this._hideTimer;
			}
			if(this._showTimer){
				this._showTimer.remove();
				delete this._showTimer;
			}
			if(this._showingTimer){
				this._showingTimer.remove();
				delete this._showingTimer;
			}

			switch(val){
				case DORMANT:
					if(this._connectNode){
						Tooltip.hide(this._connectNode);
						delete this._connectNode;
						this.onHide();
					}
					break;
				case SHOW_TIMER:	 // set timer to show tooltip
					// should only get here from a DORMANT state, i.e. tooltip can't be already SHOWING
					if(this.state != SHOWING){
						this._showTimer = this.defer(function(){ this.set("state", SHOWING); }, this.showDelay);
					}
					break;
				case SHOWING:		// show tooltip and clear timers
					var content = this.getContent(this._connectNode);
					if(!content){
						this.set("state", DORMANT);
						return;
					}

					// Show tooltip and setup callbacks for mouseenter/mouseleave of tooltip itself
					Tooltip.show(content, this._connectNode, this.position, !this.isLeftToRight(), this.textDir,
						rias.hitch(this, "set", "state", SHOWING), rias.hitch(this, "set", "state", HIDE_TIMER));

					this.onShow(this._connectNode, this.position);
					if(this.showingDuration > 0){
						this._showingTimer = this.defer(function(){
							this.set("state", HIDE_TIMER);
						}, this.showingDuration);
					}
					break;
				case HIDE_TIMER:	// set timer set to hide tooltip
					this._hideTimer = this.defer(function(){ this.set("state", DORMANT); }, this.hideDelay);
					break;
			}

			this._set("state", val);
		},
		_setConnectIdAttr: function(/*String|String[]|DomNode|DomNode[]*/ newId){
			// summary:
			//		Connect to specified node(s)

			// Remove connections to old nodes (if there are any)
			rias.forEach(this._connections || [], function(nested){
				rias.forEach(nested, function(handle){
					handle.remove();
				});
			}, this);

			// Make array of id's to connect to, excluding entries for nodes that don't exist yet, see startup()
			this._connectIds = rias.filter(rias.isArrayLike(newId) ? newId : (newId ? [newId] : []),
				function(id){
					return rias.dom.byId(id, this.ownerDocument);
				}, this);

			// Make connections
			this._connections = rias.map(this._connectIds, function(id){
				var self = this,
					node = rias.dom.byId(id, this.ownerDocument),
					selector = this.selector,
					delegatedEvent = selector ?
						function(eventType){
							return rias.on.selector(selector, eventType);
						} :
						function(eventType){
							return eventType;
						};
				return [
					rias.on(node, delegatedEvent(rias.mouse.enter), function(){
						self._onHover(this);
					}),
					//rias.on(node, delegatedEvent("focusin"), function(){
					//	self._onHover(this);
					//}),
					rias.on(node, delegatedEvent(rias.mouse.leave), rias.hitch(self, "_onUnHover"))//,
					//rias.on(node, delegatedEvent("focusout"), rias.hitch(self, "set", "state", "DORMANT"))
				];
			}, this);

			this._set("connectId", newId);
		},

		addTarget: function(/*OomNode|String*/ node){
			node = rias.dom.byId(node);
			if(rias.indexOf(this._connectIds, node) == -1){
				this.set("connectId", this._connectIds.concat(node));
			}
		},

		removeTarget: function(/*DomNode|String*/ node){
			this._onUnHover();
			node = rias.dom.byId(node);
			var idx = rias.indexOf(this._connectIds, node);
			if(idx >= 0){
				// remove id (modifies original this._connectIds but that's OK in this case)
				this._connectIds.splice(idx, 1);
				this.set("connectId", this._connectIds);
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTooltipIcon",
		iconClass16: "riaswTooltipIcon16",
		defaultParams: {
			//content: "<span></span>",
			tabIndex: 0
		},
		initialSize: {},
		resizable: "none",
		allowedChild: "",
		"property": {
			"tabIndex": {
				"datatype": "string",
				"defaultValue": "0",
				"title": "Tab Index"
			},
			"focusedChild": {
				"datatype": "object",
				"description": "The currently focused child widget, or null if there isn't one",
				"hidden": true
			},
			"isContainer": {
				"datatype": "boolean",
				"description": "Just a flag indicating that this widget descends from dijit._Container"
			}
		}
	};

	return Widget;

});