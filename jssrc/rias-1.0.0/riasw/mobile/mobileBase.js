
//RIAStudio client mobile runtime widget - base(mobile)

define([
	"rias/riasw/riastudio",
	"dojox/mobile/common",
	"dojox/mobile/compat"
], function(rias, common){

	///common = dojox.mobile;
	rias.getObject("rias.riasw.mobile", true);
	common.disableResizeAll = true;/// 在 riasPhonegapShell 中启动。
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
		}, common, 200, function(){
			console.debug("rias.riasw.mobile.resizeAll pass");
		})();
	};

	return rias;

});
