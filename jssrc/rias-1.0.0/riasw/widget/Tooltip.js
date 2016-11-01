//RIAStudio client runtime widget - Tooltip

define([
	"rias",
	"dijit/_Widget",
	"dijit/_TemplatedMixin",
	"dijit/BackgroundIframe"
], function(rias, _Widget, _TemplatedMixin, BackgroundIframe) {

	// module:
	//		dijit/Tooltip


	// TODO: Tooltip should really share more positioning code with TooltipDialog, like:
	//		- the orient() method
	//		- the connector positioning code in show()
	//		- the dijitTooltip[Dialog] class
	//
	// The problem is that Tooltip's implementation supplies it's own <iframe> and interacts directly
	// with dijit/place, rather than going through dijit/popup like TooltipDialog and other popups (ex: Menu).

	function noop(){}

	var MasterTooltip = rias.declare("rias.riasw._MasterTooltip", [_Widget, _TemplatedMixin], {
		// summary:
		//		Internal widget that holds the actual tooltip markup,
		//		which occurs once per page.
		//		Called by Tooltip widgets which are just containers to hold
		//		the markup
		// tags:
		//		protected

		// duration: Integer
		//		Milliseconds to fade in/fade out
		duration: rias.defaultDuration,

		templateString:
			'<div class="dijitTooltip dijitTooltipLeft" id="dojoTooltip" data-dojo-attach-event="mouseenter:onMouseEnter,mouseleave:onMouseLeave">' +
				'<div class="dijitTooltipConnector" data-dojo-attach-point="connectorNode"></div>' +
				'<div class="dijitTooltipContainer dijitTooltipContents" data-dojo-attach-point="containerNode" role="alert"></div>' +
			'</div>',

		//修改
		postCreate: function(){
			this.ownerDocumentBody.appendChild(this.domNode);

			this.bgIframe = new BackgroundIframe(this.domNode);

			// Setup fade-in and fade-out functions.
			this.fadeIn = rias.fx.fadeIn({ node: this.domNode, duration: this.duration, onEnd: rias.hitch(this, "_onShow") });
			this.fadeOut = rias.fx.fadeOut({ node: this.domNode, duration: this.duration, onEnd: rias.hitch(this, "_onHide") });

			this.inherited(arguments);
		},

		show: function(innerHTML, aroundNode, position, rtl, textDir, onMouseEnter, onMouseLeave){
			// summary:
			//		Display tooltip w/specified contents to right of specified node
			//		(To left if there's no space on the right, or if rtl == true)
			// innerHTML: String
			//		Contents of the tooltip
			// aroundNode: DomNode|dijit/place.__Rectangle
			//		Specifies that tooltip should be next to this node / area
			// position: String[]?
			//		List of positions to try to position tooltip (ex: ["right", "above"])
			// rtl: Boolean?
			//		Corresponds to `WidgetBase.dir` attribute, where false means "ltr" and true
			//		means "rtl"; specifies GUI direction, not text direction.
			// textDir: String?
			//		Corresponds to `WidgetBase.textdir` attribute; specifies direction of text.
			// onMouseEnter: Function?
			//		Callback function for mouse enter on tooltip
			// onMouseLeave: Function?
			//		Callback function for mouse leave on tooltip

			if(this.aroundNode && this.aroundNode === aroundNode && this.containerNode.innerHTML == innerHTML){
				return;
			}

			if(this.fadeOut.status() == "playing"){
				// previous tooltip is being hidden; wait until the hide completes then show new one
				this._onDeck=arguments;
				return;
			}
			this.containerNode.innerHTML=innerHTML;

			if(textDir){
				this.set("textDir", textDir);
			}

			this.containerNode.align = rtl? "right" : "left"; //fix the text alignment

			var pos = rias.dom.positionAround(this.domNode, aroundNode,
				position && position.length ? position : Widget.defaultPosition, !rtl, rias.hitch(this, "orient"));

			// Position the tooltip connector for middle alignment.
			// This could not have been done in orient() since the tooltip wasn't positioned at that time.
			var aroundNodeCoords = pos.aroundNodePos;
			if(pos.corner.charAt(0) == 'M' && pos.aroundCorner.charAt(0) == 'M'){
				this.connectorNode.style.top = aroundNodeCoords.y + ((aroundNodeCoords.h - this.connectorNode.offsetHeight) >> 1) - pos.y + "px";
				this.connectorNode.style.left = "";
			}else if(pos.corner.charAt(1) == 'M' && pos.aroundCorner.charAt(1) == 'M'){
				this.connectorNode.style.left = aroundNodeCoords.x + ((aroundNodeCoords.w - this.connectorNode.offsetWidth) >> 1) - pos.x + "px";
			}else{
				// Not *-centered, but just above/below/after/before
				this.connectorNode.style.left = "";
				this.connectorNode.style.top = "";
			}

			// show it
			rias.dom.setStyle(this.domNode, "opacity", 0);
			this.fadeIn.play();
			this.isShowingNow = true;
			this.aroundNode = aroundNode;

			this.onMouseEnter = onMouseEnter || noop;
			this.onMouseLeave = onMouseLeave || noop;
		},

		orient: function(/*DomNode*/ node, /*String*/ aroundCorner, /*String*/ tooltipCorner, /*Object*/ spaceAvailable, /*Object*/ aroundNodeCoords){
			// summary:
			//		Private function to set CSS for tooltip node based on which position it's in.
			//		This is called by the dijit popup code.   It will also reduce the tooltip's
			//		width to whatever width is available
			// tags:
			//		protected

			this.connectorNode.style.top = ""; //reset to default

			var heightAvailable = spaceAvailable.h,
				widthAvailable = spaceAvailable.w;

			node.className = "dijitTooltip " +
				{
					"MR-ML": "dijitTooltipRight",
					"ML-MR": "dijitTooltipLeft",
					"TM-BM": "dijitTooltipAbove",
					"BM-TM": "dijitTooltipBelow",
					"BL-TL": "dijitTooltipBelow dijitTooltipABLeft",
					"TL-BL": "dijitTooltipAbove dijitTooltipABLeft",
					"BR-TR": "dijitTooltipBelow dijitTooltipABRight",
					"TR-BR": "dijitTooltipAbove dijitTooltipABRight",
					"BR-BL": "dijitTooltipRight",
					"BL-BR": "dijitTooltipLeft"
				}[aroundCorner + "-" + tooltipCorner];

			// reset width; it may have been set by orient() on a previous tooltip show()
			this.domNode.style.width = "auto";

			// Reduce tooltip's width to the amount of width available, so that it doesn't overflow screen.
			// Note that sometimes widthAvailable is negative, but we guard against setting style.width to a
			// negative number since that causes an exception on IE.
			var size = rias.dom.position(this.domNode);
			if(rias.has("ie") || rias.has("trident")){
				// workaround strange IE bug where setting width to offsetWidth causes words to wrap
				size.w += 2;
			}

			var width = Math.min((Math.max(widthAvailable,1)), size.w);

			rias.dom.setMarginBox(this.domNode, {w: width});

			// Reposition the tooltip connector.
			if(tooltipCorner.charAt(0) == 'B' && aroundCorner.charAt(0) == 'B'){
				var bb = rias.dom.position(node);
				var tooltipConnectorHeight = this.connectorNode.offsetHeight;
				if(bb.h > heightAvailable){
					// The tooltip starts at the top of the page and will extend past the aroundNode
					var aroundNodePlacement = heightAvailable - ((aroundNodeCoords.h + tooltipConnectorHeight) >> 1);
					this.connectorNode.style.top = aroundNodePlacement + "px";
					this.connectorNode.style.bottom = "";
				}else{
					// Align center of connector with center of aroundNode, except don't let bottom
					// of connector extend below bottom of tooltip content, or top of connector
					// extend past top of tooltip content
					this.connectorNode.style.bottom = Math.min(
						Math.max(aroundNodeCoords.h/2 - tooltipConnectorHeight/2, 0),
						bb.h - tooltipConnectorHeight) + "px";
					this.connectorNode.style.top = "";
				}
			}else{
				// reset the tooltip back to the defaults
				this.connectorNode.style.top = "";
				this.connectorNode.style.bottom = "";
			}

			return Math.max(0, size.w - widthAvailable);
		},

		_onShow: function(){
			// summary:
			//		Called at end of fade-in operation
			// tags:
			//		protected
			if(rias.has("ie")){
				// the arrow won't show up on a node w/an opacity filter
				this.domNode.style.filter="";
			}
		},

		hide: function(aroundNode){
			// summary:
			//		Hide the tooltip

			if(this._onDeck && this._onDeck[1] == aroundNode){
				// this hide request is for a show() that hasn't even started yet;
				// just cancel the pending show()
				this._onDeck=null;
			}else if(this.aroundNode === aroundNode){
				// this hide request is for the currently displayed tooltip
				this.fadeIn.stop();
				this.isShowingNow = false;
				this.aroundNode = null;
				this.fadeOut.play();
			}else{
				// just ignore the call, it's for a tooltip that has already been erased
			}

			this.onMouseEnter = this.onMouseLeave = noop;
		},

		_onHide: function(){
			// summary:
			//		Called at end of fade-out operation
			// tags:
			//		protected

			this.domNode.style.cssText="";	// to position offscreen again
			this.containerNode.innerHTML="";
			if(this._onDeck){
				// a show request has been queued up; do it now
				this.show.apply(this, this._onDeck);
				this._onDeck=null;
			}
		}
	});

	if(rias.has("dojo-bidi")){
		MasterTooltip.extend({
			_setAutoTextDir: function(/*Object*/node){
				// summary:
				//		Resolve "auto" text direction for children nodes
				// tags:
				//		private

				this.applyTextDir(node);
				rias.forEach(node.children, function(child){ this._setAutoTextDir(child); }, this);
			},

			_setTextDirAttr: function(/*String*/ textDir){
				// summary:
				//		Setter for textDir.
				// description:
				//		Users shouldn't call this function; they should be calling
				//		set('textDir', value)
				// tags:
				//		private

				this._set("textDir", textDir);

				if (textDir == "auto"){
					this._setAutoTextDir(this.containerNode);
				}else{
					this.containerNode.dir = this.textDir;
				}
			}
		});
	}

	function getAround(any){
		if(rias.isDijit(any)){
			return any.domNode;
		}
		return any;
	}
	///dijit/Tooltip

	rias.popTooltip = function(args){
		if(args.positions){
			args.positions = rias.map(args.positions, function(val){
				return {after: "after-centered", before: "before-centered"}[val] || val;
			});
		}
		if(!Widget._masterTT){
			///增加 ownerRiasw
			dijit._masterTT = Widget._masterTT = new Widget._MasterTooltip({
				ownerRiasw: rias.webApp,
				_riaswIdOfModule: "_MasterTooltip"
			});
		}
		//return Widget._masterTT.show(innerHTML, aroundNode, position, rtl, textDir, onMouseEnter, onMouseLeave);
		return Widget._masterTT.show(args.content, getAround(args.around), args.positions, args.rtl, args.textDir, args.onMouseEnter, args.onMouseLeave);
	};
	rias.showTooltip = dijit.showTooltip = function(innerHTML, aroundNode, position, rtl, textDir, onMouseEnter, onMouseLeave){
		return rias.popTooltip({
			content: innerHTML,
			around: aroundNode,
			positions: position,
			rtl: rtl,
			textDir: textDir,
			onMouseEnter: onMouseEnter,
			onMouseLeave: onMouseLeave
		});
	};
	rias.hideTooltip = dijit.hideTooltip = function(aroundNode){
		return Widget._masterTT && Widget._masterTT.hide(getAround(aroundNode));
	};

	var DORMANT = "DORMANT",
		SHOW_TIMER = "SHOW TIMER",
		SHOWING = "SHOWING",
		HIDE_TIMER = "HIDE TIMER";
	var riaswType = "rias.riasw.widget.Tooltip";
	var Widget = rias.declare(riaswType, [_Widget], {
		// summary:
		//		Pops up a tooltip (a help message) when you hover over a node.
		//		Also provides static show() and hide() methods that can be used without instantiating a dijit/Tooltip.

		// label: String
		//		HTML to display in the tooltip.
		//		Specified as innerHTML when creating the widget from markup.
		label: "",

		// showDelay: Integer
		//		Number of milliseconds to wait after hovering over/focusing on the object, before
		//		the tooltip is displayed.
		showDelay: 400,

		// hideDelay: Integer
		//		Number of milliseconds to wait after unhovering the object, before
		//		the tooltip is hidden.  Note that blurring an object hides the tooltip immediately.
		hideDelay: 400,

		// connectId: String|String[]|DomNode|DomNode[]
		//		Id of domNode(s) to attach the tooltip to.
		//		When user hovers over specified dom node(s), the tooltip will appear.
		connectId: [],

		// position: String[]
		//		See description of `dijit/Tooltip.defaultPosition` for details on position parameter.
		position: [],

		// selector: String?
		//		CSS expression to apply this Tooltip to descendants of connectIds, rather than to
		//		the nodes specified by connectIds themselves.    Useful for applying a Tooltip to
		//		a range of rows in a table, tree, etc.   Use in conjunction with getContent() parameter.
		//		Ex: connectId: myTable, selector: "tr", getContent: function(node){ return ...; }
		//
		//		The application must require() an appropriate level of dojo/query to handle the selector.
		selector: "",

		// TODO: in 2.0 remove support for multiple connectIds.   selector gives the same effect.
		// So, change connectId to a "", remove addTarget()/removeTarget(), etc.

		//修改
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

		//修改
		addTarget: function(/*OomNode|String*/ node){
			// TODO: remove in 2.0 and just use set("connectId", ...) interface
			node = rias.dom.byId(node);
			if(!rias.contains(this._connectIds, node)){
				this.set("connectId", this._connectIds.concat(node));
			}
		},
		//修改
		removeTarget: function(/*DomNode|String*/ node){
			// TODO: remove in 2.0 and just use set("connectId", ...) interface
			this._onUnHover();
			node = rias.dom.byId(node);
			var idx = rias.indexOf(this._connectIds, node);
			if(idx >= 0){
				// remove id (modifies original this._connectIds but that's OK in this case)
				this._connectIds.splice(idx, 1);
				this.set("connectId", this._connectIds);
			}
		},

		buildRendering: function(){
			this.inherited(arguments);
			rias.dom.addClass(this.domNode,"dijitTooltipData");
		},

		startup: function(){
			this.inherited(arguments);

			// If this tooltip was created in a template, or for some other reason the specified connectId[s]
			// didn't exist during the widget's initialization, then connect now.
			var ids = this.connectId;
			rias.forEach(rias.isArrayLike(ids) ? ids : [ids], this.addTarget, this);
		},

		//修改
		getContent: function(/*DomNode*/ node){
			// summary:
			//		User overridable function that return the text to display in the tooltip.
			// tags:
			//		extension
			node = rias.by(node);
			node = node ? node.get("tooltip") : "";
			return node || this.label || this.domNode.innerHTML;
		},

		// state: [private readonly] String
		//		One of:
		//
		//		- DORMANT: tooltip not SHOWING
		//		- SHOW TIMER: tooltip not SHOWING but timer set to show it
		//		- SHOWING: tooltip displayed
		//		- HIDE TIMER: tooltip displayed, but timer set to hide it
		state: DORMANT,
		//修改
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
						Widget.hide(this._connectNode);
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
					Widget.show(content, this._connectNode, this.position, !this.isLeftToRight(), this.textDir,
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

		_onHover: function(/*DomNode*/ target){
			// summary:
			//		Despite the name of this method, it actually handles both hover and focus
			//		events on the target node, setting a timer to show the tooltip.
			// tags:
			//		private

			if(this._connectNode && target != this._connectNode){
				// Tooltip is displaying for another node
				this.set("state", DORMANT);
			}
			this._connectNode = target;		// _connectNode means "tooltip currently displayed for this node"

			this.set("state", SHOW_TIMER);	// no-op if show-timer already set, or if already showing
		},

		_onUnHover: function(/*DomNode*/ target){
			// summary:
			//		Handles mouseleave event on the target node, hiding the tooltip.
			// tags:
			//		private

			this.set("state", HIDE_TIMER);		// no-op if already dormant, or if hide-timer already set
		},

		// open() and close() aren't used anymore, except from the _BidiSupport/misc/Tooltip test.
		// Should probably remove for 2.0, but leaving for now.
		open: function(/*DomNode*/ target){
			// summary:
			//		Display the tooltip; usually not called directly.
			// tags:
			//		private

			this.set("state", DORMANT);
			this._connectNode = target;		// _connectNode means "tooltip currently displayed for this node"
			this.set("state", SHOWING);
		},

		close: function(){
			// summary:
			//		Hide the tooltip or cancel timer for show of tooltip
			// tags:
			//		private

			this.set("state", DORMANT);
		},

		onShow: function(/*===== target, position =====*/){
			// summary:
			//		Called when the tooltip is shown
			// tags:
			//		callback
		},

		onHide: function(){
			// summary:
			//		Called when the tooltip is hidden
			// tags:
			//		callback
		},

		destroy: function(){
			this.set("state", DORMANT);

			// Remove connections manually since they aren't registered to be removed by _WidgetBase
			rias.forEach(this._connections || [], function(nested){
				rias.forEach(nested, function(handle){ handle.remove(); });
			}, this);

			this.inherited(arguments);
		}

	});
	Widget._MasterTooltip = MasterTooltip;		// for monkey patching
	Widget.show = rias.showTooltip;		// export function through module return value
	Widget.hide = rias.hideTooltip;		// export function through module return value

	Widget.defaultPosition = ["after-centered", "before-centered"];

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