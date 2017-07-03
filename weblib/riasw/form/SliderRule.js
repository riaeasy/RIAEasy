//RIAStudio client runtime widget - SliderRule

define([
	"riasw/riaswBase",
	"riasw/sys/_WidgetBase",
	"riasw/sys/_TemplatedMixin",
	"riasw/form/HSlider"
], function(rias, _WidgetBase, _TemplatedMixin, HSlider) {

	var riaswType = "riasw.form.SliderRule";
	var Widget = rias.declare(riaswType, [_WidgetBase, _TemplatedMixin], {
		// summary:
		//		Hash marks for `riasw/form/HSlider(VSlider)`

		templateString: '<div class="riaswRuleContainer"></div>',

		// values: String[]?
		//		Array of text label to render - evenly spaced from left-to-right or bottom-to-top.
		//		Alternately, minimum and maximum can be specified, to get numeric label.
		values: null,
		steps: -1,///slider.steps
		start: -1,///slider.minimum
		count: -1,///slider.maximum
		sliderPosition: "top",///"top"、"bottom"
		// ruleStyle: String
		//		CSS style to apply to individual hash marks
		ruleStyle: "",

		_onDestroy: function(){
			this.inherited(arguments);
			delete this.slider;
		},

		_genHTML: function(pos, style){
			return '<div class="riaswRuleMark" style="' + (!this.isVertical ? "left:" : "top:") + pos + "%;" +
				this.ruleStyle + (style || "") +
				'"></div>';
		},
		setHTMLs: function(){
			var innerHTML = "",
				values = this.values,
				slider = this.slider,
				start = slider && this.start < 0 ? slider.minimum : this.start,
				count = slider && this.count <= 1 ? slider.maximum - slider.minimum : this.count,
				steps, i, interval, v;
			if(start == undefined){
				start = 0;
			}
			if(count == undefined || count <= 1){
				count = 2;
			}
			if(values && values.length){
				for(i = 0; i < values.length; i++){
					v = values[i];
					if(rias.isObject(v)){
						innerHTML += this._genHTML((v.value - start) / count * 100, rias.dom.styleToString(v.style));
					}else{
						innerHTML += this._genHTML((v - start) / count * 100);
					}
				}
			}else{
				steps = slider && this.steps < 1 ? slider.steps : this.steps;
				if(steps == undefined || steps > count){
					steps = count;
				}
				if(steps <= 1){
					steps = 2;
				}
				interval = 100 / steps;
				steps++;///数量需要 +1。
				/// 100 / steps * 100 不一定是 100，所以，最后一个单独处理。
				if(this.isVertical || this.isLeftToRight()){
					for(i = 0; i < steps - 1; i++){
						innerHTML += this._genHTML(interval * i);
					}
					innerHTML += this._genHTML(100);
				}else{
					for(i = 0; i < steps - 1; i++){
						innerHTML += this._genHTML(100 - interval * i);
					}
					innerHTML += this._genHTML(0);
				}
			}
			this.domNode.innerHTML = innerHTML;
		},

		_onContainerChanged: function(container){
			this.inherited(arguments);
			var slider = rias.is(container, HSlider) ? container : undefined;
			this.slider = slider;
			if(slider){
				this.isVertical = slider._isVertical;
				if(this.sliderPosition === "bottom" || this.sliderPosition === "right"){
					if(slider.bottomDecoration !== this.domNode.parentNode){
						slider.bottomDecoration.appendChild(this.domNode);
					}
				}else if(slider.topDecoration !== this.domNode.parentNode){
					slider.topDecoration.appendChild(this.domNode);
				}
				this.setHTMLs();
			}
		}
	});

	Widget._riasdMeta = {
		visual: true,
		initialSize: {},
		//resizable: "none",
		allowedChild: "none",
		allowedParent: "riasw.form.HSlider, riasw.form.VSlider",
		style: "height:5px;",
		"property": {
			"ruleStyle": {
				"datatype": "string",
				"title": "Rule Style",
				"description": "CSS style to apply to individual hash marks"
			}
		}
	};

	return Widget;

});