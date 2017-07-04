
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

		// currentHashDetail: Object
		//              Current state
		currentHashDetail: {},

		postCreate: function(){
			var self = this;
			self.inherited(arguments);
			this._popstateHandle = this.on(window, "popstate", function(evt){
				self.onPopState(evt);
			});
			this._buildHashHandle = this.on("desktop-updateHash", function(evt){
				self.onUpdateHash(evt);
			});
		},
		destroy: function(){
			///注意：没有继承自 Destroyable
			this._buildHashHandle.remove();
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
			opts.transition = backward ? opts.backwardTransition : opts.forwardTransition;
			this.publish("/desktop/history/popState", evt.state.target);
			this.emit("desktop-historyaction", {
				target: evt.state.target,
				opts: opts
			});
		},
		onUpdateHash: function(evt){
			var currentHash = window.location.hash,
				widget = rias.hash.getTargetWidget(currentHash),
				currentParams =  rias.hash.getTargetParams(currentHash),
				_detail = rias.mixinDeep({}, evt.detail);//rias.clone(evt.detail);
			_detail.target = _detail.title = widget ? widget.id : "";
			_detail.url = currentHash;
			_detail.params = currentParams;
			_detail.id = this._currentPosition;

			// Create initial state if necessary
			if(history.length === 1){
				history.pushState(_detail, _detail.href, currentHash);
			}

			// Update the current state
			_detail.backwardTransition = _detail.transition;
			rias.mixin(this.currentHashDetail, _detail);
			history.replaceState(this.currentHashDetail, this.currentHashDetail.href, currentHash);

			// Create a new "current state" history entry
			this._currentPosition += 1;
			evt.detail.id = this._currentPosition;

			widget = rias.by(evt.target);
			var newHash = evt.detail.url || "#";
			newHash = rias.hash.buildHash(newHash, widget, evt.detail.params);

			evt.detail.forwardTransition = evt.detail.transition;
			history.pushState(evt.detail, evt.detail.href, newHash);
			//this.currentHashDetail = rias.clone(evt.detail);
			this.currentHashDetail = rias.mixinDeep({}, evt.detail);

			// Finally: Publish pushState topic
			this.publish("/desktop/history/pushState", evt.detail.target);
		}
	});
});
