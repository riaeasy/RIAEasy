
define([
	"riasw/riaswBase",
	"riasw/sys/Label"
], function(rias, Label){

	var riaswType = "riasw.sys.TimerLabel";
	var Widget = rias.declare(riaswType, [Label],{

		baseClass: "riaswTimerLabel",

		interval: 1000,
		formatter: "",
		enabled: true,

		_onDestroy: function(){
			this.stopInterval();
			this.inherited(arguments);
		},

		stopInterval: function(){
			if(this._hInterval){
				clearInterval(this._hInterval);
				this._hInterval = undefined;
			}
		},
		startInterval: function(){
			var self = this;
			self._hInterval = setInterval(function(){
				self.refresh();
			}, self.interval);
		},
		_setEnabledAttr: function(value){
			value = !!value;
			this._set("enabled", value);
			if(value){
				this.startInterval();
			}else{
				this.stopInterval();
			}
		},

		getNow: function(){
			return new Date();
		},
		refresh: function(){
			var v = this.getNow(),
				s;
			if(rias.isFunction(this.formatter)){
				s = this.formatter(v);
			}else{
				s = rias.formatDatetime(v, this.formatter);
			}
			this.set("label", s);
		}
	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//allowedChild: "",
		property: {
			interval: {
				datatype: "number",
				title: "interval(ms)"
			},
			formatter: {
				datatype: "string",
				title: "formatter"
			}
		}
	};

	return Widget;
});