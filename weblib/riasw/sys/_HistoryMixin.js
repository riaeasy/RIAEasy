
/// Desktop._HistoryMixin

define([
	"riasw/riaswBase"
], function(rias){

	return rias.declare("riasw.sys._HistoryMixin", null, {
		// _currentPosition:     Integer
		//              Persistent variable which indicates the current position/index in the history
		//              (so as to be able to figure out whether the popState event was triggerd by
		//              a backward or forward action).
		_currentPosition: 0,

		// currentState: Object
		//              Current state
		currentState: {},

		postCreate: function(){
			var self = this;
			self.inherited(arguments);
			this._popstateHandle = this.on(window, "popstate", function(evt){
				self.onPopState(evt);
			});
			this._startTransitionHandle = this.on("startTransition", function(evt){
				self.onStartTransition(evt);
			});
		},
		destroy: function(){
			///注意：没有继承自 Destroyable
			this._startTransitionHandle.remove();
			this._popstateHandle.remove();
			this.inherited(arguments);
		},

		onPopState: function(evt){
			// summary:
			//		Response to riasw/sys/Desktop "popstate" event.
			//
			// evt: Object
			//		Transition options parameter

			// Clean browser's cache and refresh the current page will trigger popState event,
			// but in this situation the application has not started and throws an error.
			// So we need to check application status, if application not STARTED, do nothing.
			if(!this._started || !evt.state ){
				return;
			}

			// Get direction of navigation and update _currentPosition accordingly
			var backward = evt.state.id < this._currentPosition;
			if(backward){
				this._currentPosition -= 1;
			}else{
				this._currentPosition += 1;
			}

			// Publish popState topic and transition to the target view. Important: Use correct transition.
			// Reverse transitionDir only if the user navigates backwards.
			var opts = rias.mixin({
				reverse: backward ? true : false
			}, evt.state);
			opts.transition = backward ? opts.bwdTransition : opts.fwdTransition;
			this.emit("app-transition", {
				viewId: evt.state.target,
				opts: opts
			});
			this.publish("/app/history/popState", evt.state.target);
		},
		onStartTransition: function(evt){
			// summary:
			//		Response to riasw/sys/Desktop "startTransition" event.
			//
			// example:
			//		Use rias.dom.dispatchTransition to trigger "startTransition" event, and this function will response the event. For example:
			//		|	var transOpts = {
			//		|		title:"List",
			//		|		target:"items,list",
			//		|		url: "#items,list"
			//		|		params: {"param1":"p1value"}
			//		|	};
			//		|	rias.dom.dispatchTransition(domNode, transOpts, e);
			//
			// evt: Object
			//		transition options parameter

			var currentHash = window.location.hash;
			var currentView = rias.hash.getTarget(currentHash, this.defaultView);
			var currentParams =  rias.hash.getParams(currentHash);
			var _detail = rias.mixinDeep({}, evt.detail);//rias.clone(evt.detail);
			_detail.target = _detail.title = currentView;
			_detail.url = currentHash;
			_detail.params = currentParams;
			_detail.id = this._currentPosition;

			// Create initial state if necessary
			if(history.length === 1){
				history.pushState(_detail, _detail.href, currentHash);
			}

			// Update the current state
			_detail.bwdTransition = _detail.transition;
			rias.mixin(this.currentState, _detail);
			history.replaceState(this.currentState, this.currentState.href, currentHash);

			// Create a new "current state" history entry
			this._currentPosition += 1;
			evt.detail.id = this._currentPosition;

			var newHash = evt.detail.url || "#" + evt.detail.target;

			if(evt.detail.params){
				newHash = rias.hash.buildWithParams(newHash, evt.detail.params);
			}

			evt.detail.fwdTransition = evt.detail.transition;
			history.pushState(evt.detail, evt.detail.href, newHash);
			//this.currentState = rias.clone(evt.detail);
			this.currentState = rias.mixinDeep({}, evt.detail);

			// Finally: Publish pushState topic
			this.publish("/app/history/pushState", evt.detail.target);
		}
	});
});
