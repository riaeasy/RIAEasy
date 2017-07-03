define([
	"riasw/riaswBase",
	"riasw/sys/_Container",
	"riasw/sys/_KeyNavMixin"
], function(rias, _Container, _KeyNavMixin){


	// module:
	//		riasw/sys/_KeyNavContainer

	return rias.declare("riasw.sys._KeyNavContainer", [_Container, _KeyNavMixin], {
		// summary:
		//		A _Container with keyboard navigation of its children.
		// description:
		//		Provides normalized keyboard and focusing code for Container widgets.
		//		To use this mixin, call connectKeyNavHandlers() in postCreate().
		//		Also, child widgets must implement a focus() method.

		connectKeyNavHandlers: function(/*keys[]*/ prevKeyCodes, /*keys[]*/ nextKeyCodes){
			// summary:
			//		Deprecated.  You can call this in postCreate() to attach the keyboard handlers to the container,
			//		but the preferred method is to override _onLeftArrow() and _onRightArrow(), or
			//		_onUpArrow() and _onDownArrow(), to call focusPrev() and focusNext().
			// prevKeyCodes: keys[]
			//		Key codes for navigating to the previous child.
			// nextKeyCodes: keys[]
			//		Key codes for navigating to the next child.
			// tags:
			//		protected

			// TODO: remove for 2.0, and make subclasses override _onLeftArrow, _onRightArrow etc. instead.

			var keyCodes = (this._keyNavCodes = {});
			var prev = rias.hitch(this, "focusPrev");
			var next = rias.hitch(this, "focusNext");
			rias.forEach(prevKeyCodes, function(code){
				keyCodes[code] = prev;
			});
			rias.forEach(nextKeyCodes, function(code){
				keyCodes[code] = next;
			});
			keyCodes[rias.keys.HOME] = rias.hitch(this, "focusFirstChild");
			keyCodes[rias.keys.END] = rias.hitch(this, "focusLastChild");
		},

		addChild: function(/*_WidgetBase*/ widget, /*int?*/ insertIndex){
			this.inherited(arguments);
			this._startupChild(widget);
		},
		removeChild: function(/*_WidgetBase*/ widget, /*int?*/ insertIndex){
			this.inherited(arguments);
			if(widget){
				if(this.lastFocusedChild === widget){
					this.lastFocusedChild = null;
				}
				if(this.focusedChild === widget){
					///不应该 focusChild，而只需要 set
					//this.focusChild(this.lastFocusedChild || this._getNextFocusableChild(this.focusedChild, -1));
					this.set("focusedChild", this.lastFocusedChild || this._getNextFocusableChild(this.focusedChild, -1));
				}
			}
		},

		///_KeyNavContainer 的 _getFirstChild、_getLastChild、_getNextChild 等，均不检测 focusable，而是允许选择全部 children，便于导航。
		///如果需要检测 focusable，可以在外围根据具体应用检测。
		_getTabOrderChildren: function(){
			///增加
			///TODO:zensst. 按 tabIndex 和 childNodes 排序。
			return this.getChildren();
		},
		_getFirstSelected: function(checkFocusable){
			var c,
				children = this._getTabOrderChildren();
			for(var i = 0, l = children.length; i < l; i++){
				c = children[i];
				if(c && c.get("selected") && (!checkFocusable || c.isFocusable())){
					return children[i];
				}
			}
			return null;
		},
		_getFirstChild: function(){
			// summary:
			//		Returns the first child.
			// tags:
			//		abstract extension
			var children = this._getTabOrderChildren();
			return children.length ? children[0] : null;
		},
		_getLastChild: function(){
			// summary:
			//		Returns the last descendant.
			// tags:
			//		abstract extension
			var children = this._getTabOrderChildren();
			return children.length ? children[children.length - 1] : null;
		},
		_getNextChild: function(child, dir){
			///增加，用于覆盖 _KeyNavMixin 的 _getNextChild
			var children = this._getTabOrderChildren(),
				i = children.indexOf(child);
			/// 这里不应该检测 tabCycle，而应该返回真实的 child，否则容易造成循环。
			/// tabCycle 的检测建议放到外围。
			//if(dir === -1){
			//	return i > 0 ? children[i - 1] : this.tabCycle && children.length ? children[children.length - 1] : null;
			//}
			//return i < 0 ? children[0] : i < children.length - 1 ? children[i + 1] : this.tabCycle ? children[0] : null;
			if(dir === -1){
				return i > 0 ? children[i - 1] : null;
			}
			return i < 0 ? children[0] : i < children.length - 1 ? children[i + 1] : null;
		},
		focusNext: function(){
			// summary:
			//		Focus the next widget
			// tags:
			//		protected
			this.focusChild(this._getNextFocusableChild(this.focusedChild, 1));
		},
		focusPrev: function(){
			// summary:
			//		Focus the last focusable node in the previous widget
			//		(ex: go to the ComboButton icon section rather than button section)
			// tags:
			//		protected
			this.focusChild(this._getNextFocusableChild(this.focusedChild, -1));
		},

		childSelector: function(/*DOMNode*/ node){
			// Implement _KeyNavMixin.childSelector, to identify focusable child nodes.
			// If we allowed a dojo/query dependency from this module this could more simply be a string "> *"
			// instead of this function.

			node = rias.rt.byNode(node);
			return node && node.getParent() === this;
		}

	});
});
