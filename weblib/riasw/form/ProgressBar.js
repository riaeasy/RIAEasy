define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/sys/_CssStateMixin",
	"riasw/form/_FormWidgetMixin"
], function(rias, _WidgetBase, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin){

	var riaswType = "riasw.form.ProgressBar";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin, _CssStateMixin, _FormWidgetMixin], {
		// summary:
		//		A progress indication widget, showing the amount completed
		//		(often the percentage completed) of a task.

		// value: String (Percentage or Number)
		//		Number or percentage indicating amount of task completed.
		//		With "%": percentage value, 0% <= value <= 100%, or
		//		without "%": absolute value, 0 <= value <= maximum.
		value: "",
		showPercent: true,

		// maximum: [const] Float
		//		Max sample number
		maximum: 100,

		// places: [const] Number
		//		Number of places to show in values; 0 by default
		places: 0,

		// label: String?
		//		HTML label on value bar.
		label: "",

		templateString:
			'<div data-dojo-attach-point="focusNode" class="dijitReset riaswProgressBarEmpty" role="progressbar">' +
				'<div data-dojo-attach-point="internalProgress" class="dijitInline riaswProgressBarProgress">' +
					'<div class="dijitInline riaswProgressBarTile" role="presentation"></div>' +
					'<span style="visibility:hidden">&#160;</span>' +
				'</div>' +
				'<div data-dojo-attach-point="labelNode" class="riaswProgressBarLabel" id="${id}_label"></div>' +
			'</div>',
		baseClass: "riaswProgressBar",

		buildRendering: function(){
			this.inherited(arguments);
			this._update();
		},

		_setDirAttr: function(val){
			// Normally _CssStateMixin takes care of this, but we aren't extending it
			var rtl = val.toLowerCase() === "rtl";
			rias.dom.toggleClass(this.domNode, "riaswProgressBarRtl", rtl);
			this.inherited(arguments);
		},

		_update: function(/*Object?*/attributes){
			// summary:
			//		Internal method to change attributes of ProgressBar, similar to set(hash).  Users should call
			//		set("value", ...) rather than calling this method directly.
			// attributes:
			//		May provide value and/or maximum properties on this parameter;
			//		see attribute specs for details.
			// example:
			//	|	myProgressBar._update({});
			//	|	myProgressBar._update({'value': 80});
			//	|	myProgressBar._update({label:"Loading ..." })
			// tags:
			//		private

			// TODO: deprecate this method and use set() instead

			rias.mixin(this, attributes || {});
			var tip = this.internalProgress,
				ap = this.domNode;
			var percent = 1;
			if(String(this.value).indexOf("%") !== -1){
				percent = Math.min(parseFloat(this.value) / 100, 1);
				this.value = percent * this.maximum;
			}else{
				this.value = Math.min(this.value, this.maximum);
				percent = this.maximum ? this.value / this.maximum : 0;
			}
			ap.setAttribute("aria-valuenow", this.value);

			ap.setAttribute("aria-labelledby", this.labelNode.id);
			ap.setAttribute("aria-valuemin", 0);
			ap.setAttribute("aria-valuemax", this.maximum);

			this.labelNode.innerHTML = this.report(percent);

			tip.style.width = (percent * 100) + "%";
			this.onChange();
		},

		_setValueAttr: function(v){
			this._set("value", v);
			this._update({
				value: v
			});
		},

		_setLabelAttr: function(label){
			this._set("label", label);
			this._update();
		},

		report: function(/*float*/percent){
			// summary:
			//		Generates HTML message to show inside value bar (normally indicating amount of task completed).
			//		May be overridden.
			// tags:
			//		extension

			return this.label + (this.showPercent ? " " + rias.number.format(percent, {
				type: "percent",
				places: this.places,
				locale: this.lang
			}) : "&#160;");
		},

		onChange: function(){
			// summary:
			//		Callback fired when value updates.
			// tags:
			//		extension
		}
	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		property: {
		}
	};

	return Widget;
});
