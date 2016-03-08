
//RIAStudio client runtime widget - ListItem

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/ListItem"
], function(rias, _Widget){

	rias.theme.loadRiasCss([
		"ListItem.css"
	], true);

	var riasType = "rias.riasw.mobile.ListItem";
	var Widget = rias.declare(riasType, [_Widget], {

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

		layoutChildren: function(){
			var centerNode,
				wr = 0, wl = 0;
			rias.forEach(this.domNode.childNodes, function(n){
				if(n.nodeType !== 1){ return; }
				var region = n.getAttribute("region") || // TODO: Remove the non-HTML5-compliant attribute in 2.0
					n.getAttribute("data-mobile-layout") ||
					(rias.registry.byNode(n) || {}).region;
				if(region){
					rias.dom.addClass(n, "mblListItemLayout" +
						region.charAt(0).toUpperCase() + region.substring(1));
					this._layoutChildren.push(n);
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
		}

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
