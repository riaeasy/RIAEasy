
//RIAStudio client runtime widget - Switch

define([
	"rias",
	"dojox/mobile/Switch",
	"dojox/mobile/_maskUtils"
], function(rias, _Widget, _maskUtils){

	rias.theme.loadMobileThemeCss([
		"Switch.css"
	]);

	var riaswType = "rias.riasw.mobile.Switch";
	var Widget = rias.declare(riaswType, [_Widget], {

		resize: function(){
			var h = rias.dom.getStyle(this.domNode, "height") + "px";
			rias.dom.setStyle(this.inner, "height", h);
			rias.dom.setStyle(this.left, "height", h);
			rias.dom.setStyle(this.right, "height", h);
			rias.dom.setStyle(this.left.firstChild, "height", h);
			rias.dom.setStyle(this.right.firstChild, "height", h);
			rias.dom.setStyle(this.knob, "height", h);
			rias.dom.setStyle(this.input, "height", h);
			rias.dom.setStyle(this.left.firstChild, "line-height", h);
			rias.dom.setStyle(this.right.firstChild, "line-height", h);
			this.inherited(arguments);
		},

		_createMaskImage: function(){
			if(this._timer){
				this._timer.remove();
				this._timer = undefined;
			}
			if(this._hasMaskImage){ return; }
			var w = rias.dom.getStyle(this.domNode,"width"),
				h = rias.dom.getStyle(this.domNode,"height");
			this._width = (w - rias.dom.getStyle(this.knob,"width"));
			this._hasMaskImage = true;
			var rDef = rias.dom.getStyle(this.left, "borderTopLeftRadius");
			if(rDef == "0px"){
				return;
			}
			var rDefs = rDef.split(" ");
			var rx = parseFloat(rDefs[0]), ry = (rDefs.length == 1) ? rx : parseFloat(rDefs[1]);
			var id = (this.shape+"Mask"+w+h+rx+ry).replace(/\./,"_");

			_maskUtils.createRoundMask(this.switchNode, 0, 0, 0, 0, w, h, rx, ry, 1);
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswSwitchIcon",
		iconClass16: "riaswSwitchIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
