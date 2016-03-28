
//RIAStudio client runtime widget - Pane(mobile)

define([
	"rias",
	"dijit/_WidgetBase",
	"dojox/mobile/TransitionEvent",
	"dojox/mobile/viewRegistry",
	"dojox/mobile/iconUtils",
	"dojox/mobile/bookmarkable"
], function(rias, _WidgetBase, TransitionEvent, viewRegistry){

	rias.getObject("rias.riasw.mobile", true);
	rias.riasw.mobile.TransitionEvent = TransitionEvent;
	rias.riasw.mobile.viewRegistry = viewRegistry;

	//var _WidgetBase = rias.getObject("dijit._WidgetBase");
	_WidgetBase.extend({
		transition: "slide",//"slide", "fade", "flip", "cover", "coverv", "dissolve",
		//"reveal", "revealv", "scaleIn", "scaleOut", "slidev", "swirl", "zoomIn", "zoomOut", "cube", "swap"
		transitionDir: 1,

		transitionTo: function(/*String|Object*/moveTo, /*String*/href, /*String*/url, /*String*/scene, transition, transitionDir){
			// summary:
			//		Performs a view transition.
			// description:
			//		Given a transition destination, this method performs a view
			//		transition. This method is typically called when this item
			//		is clicked.
			var opts = (moveTo && typeof(moveTo) === "object") ? moveTo : {
				moveTo: moveTo,
				href: href,
				url: url,
				scene: scene,
				transition: transition || this.transition,
				transitionDir: transitionDir || this.transitionDir
			};
			new TransitionEvent(this.domNode, opts).dispatch();
		}

	});


	//rias.theme.loadRiasCss([
	//	"Pane.css"
	//], true);

	var riasType = "rias.riasw.mobile.BaseMixin";
	var Widget = rias.declare(riasType, null, {
		//_setLayoutAttr: function(value){
		//	this._set("layout", value);
		//}
	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswPaneIcon",
		iconClass16: "riaswPaneIcon16",
		defaultParams: {
		},
		initialSize: {},
		//allowedChild: "",
		property: {
		}
	};

	return Widget;

});
