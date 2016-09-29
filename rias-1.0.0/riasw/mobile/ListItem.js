
//RIAStudio client runtime widget - ListItem

define([
	"rias",
	"dojox/mobile/ListItem"
], function(rias, _Widget){

	rias.theme.loadMobileThemeCss([
		"ListItem.css"
	]);

	_Widget.extend({

		layoutOnResize: true,
		variableHeight: true,

		_setMoveToAttr: function(moveTo){
			this._set("moveTo", moveTo);
			if(typeof(moveTo) == "string"){
				// removes a leading hash mark (#) and params if exists
				// ex. "#bar&myParam=0003" -> "bar"
				moveTo = moveTo.replace(/^#?([^&?]+).*/, "$1");
			}
			moveTo = rias.by(moveTo, this._riasrModule);
			this.moveTo = moveTo ? moveTo.id : this.moveTo;
			this._updateHandles();
		},

		buildRendering: function(){
			this._templated = !!this.templateString; // true if this widget is templated
			if(!this._templated){
				// Create root node if it wasn't created by _TemplatedMixin
				this.domNode = this.containerNode = this.srcNodeRef || rias.dom.create(this.tag);
			}
			this.inherited(arguments);

			if(this.selected){
				rias.dom.addClass(this.domNode, this._selClass);
			}
			if(this.header){
				rias.dom.replaceClass(this.domNode, "mblEdgeToEdgeCategory", this.baseClass);
			}

			if(!this._templated){
				this.labelNode =
					rias.dom.create("div", {className:"mblListItemLabel"});
				var ref = this.srcNodeRef;
				if(ref && ref.childNodes.length === 1 && ref.firstChild.nodeType === 3){///3 是 Text
					// if ref has only one text node, regard it as a label
					this.labelNode.appendChild(ref.firstChild);
				}
				this.domNode.appendChild(this.labelNode);
			}
			this._layouts = [];
		},
		startup: function(){
			if(this._started){ return; }
			var parent = this.getParent();
			var opts = this.getTransOpts();
			// When using a template, labelNode may be created via an attach point.
			// The attach points are not yet set when ListItem.buildRendering()
			// executes, hence the need to use them in startup().
			if((!this._templated || this.labelNode) && this.anchorLabel){
				this.labelNode.style.display = "inline"; // to narrow the text region
				this.labelNode.style.cursor = "pointer";
				this.connect(this.labelNode, "onclick", "_onClick");
				this.onTouchStart = function(e){
					return (e.target !== this.labelNode);
				};
			}

			this.inherited(arguments);

			if(rias.dom.hasClass(this.domNode, "mblVariableHeight")){
				this.variableHeight = true;
			}
			//if(this.variableHeight){
			//	rias.dom.addClass(this.domNode, "mblVariableHeight");
			//	this.defer("layoutVariableHeight");
			//}

			if(!this._isOnLine){
				this._isOnLine = true;
				this.set({
					// retry applying the attributes for which the custom setter delays the actual
					// work until _isOnLine is true
					icon: this._pending_icon !== undefined ? this._pending_icon : this.icon,
					deleteIcon: this._pending_deleteIcon !== undefined ? this._pending_deleteIcon : this.deleteIcon,
					rightIcon: this._pending_rightIcon !== undefined ? this._pending_rightIcon : this.rightIcon,
					rightIcon2: this._pending_rightIcon2 !== undefined ? this._pending_rightIcon2 : this.rightIcon2,
					uncheckIcon: this._pending_uncheckIcon !== undefined ? this._pending_uncheckIcon : this.uncheckIcon
				});
				// Not needed anymore (this code executes only once per life cycle):
				delete this._pending_icon;
				delete this._pending_deleteIcon;
				delete this._pending_rightIcon;
				delete this._pending_rightIcon2;
				delete this._pending_uncheckIcon;
			}
			if(parent && parent.select){
				// retry applying the attributes for which the custom setter delays the actual
				// work until _isOnLine is true.
				this.set("checked", this._pendingChecked !== undefined ? this._pendingChecked : this.checked);
				rias.dom.setAttr(this.domNode, "role", "option");
				if(this._pendingChecked || this.checked){
					rias.dom.setAttr(this.domNode, "aria-selected", "true");
				}
				// Not needed anymore (this code executes only once per life cycle):
				delete this._pendingChecked;
			}
			this.setArrow();
			//this.layoutChildren();
		},

		layoutVariableHeight: function(force){
			// summary:
			//		Lays out the current item with variable height.
			var h = this.domNode.offsetHeight;
			if(!force && h === this.domNodeHeight){
				return;
			}
			this.domNodeHeight = h;
			rias.forEach(this._layouts.concat([
				this.rightTextNode,
				this.rightIcon2Node,
				this.rightIconNode,
				this.uncheckIconNode,
				this.iconNode,
				this.deleteIconNode,
				this.knobIconNode
			]), function(n){
				if(n){
					var domNode = this.domNode, w = rias.by(n);
					if(w && w.resize){
						w.resize();
					}
					var f = function(){
						var t = Math.round((domNode.offsetHeight - n.offsetHeight) / 2) - rias.dom.getStyle(domNode, "paddingTop");
						n.style.marginTop = t + "px";
					};
					if(n.offsetHeight === 0 && n.tagName === "IMG"){
						n.onload = f;
					}else{
						f();
					}
				}
			}, this);
		},
		layoutChildren: function(){
			var centerNode,
				wr = 0, wl = 0;
			this._layouts = [];
			rias.forEach(this.domNode.childNodes, function(n){
				if(n.nodeType !== 1){ return; }
				var region = n.getAttribute("region") || // TODO: Remove the non-HTML5-compliant attribute in 2.0
					n.getAttribute("data-mobile-layout") ||
					(rias.registry.byNode(n) || {}).region;
				if(region){
					rias.dom.addClass(n, "mblListItemLayout" + region.charAt(0).toUpperCase() + region.substring(1));
					this._layouts.push(n);
					if(region === "center"){
						centerNode = n;
					}else if(region === "left"){
						wl += rias.dom.getMarginBox(n).w;
					}else if(region === "right"){
						wr += rias.dom.getMarginBox(n).w;
					}
				}
			}, this);
			if(centerNode){
				//rias.dom.setStyle(centerNode, "width", (this.domNode.clientWidth - wl - wr) + "px");
				//rias.dom.setStyle(centerNode, "left", wl + "px");
				rias.dom.setMarginBox(centerNode, {
					w: this.domNode.clientWidth - wl - wr,
					l: wl
				});
				this.domNode.insertBefore(centerNode, this.domNode.firstChild);
			}
		},
		resize: function(){
			this.inherited(arguments);
			/*this.layoutChildren();
			if(this.layoutOnResize){
				this.layoutVariableHeight(true);
			}else if(this.variableHeight){
				this.layoutVariableHeight();
			}
			// labelNode may not exist only when using a template (if not created by an attach point)
			if(!this._templated || this.labelNode){
				// If labelNode is empty, shrink it so as not to prevent user clicks.
				this.labelNode.style.display = this.labelNode.firstChild ? "block" : "inline";
			}*/
		}

	});

	var riaswType = "rias.riasw.mobile.ListItem";
	var Widget = rias.declare(riaswType, [_Widget], {
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswListItemIcon",
		iconClass16: "riaswListItemIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
