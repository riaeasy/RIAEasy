
//RIAStudio client runtime widget - mobile.BaseMixin

define([
	"rias/riasw/riastudio",
	"dijit/_WidgetBase",
	"dojox/mobile/common",
	//"dojox/mobile/compat",
	//"dojox/mobile/_ItemBase",
	"dojox/mobile/TransitionEvent",
	"dojox/mobile/viewRegistry",
	"dojox/mobile/iconUtils",
	"dojox/mobile/bookmarkable",
	"rias/riasw/mobile/_StoreMixin",
	"rias/riasw/mobile/_StoreListMixin"
], function(rias, _WidgetBase, common, //compat, _ItemBase,
            TransitionEvent, viewRegistry,
            _StoreMixin, _StoreListMixin){

	rias.getObject("rias.riasw.mobile", true);
	rias.riasw.mobile.TransitionEvent = TransitionEvent;
	rias.riasw.mobile.viewRegistry = viewRegistry;

	common.disableResizeAll = true;/// 在 riasCordovaShell 中启动。
	common.resizeAll = function(/*Event?*/evt, /*Widget?*/root){
		// summary:
		//		Calls the resize() method of all the top level resizable widgets.
		// description:
		//		Finds all widgets that do not have a parent or the parent does not
		//		have the resize() method, and calls resize() for them.
		//		If a widget has a parent that has resize(), calling widget's
		//		resize() is its parent's responsibility.
		// evt:
		//		Native event object
		// root:
		//		If specified, searches the specified widget recursively for top-level
		//		resizable widgets.
		//		root.resize() is always called regardless of whether root is a
		//		top level widget or not.
		//		If omitted, searches the entire page.
		function _do(){
			rias.connect.publish("/dojox/mobile/resizeAll", [evt, root]); // back compat
			rias.connect.publish("/dojox/mobile/beforeResizeAll", [evt, root]);
			if(common._resetMinHeight){
				rias.dom.webAppNode.style.minHeight = common.getScreenSize().h + "px";
			}
			common.updateOrient();
			common.detectScreenSize();
			var isTopLevel = function(w){
				var parent = w.getParent && w.getParent();
				return !!((!parent || !parent.resize) && w.resize);
			};
			var resizeRecursively = function(w){
				rias.forEach(w.getChildren(), function(child){
					if(isTopLevel(child)){
						child.resize();
					}
					resizeRecursively(child);
				});
			};
			if(root){
				if(root.resize){
					root.resize();
				}
				resizeRecursively(root);
			}else{
				rias.forEach(rias.filter(rias.registry.toArray(), isTopLevel),
					function(w){
						w.resize();
					});
			}
			rias.connect.publish("/dojox/mobile/afterResizeAll", [evt, root]);
		}
		if(common.disableResizeAll){
			return;
		}
		rias.debounce("rias.riasw.mobile.resizeAll", function(){
			console.debug("rias.riasw.mobile.resizeAll");
			_do();
		}, common, 160, function(){
			console.debug("rias.riasw.mobile.resizeAll pass");
		})();
	};

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


	var riaswType = "rias.riasw.mobile.BaseMixin";
	var Widget = rias.declare(riaswType, null, {
		//_setLayoutAttr: function(value){
		//	this._set("layout", value);
		//}
		common: common

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
