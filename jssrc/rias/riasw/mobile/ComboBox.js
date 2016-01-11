
//RIAStudio client runtime widget - ComboBox

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/ComboBox",
	"dojox/mobile/_ComboBoxMenu",
	"rias/riasw/mobile/scrollable",
	"rias/riasw/mobile/TextBox"
], function(rias, _Widget, _ComboBoxMenu){

	_ComboBoxMenu.extend({
		onOpen: function(){
			// summary:
			//		Called when the menu opens.
			this.scrollable.init({
				domNode: this.domNode,
				containerNode: this.containerNode
			});
			rias.dom.setStyle(this.containerNode, "width", "100%");
			this.scrollable.scrollTo({x:0, y:0});
		}
	});

	rias.theme.loadCss([
		"ComboBox.css"
	], true);

	var riasType = "rias.riasw.mobile.ComboBox";
	var Widget = rias.declare(riasType, [_Widget], {
		destroy: function(){
			if(this.dropDown){
				rias.destroy(this.dropDown);
			}
			this.inherited(arguments);
		/*},

		closeDropDown: function(){
			if(!this._inFlickAnimation){
				this.inherited(arguments);
			}else{
				console.debug("closeDropDown in FlickAnimation.");
			}*/
		}
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswComboBoxIcon",
		iconClass16: "riaswComboBoxIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
