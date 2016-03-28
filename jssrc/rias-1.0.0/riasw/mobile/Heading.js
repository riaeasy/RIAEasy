
//RIAStudio client runtime widget - Heading

define([
	"rias",
	"dojox/mobile/Heading",
	"rias/riasw/mobile/ToolBarButton",
	"rias/riasw/mobile/View"
], function(rias, _Widget, ToolBarButton){

	rias.theme.loadRiasCss([
		"Heading.css"
	], true);

	var riasType = "rias.riasw.mobile.Heading";
	var Widget = rias.declare(riasType, [_Widget], {

		_setBackAttr: function(/*String*/back){
			// tags:
			//		private
			this._set("back", back);
			if(!this.backButton){
				this.backButton = new ToolBarButton({
					ownerRiasw: this,
					arrow: "left",
					label: back,
					moveTo: this.moveTo,
					back: !this.moveTo && !this.href, // use browser history unless moveTo or href
					href: this.href,
					transition: this.transition,
					transitionDir: -1,
					dir: this.isLeftToRight() ? "ltr" : "rtl"
				});
				this.backButton.placeAt(this.domNode, "first");
			}else{
				this.backButton.set("label", back);
			}
			this.resize();
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswHeadingIcon",
		iconClass16: "riaswHeadingIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
