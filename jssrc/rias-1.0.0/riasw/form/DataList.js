define([
	"rias",
	"rias/riasw/store/MemoryStore"
], function(rias, MemoryStore){

	// module:
	//		dijit/form/DataList

	function toItem(/*DOMNode*/ option){
		// summary:
		//		Convert `<option>` node to hash
		return {
			id: option.value,
			value: option.value,
			name: rias.trim(option.innerText || option.textContent || '')
		};
	}

	return rias.declare("rias.riasw.form.DataList", MemoryStore, {
		// summary:
		//		Inefficient but small data store specialized for inlined data via OPTION tags
		//
		// description:
		//		Provides a store for inlined data like:
		//
		//	|	<datalist>
		//	|		<option value="AL">Alabama</option>
		//	|		...

		constructor: function(params, srcNodeRef){
			// summary:
			//		Create the widget.
			// params: Object|null
			//		Hash of initialization parameters for widget, including scalar values (like title, duration etc.)
			//		and functions, typically callbacks like onClick.
			//		The hash can contain any of the widget's properties, excluding read-only properties.
			// srcNodeRef: DOMNode|String
			//		Attach widget to this DOM node.

			// store pointer to original DOM tree
			this.domNode = rias.dom.byId(srcNodeRef);

			rias.mixin(this, params);
			if(this.id){
				rias.registry.add(this); // add to registry so it can be easily found by id
			}
			this.domNode.style.display = "none";

			this.inherited(arguments, [{
				data: rias.dom.query("option", this.domNode).map(toItem)
			}]);
		},

		destroy: function(){
			rias.registry.remove(this.id);
		},

		fetchSelectedItem: function(){
			// summary:
			//		Get the option marked as selected, like `<option selected>`.
			//		Not part of dojo.data API.
			var option = rias.dom.query("> option[selected]", this.domNode)[0] || rias.dom.query("> option", this.domNode)[0];
			return option && toItem(option);
		}
	});
});
