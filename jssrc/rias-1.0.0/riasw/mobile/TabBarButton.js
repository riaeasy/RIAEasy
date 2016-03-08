
//RIAStudio client runtime widget - TabBarButton

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/TabBarButton",
	"rias/riasw/mobile/View"
], function(rias, _Widget, View){

	rias.theme.loadRiasCss([
		"TabBar.css"
	], true);

	var riasType = "rias.riasw.mobile.TabBarButton";
	var Widget = rias.declare(riasType, [_Widget], {

		_setMoveToAttr: function(moveTo){
			this._set("moveTo", moveTo);
			this._moveTo = this._getMoveToId();
			this.moveTo = this._moveTo;
			if(this._moveTo){
				var tabPanelNode = rias.by(this._moveTo);
				if(tabPanelNode){
					tabPanelNode = tabPanelNode.domNode ? tabPanelNode.domNode : tabPanelNode;
					rias.dom.setAttr(this.domNode, "aria-controls", this._moveTo);
					rias.dom.setAttr(tabPanelNode, "role", "tabpanel");
					rias.dom.setAttr(tabPanelNode, "aria-labelledby", this.id);

					rias.dom.setAttr(tabPanelNode, "aria-hidden", this.selected ? "false" : "true");
				}
			}
		},
		_getMoveToId: function(){
			// summary:
			//		Return the id of the destination view.
			//		If there is no id, return an empty string.
			var toId = "";
			if(this.moveTo){
				if(this.moveTo === "#"){ return ""; }
				if(typeof(this.moveTo) === "object" && this.moveTo.moveTo){
					toId = this.moveTo.moveTo;
				}else{
					toId = this.moveTo;
				}
				if(toId){
					toId = View.prototype.convertToId.call(this, toId);
				}
			}
			return toId;
		},
		_setSelectedAttr: function(/*Boolean*/selected){
			// summary:
			//		Makes this widget in the selected or unselected state.
			this.inherited(arguments);
			rias.dom.toggleClass(this.domNode, "mblTabBarButtonSelected", !!selected);
			rias.dom.setAttr(this.domNode, "aria-selected", selected ? "true" : "false");
			if(this._moveTo){
				var tabPanelNode = rias.by(this._moveTo);
				if(tabPanelNode){
					tabPanelNode = tabPanelNode.domNode ? tabPanelNode.domNode : tabPanelNode;
					rias.dom.setAttr(tabPanelNode, "aria-hidden", selected ? "false" : "true");
				}
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswTabBarButtonIcon",
		iconClass16: "riaswTabBarButtonIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
