define([
	"rias/riasBase",
	"riasw/hostDojo"
], function(rias){

	// module:
	//		riasw/a11y

	var a11y = {
		// summary:
		//		Accessibility utility functions (keyboard, tab stops, etc.)

		_isElementShown: function(/*Element*/ elem){
			var s = rias.dom.getStyle(elem);
			return (s.visibility !== "hidden") && (s.visibility !== "collapsed") && (s.display !== "none") && (rias.dom.getAttr(elem, "type") !== "hidden");
		},

		hasDefaultTabStop: function(/*Element*/ elem){
			// summary:
			//		Tests if element is tab-navigable even without an explicit tabIndex setting

			// No explicit tabIndex setting, need to investigate node type
			switch(elem.nodeName.toLowerCase()){
				case "a":
					// An <a> w/out a tabindex is only navigable if it has an href
					return rias.dom.hasAttr(elem, "href");
				case "area":
				case "button":
				case "legend":///增加
				case "input":
				case "object":
				case "select":
				case "textarea":
					// These are navigable by default
					return true;
				case "iframe":
					// If it's an editor <iframe> then it's tab navigable.
					var body;
					try{
						// non-IE
						var contentDocument = elem.contentDocument;
						if("designMode" in contentDocument && contentDocument.designMode === "on"){
							return true;
						}
						body = contentDocument.body;
					}catch(e1){
						// contentWindow.document isn't accessible within IE7/8
						// if the iframe.src points to a foreign url and this
						// page contains an element, that could get focus
						try{
							body = elem.contentWindow.document.body;
						}catch(e2){
							return false;
						}
					}
					return body && (body.contentEditable === 'true' ||
						(body.firstChild && body.firstChild.contentEditable === 'true'));
				default:
					return elem.contentEditable === 'true';
			}
		},

		effectiveTabIndex: function(/*Element*/ elem){
			// summary:
			//		Returns effective tabIndex of an element, either a number, or undefined if element isn't focusable.

			/// Tree.focusNode 是 function
			//elem = rias.isDomNode(elem) ? elem : rias.isRiasw(elem) ? rias.isDomNode(elem.focusNode) ? elem.focusNode : elem.domNode : undefined;
			elem = rias.domNodeBy(elem);
			if(elem){
				///disabled 和 visible 只检查自己。要允许 readOnly 的 Node。
				//if (domAttr.get(elem, "disabled") || domAttr.get(elem, "readOnly")) {
				if (rias.dom.getAttr(elem, "disabled") || !rias.dom.isVisible(elem, false)) {
					return undefined;
				} else {
					if (rias.dom.hasAttr(elem, "tabIndex")) {
						return +rias.dom.getAttr(elem, "tabIndex");
					} else {
						return a11y.hasDefaultTabStop(elem) ? 0 : undefined;
					}
				}
			}
			return undefined;
		},

		isTabNavigable: function(/*Element*/ elem){
			// summary:
			//		Tests if an element is tab-navigable

			return a11y.effectiveTabIndex(elem) >= 0;
		},

		isFocusable: function(/*Element*/ elem){
			// summary:
			//		Tests if an element is focusable by tabbing to it, or clicking it with the mouse.

			return a11y.effectiveTabIndex(elem) >= -1;
		},

		_getTabNavigable: function(/*DOMNode*/ root){
			// summary:
			//		Finds descendants of the specified root node.
			// description:
			//		Finds the following descendants of the specified root node:
			//
			//		- the first tab-navigable element in document order
			//		  without a tabIndex or with tabIndex="0"
			//		- the last tab-navigable element in document order
			//		  without a tabIndex or with tabIndex="0"
			//		- the first element in document order with the lowest
			//		  positive tabIndex value
			//		- the last element in document order with the highest
			//		  positive tabIndex value
			var child, first, last, lowest, lowestTabindex, highest, highestTabindex, radioSelected = {};
			var all = [], w;
			var shown = a11y._isElementShown,
				effectiveTabIndex = a11y.effectiveTabIndex;

			function radioName(node){
				// If this element is part of a radio button group, return the name for that group.
				return node && node.tagName.toLowerCase() === "input" &&
					node.type && node.type.toLowerCase() === "radio" &&
					node.name && node.name.toLowerCase();
			}
			function rs(node){
				// substitute checked radio button for unchecked one, if there is a checked one with the same name.
				return radioSelected[radioName(node)] || node;
			}

			var walkTree = function(/*DOMNode*/ parent){
				///TODO:zensst. 按 tabindex 排序 arr，主要问题在 嵌套时 怎样排序。
				var arr = [];
				for(child = parent.firstChild; child; child = child.nextSibling){
					// Skip text elements, hidden elements, and also non-HTML elements (those in custom namespaces) in IE,
					// since show() invokes getAttribute("type"), which crash on VML nodes in IE.
					if(child.nodeType !== 1 || (rias.has("ie") <= 9 && child.scopeName !== "HTML") || !shown(child)){
						continue;
					}

					var tabindex = effectiveTabIndex(child);
					if(tabindex >= 0){
						if(tabindex === 0){
							if(!first){
								first = child;
							}
							last = child;
						}else if(tabindex > 0){
							if(!lowest || tabindex < lowestTabindex){
								lowestTabindex = tabindex;
								lowest = child;
							}
							if(!highest || tabindex >= highestTabindex){
								highestTabindex = tabindex;
								highest = child;
							}
						}
						var rn = radioName(child);
						if(rias.dom.getAttr(child, "checked") && rn){
							radioSelected[rn] = child;
						}
						w = rias.by(rs(child));
						if(w && !arr.contains(w)){
							arr.push(rs(child));
						}
					}
					if(child.nodeName.toUpperCase() !== 'SELECT'){
						rias.concatUnique(arr, walkTree(child));
					}
				}
				return arr;
			};

			root = rias.domNodeBy(root);
			if(shown(root)){
				rias.concatUnique(all, walkTree(root));
			}

			return {
				first: rs(first),
				last: rs(last),
				lowest: rs(lowest),
				highest: rs(highest),
				all: all
			};
		},

		getFirstInTabbingOrder: function(/*String|DOMNode*/ root, /*Document?*/ doc){
			// summary:
			//		Finds the descendant of the specified root node
			//		that is first in the tabbing order
			var elems = a11y._getTabNavigable(rias.dom.byId(root, doc));
			return elems.lowest ? elems.lowest : elems.first; // DomNode
		},

		getLastInTabbingOrder: function(/*String|DOMNode*/ root, /*Document?*/ doc){
			// summary:
			//		Finds the descendant of the specified root node
			//		that is last in the tabbing order
			var elems = a11y._getTabNavigable(rias.dom.byId(root, doc));
			return elems.last ? elems.last : elems.highest; // DomNode
		}
	};

	return a11y;
});
