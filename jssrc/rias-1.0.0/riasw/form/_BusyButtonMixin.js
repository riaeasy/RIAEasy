define([
	"rias"
], function(rias){

	var _BusyButtonMixin = rias.declare("rias.riasw.form._BusyButtonMixin", null, {

		busyLabel: "",
		canBusy: true,
		// isBusy: Boolean
		isBusy: false,
		defaultTimeout: 200,
		timeout: 0,

		// useIcon: Boolean
		//		use a busy icon
		useIcon: true,

		postMixInProperties: function(){
			this.inherited(arguments);
			//if(!this.busyLabel){
			//	this.busyLabel = rias.i18n.message.loading;
			//}
		},
		postCreate: function(){
			// summary:
			//		stores initial label and timeout for reference
			this.inherited(arguments);

			this._initAttr(["isBusy", "timeout"]);
		},
		destroy: function(){
			if(this._timeout){
				clearTimeout(this._timeout);
				this._timeout = undefined;
			}
			//if(this.__busyImg){
			//	this.containerNode.removeChild(this.__busyImg);
			//	this.__busyImg = undefined;
			//}
			this.inherited(arguments);
		},

		formatBusyLabel: function(){
			return this.busyLabel + this.timeout > 0 ? "(" + rias.trunc(this.timeout / 1000) + ")" : ""; /// this.busyLabel
		},
		_onTimeout: function(value, oldValue){
			var self = this;
			if(self._timeout){
				clearTimeout(self._timeout);
				self._timeout = undefined;
			}
			if(value > 0){
				if(value >= 1000){
					value = 1000;
				}
				self._timeout = setTimeout(function(){
					self._timeout = undefined;
					if(self.get("timeout") > 1000){
						if(self.busyLabel){
							self.set("label", self.formatBusyLabel());
						}
						self.set("timeout", self.get("timeout") - 1000);
					}else{
						self.set("timeout", 0);
					}
				}, value);
			}else{
				self.set("isBusy", false);
			}
		},
		_onIsBusy: function(value, oldValue){
			var self = this;
			if(value){
				self._disabled0 = self.get("disabled");
				self.set("disabled", true);
				if(self.busyLabel){
					self._label0 = self.get("label");
				}
				if(rias.likePromise(self.isBusy)){
					rias.when(self.isBusy, function(){
						self.set("isBusy", false);
					});
				}else{
					self.set("timeout", self.defaultTimeout);
				}
			}else{
				self.timeout = 0;
				if(self._timeout){
					clearTimeout(self._timeout);
					self._timeout = undefined;
				}
				if("_disabled0" in self){
					self.set("disabled", self._disabled0 ? self._disabled0 : false);
					self._disabled0 = undefined;
				}
				if("_label0" in self){
					self.set("label", self._label0);
					self._label0 = undefined;
				}
			}
		},

		_onClick: function(e){
			// summary:
			//		on button click the button state gets changed

			// only do something if button is not busy
			if(!this.isBusy){
				var result = this.inherited(arguments);	// calls onClick()
				if(this.canBusy){
					this.set("isBusy", true);
				}
				return result;
			}
			return false;
		}
	});

	return _BusyButtonMixin;
});
