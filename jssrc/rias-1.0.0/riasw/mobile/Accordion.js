
//RIAStudio client runtime widget - Accordion(mobile)

define([
	"rias/riasw/mobile/mobileBase",
	"dojox/mobile/Accordion"
], function(rias, _Widget){

	rias.theme.loadRiasCss([
		"Accordion.css"
	], true);

	var riasType = "rias.riasw.mobile.Accordion";
	var Widget = rias.declare(riasType, [_Widget], {

		resize: function(){
			if(this.fixedHeight){
				var panes = rias.filter(this.getChildren(), function(child){ // active pages
					return child._at.domNode.style.display != "none";
				});
				var openSpace = this.domNode.clientHeight; // height of all panes
				rias.forEach(panes, function(child){
					openSpace -= child._at.domNode.offsetHeight;
				});
				this._openSpace = openSpace > 0 ? openSpace : 0;
				var sel = this.getSelectedPanes()[0];
				if(sel){
					sel.domNode.style[rias.dom.css3.name("transition")] = "";
					sel.domNode.style.height = this._openSpace + "px";
				}else{
					console.error("no selectedPane of " + this.id);
				}
			}
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswAccordionContainerIcon",
		iconClass16: "riaswAccordionContainerIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
