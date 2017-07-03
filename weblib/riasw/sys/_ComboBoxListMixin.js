define([
	"riasw/riaswBase",
	"dojo/i18n!riasw/form/nls/ComboBox"
], function(rias){

	// module:
	//		riasw/form/_ComboBoxListMixin

	var ComboBoxListMixin = rias.declare("riasw.form._ComboBoxListMixin", null, {

		// _messages: Object
		//		Holds "next" and "previous" text for paging buttons on drop down
		_messages: null,

		postMixInProperties: function(){
			this.inherited(arguments);
			this._messages = rias.i18n.getLocalization("riasw.form", "ComboBox", this.lang);
		},

		buildRendering: function(){
			this.inherited(arguments);

			// fill in template with i18n messages
			this.previousButton.innerHTML = this._messages.previousMessage;
			this.nextButton.innerHTML = this._messages.nextMessage;
		},

		_setValueAttr: function(/*Object*/ value){
			this._set("value", value);
			this.onChange(value);
		},

		onClick: function(/*DomNode*/ node){
			if(node === this.previousButton){
				this._setSelectedAttr(null);
				this.onPage(-1);
			}else if(node === this.nextButton){
				this._setSelectedAttr(null);
				this.onPage(1);
			}else{
				this.onChange(node);
			}
		},

		// stubs
		onChange: function(/*Number*/ /*===== direction =====*/){
			// summary:
			//		Notifies ComboBox/FilteringSelect that user selected an option.
			// tags:
			//		callback
		},

		onPage: function(/*Number*/ /*===== direction =====*/){
			// summary:
			//		Notifies ComboBox/FilteringSelect that user clicked to advance to next/previous page.
			// tags:
			//		callback
		},

		hide: function(){
			// summary:
			//		Callback from riasw.popupManager code to this widget, notifying it that it closed
			// tags:
			//		private
			this._setSelectedAttr(null);
			return this.inherited(arguments);
		},

		_createOption: function(/*Object*/ item, labelFunc){
			// summary:
			//		Creates an option to appear on the popup list subclassed by
			//		`riasw/form/FilteringSelect`.

			var listitem = this._createListItem();
			var labelObject = labelFunc(item);
			if(labelObject.html){
				listitem.innerHTML = labelObject.label;
			}else{
				listitem.appendChild(
					listitem.ownerDocument.createTextNode(labelObject.label)
				);
			}
			// #3250: in blank options, assign a normal height
			if(listitem.innerHTML === ""){
				listitem.innerHTML = "&#160;";	// &nbsp;
			}

			//修改
			//if(this.applyTextDir){
			//	this.applyTextDir(listitem);
			//}

			return listitem;
		},

		createOptions: function(results, options, labelFunc){
			// summary:
			//		Fills in the items in the drop down list
			// results:
			//		Array of items
			// options:
			//		The options to the query function of the store
			//
			// labelFunc:
			//		Function to produce a label in the drop down list from a dojo.data item

			this.items = results;

			// display "Previous . . ." button
			this.previousButton.style.display = (options.start === 0) ? "none" : "";
			rias.dom.setAttr(this.previousButton, "id", this.id + "_prev");
			// create options using _createOption function defined by parent
			// ComboBox (or FilteringSelect) class
			// #2309:
			//		iterate over cache nondestructively
			rias.forEach(results, function(item, i){
				var listitem = this._createOption(item, labelFunc);
				listitem.setAttribute("item", i);	// index to this.items; use indirection to avoid mem leak
				rias.dom.setAttr(listitem, "id", this.id + i);
				//this.nextButton.parentNode.insertBefore(listitem, this.nextButton);
				this.containerNode.append(listitem);
			}, this);
			// display "Next . . ." button
			var displayMore = false;
			// Try to determine if we should show 'more'...
			if(results.total && !results.total.then && results.total !== -1){
				if((options.start + options.count) < results.total){
					displayMore = true;
				}else if((options.start + options.count) > results.total && options.count === results.length){
					// Weird return from a data store, where a start + count > maxOptions
					// implies maxOptions isn't really valid and we have to go into faking it.
					// And more or less assume more if count == results.length
					displayMore = true;
				}
			}else if(options.count === results.length){
				//Don't know the size, so we do the best we can based off count alone.
				//So, if we have an exact match to count, assume more.
				displayMore = true;
			}

			this.nextButton.style.display = displayMore ? "" : "none";
			rias.dom.setAttr(this.nextButton, "id", this.id + "_next");
		},

		clearResultList: function(){
			// summary:
			//		Clears the entries in the drop down list, but of course keeps the previous and next buttons.
			var container = this.containerNode;
			//while(container.childNodes.length > 2){
			//	container.removeChild(container.childNodes[container.childNodes.length - 2]);
			//}
			while(container.childNodes.length){
				container.removeChild(container.childNodes[container.childNodes.length - 1]);
			}
			this._setSelectedAttr(null);
		},

		highlightFirstOption: function(){
			// summary:
			//		Highlight the first real item in the list (not Previous Choices).
			this.selectFirstNode();
		},

		highlightLastOption: function(){
			// summary:
			//		Highlight the last real item in the list (not More Choices).
			this.selectLastNode();
		},

		selectFirstNode: function(){
			this.inherited(arguments);
			if(this.getHighlightedOption() === this.previousButton){
				this.selectNextNode();
			}
		},

		selectLastNode: function(){
			this.inherited(arguments);
			if(this.getHighlightedOption() === this.nextButton){
				this.selectPreviousNode();
			}
		},

		getHighlightedOption: function(){
			return this.selected;
		}
	});

	return ComboBoxListMixin;
});
