
//RIAStudio client runtime widget - viewManager

define([
	"riasw/hostDojo"
], function(rias){

	// module:
	//		riasw/viewManager

	return {
		// summary:
		//		A manager of existing views.

		// length: Number
		//		The number of registered views.
		length: 0,
		
		// hash: [private] Object
		//		The object used to register views.
		hash: {},
		
		// initialView: [private] riasw/layout/View
		//		The initial view.
		initialView: null,

		add: function(/*riasw/layout/View*/ view){
			// summary:
			//		Adds a view to the registry.
			this.hash[view.id] = view;
			this.length++;
		},

		remove: function(/*String*/ id){
			// summary:
			//		Removes a view from the registry.
			if(this.hash[id]){
				delete this.hash[id];
				this.length--;
			}
		},

		getViews: function(){
			// summary:
			//		Gets all registered views.
			// returns: Array
			var arr = [];
			for(var i in this.hash){
				arr.push(this.hash[i]);
			}
			return arr;
		},

		getParentView: function(/*riasw/layout/View*/ view){
			// summary:
			//		Gets the parent view of the specified view.
			// returns: riasw/layout/View
			return rias.viewBy(view);
		},

		getChildViews: function(/*riasw/layout/View*/ parent){
			// summary:
			//		Gets the children views of the specified view.
			// returns: Array
			return rias.filter(this.getViews(), function(v){
				return this.getParentView(v) === parent;
			}, this);
		},

		getEnclosingView: function(/*DomNode*/ node){
			// summary:
			//		Gets the view containing the specified DOM node.
			// returns: riasw/layout/View
			for(var n = node; n && n.tagName !== "BODY"; n = n.parentNode){
				if(n.nodeType === 1 && rias.dom.containsClass(n, "mblView")){
					return registry.byNode(n);
				}
			}
			return null;
		},

		getEnclosingScrollable: function(/*DomNode*/ node){
			// summary:
			//		Gets the dojox/mobile/scrollable object containing the specified DOM node.
			// returns: dojox/mobile/scrollable
			for(var w = registry.getEnclosingWidget(node); w; w = w.getParent()){
				if(w.scrollableParams && w._v){
					return w;
				}
			}
			return null;
		}
	};

});
