//RIAStudio client runtime widget - Calendar

define([
	"rias",
	"rias/riasw/widget/CalendarLite",
	"dijit/_Widget",
	"dijit/_CssStateMixin",
	"dijit/_TemplatedMixin",
	"rias/riasw/form/DropDownButton"
], function(rias, CalendarLite, _Widget, _CssStateMixin, _TemplatedMixin, DropDownButton) {

	//rias.theme.loadThemeCss([
	//	"riasw/widget/Calendar.css"
	//]);

	var riaswType = "rias.riasw.widget.Calendar";
	var Widget = rias.declare(riaswType, [CalendarLite, _Widget, _CssStateMixin], {

		baseClass: "dijitCalendar",

		// Set node classes for various mouse events, see dijit._CssStateMixin for more details
		cssStateNodes: {
			"decrementMonth": "dijitCalendarArrow",
			"incrementMonth": "dijitCalendarArrow",
			"previousYearLabelNode": "dijitCalendarPreviousYear",
			"nextYearLabelNode": "dijitCalendarNextYear"
		},

		_createMonthWidget: function(){
			// summary:
			//		Creates the drop down button that displays the current month and lets user pick a new one

			return new Widget._MonthDropDownButton({
				ownerRiasw: this,
				id: this.id + "_mddb",
				tabIndex: -1,
				onMonthSelect: rias.hitch(this, "_onMonthSelect"),
				lang: this.lang,
				dateLocaleModule: this.dateLocaleModule
			}, this.monthNode);
		},

		postCreate: function(){
			this.inherited(arguments);

			// Events specific to Calendar, not used in CalendarLite
			this.own(
				rias.on(this.domNode, "keydown", rias.hitch(this, "_onKeyDown")),
				rias.on(this.dateRowsNode, "mouseover", rias.hitch(this, "_onDayMouseOver")),
				rias.on(this.dateRowsNode, "mouseout", rias.hitch(this, "_onDayMouseOut")),
				rias.on(this.dateRowsNode, "mousedown", rias.hitch(this, "_onDayMouseDown")),
				rias.on(this.dateRowsNode, "mouseup", rias.hitch(this, "_onDayMouseUp"))
			);
		},

		_onMonthSelect: function(/*Number*/ newMonth){
			// summary:
			//		Handler for when user selects a month from the drop down list
			// tags:
			//		protected

			// move to selected month, bounding by the number of days in the month
			// (ex: jan 31 --> feb 28, not feb 31)
			var date = new this.dateClassObj(this.currentFocus);
			date.setDate(1);
			date.setMonth(newMonth);
			var daysInMonth = this.dateModule.getDaysInMonth(date);
			var currentDate = this.currentFocus.getDate();
			date.setDate(Math.min(currentDate, daysInMonth));
			this._setCurrentFocusAttr(date);
		},

		_onDayMouseOver: function(/*Event*/ evt){
			// summary:
			//		Handler for mouse over events on days, sets hovered style
			// tags:
			//		protected

			// event can occur on <td> or the <span> inside the td,
			// set node to the <td>.
			var node = rias.dom.containsClass(evt.target, "dijitCalendarDateLabel") ?
					evt.target.parentNode :
					evt.target;

			if(node && (
				(node.dijitDateValue && !rias.dom.containsClass(node, "dijitCalendarDisabledDate"))
					|| node == this.previousYearLabelNode || node == this.nextYearLabelNode
				)){
				rias.dom.addClass(node, "dijitCalendarHoveredDate");
				this._currentNode = node;
			}
		},

		_onDayMouseOut: function(/*Event*/ evt){
			// summary:
			//		Handler for mouse out events on days, clears hovered style
			// tags:
			//		protected

			if(!this._currentNode){
				return;
			}

			// if mouse out occurs moving from <td> to <span> inside <td>, ignore it
			if(evt.relatedTarget && evt.relatedTarget.parentNode == this._currentNode){
				return;
			}
			var cls = "dijitCalendarHoveredDate";
			if(rias.dom.containsClass(this._currentNode, "dijitCalendarActiveDate")){
				cls += " dijitCalendarActiveDate";
			}
			rias.dom.removeClass(this._currentNode, cls);
			this._currentNode = null;
		},

		_onDayMouseDown: function(/*Event*/ evt){
			var node = evt.target.parentNode;
			if(node && node.dijitDateValue && !rias.dom.containsClass(node, "dijitCalendarDisabledDate")){
				rias.dom.addClass(node, "dijitCalendarActiveDate");
				this._currentNode = node;
			}
		},

		_onDayMouseUp: function(/*Event*/ evt){
			var node = evt.target.parentNode;
			if(node && node.dijitDateValue){
				rias.dom.removeClass(node, "dijitCalendarActiveDate");
			}
		},

		handleKey: function(/*Event*/ evt){
			// summary:
			//		Provides keyboard navigation of calendar.
			// description:
			//		Called from _onKeyDown() to handle keydown on a stand alone Calendar,
			//		and also from `dijit/form/_DateTimeTextBox` to pass a keydown event
			//		from the `dijit/form/DateTextBox` to be handled in this widget
			// returns:
			//		False if the key was recognized as a navigation key,
			//		to indicate that the event was handled by Calendar and shouldn't be propagated
			// tags:
			//		protected
			var increment = -1,
				interval,
				newValue = this.currentFocus;
			switch(evt.keyCode){
				case rias.keys.RIGHT_ARROW:
					increment = 1;
				//fallthrough...
				case rias.keys.LEFT_ARROW:
					interval = "day";
					if(!this.isLeftToRight()){
						increment *= -1;
					}
					break;
				case rias.keys.DOWN_ARROW:
					increment = 1;
				//fallthrough...
				case rias.keys.UP_ARROW:
					interval = "week";
					break;
				case rias.keys.PAGE_DOWN:
					increment = 1;
				//fallthrough...
				case rias.keys.PAGE_UP:
					interval = evt.ctrlKey || evt.altKey ? "year" : "month";
					break;
				case rias.keys.END:
					// go to the next month
					newValue = this.dateModule.add(newValue, "month", 1);
					// subtract a day from the result when we're done
					interval = "day";
				//fallthrough...
				case rias.keys.HOME:
					newValue = new this.dateClassObj(newValue);
					newValue.setDate(1);
					break;
				default:
					return true;
			}

			if(interval){
				newValue = this.dateModule.add(newValue, interval, increment);
			}

			this._setCurrentFocusAttr(newValue);

			return false;
		},

		_onKeyDown: function(/*Event*/ evt){
			// summary:
			//		For handling keydown events on a stand alone calendar
			if(!this.handleKey(evt)){
				evt.stopPropagation();
				evt.preventDefault();
			}
		},

		onValueSelected: function(/*Date*/ /*===== date =====*/){
			// summary:
			//		Deprecated.   Notification that a date cell was selected.  It may be the same as the previous value.
			// description:
			//		Formerly used by `dijit/form/_DateTimeTextBox` (and thus `dijit/form/DateTextBox`)
			//		to get notification when the user has clicked a date.  Now onExecute() (above) is used.
			// tags:
			//		protected
		},

		onChange: function(value){
			this.onValueSelected(value);	// remove in 2.0
		},

		getClassForDate: function(/*===== dateObject, locale =====*/){
			// summary:
			//		May be overridden to return CSS classes to associate with the date entry for the given dateObject,
			//		for example to indicate a holiday in specified locale.
			// dateObject: Date
			// locale: String?
			// tags:
			//		extension

			/*=====
			 return ""; // String
			 =====*/
		}

	});

	Widget._MonthDropDownButton = rias.declare("rias.riasw.widget.Calendar._MonthDropDownButton", DropDownButton, {
		// summary:
		//		DropDownButton for the current month.    Displays name of current month
		//		and a list of month names in the drop down

		onMonthSelect: function(){
		},

		postCreate: function(){
			this.inherited(arguments);
			this.dropDown = new Widget._MonthDropDown({
				ownerRiasw: this,
				id: this.id + "_mdd", //do not change this id because it is referenced in the template
				onChange: this.onMonthSelect
			});
		},
		_setMonthAttr: function(month){
			// summary:
			//		Set the current month to display as a label
			var monthNames = this.dateLocaleModule.getNames('months', 'wide', 'standAlone', this.lang, month);
			this.dropDown.set("months", monthNames);

			// Set name of current month and also fill in spacer element with all the month names
			// (invisible) so that the maximum width will affect layout.   But not on IE6 because then
			// the center <TH> overlaps the right <TH> (due to a browser bug).
			this.containerNode.innerHTML =
				(rias.has("ie") == 6 ? "" : "<div class='dijitSpacer'>" + this.dropDown.domNode.innerHTML + "</div>") +
					"<div class='dijitCalendarMonthLabel dijitCalendarCurrentMonthLabel'>" + monthNames[month.getMonth()] + "</div>";
		}
	});

	Widget._MonthDropDown = rias.declare("rias.riasw.widget.Calendar._MonthDropDown", [_Widget, _TemplatedMixin, _CssStateMixin], {
		// summary:
		//		The list-of-months drop down from the MonthDropDownButton

		// months: String[]
		//		List of names of months, possibly w/some undefined entries for Hebrew leap months
		//		(ex: ["January", "February", undefined, "April", ...])
		months: [],

		baseClass: "dijitCalendarMonthMenu dijitMenu",

		templateString: "<div data-dojo-attach-event='ondijitclick:_onClick'></div>",

		_setMonthsAttr: function(/*String[]*/ months){
			this.domNode.innerHTML = "";
			rias.forEach(months, function(month, idx){
				var div = rias.dom.create("div", {
					className: "dijitCalendarMonthLabel",
					month: idx,
					innerHTML: month
				}, this.domNode);
				div._cssState = "dijitCalendarMonthLabel";	// trigger _CSSStateMixin magic; property, not attribute.
			}, this);
		},

		_onClick: function(/*Event*/ evt){
			this.onChange(rias.dom.getAttr(evt.target, "month"));
		},

		onChange: function(/*Number*/ /*===== month =====*/){
			// summary:
			//		Callback when month is selected from drop down
		}

	});

	Widget._riasdMeta = {
		visual: true,
		iconClass: "riaswCalendarIcon",
		iconClass16: "riaswCalendarIcon16",
		defaultParams: {
			//content: "<input></input>",
			dayWidth: "narrow"
		},
		initialSize: {},
		//allowedChild: "",
		property: {
			name: {
				datatype: "string",
				title: "Name"
			},
			value: {
				datatype: "string",
				format: "date",
				title: "Value"
			},
			dayWidth: {
				datatype: "string",
				option: [
					{
						value: "narrow"
					},
					{
						value: "wide"
					},
					{
						value: "abbr"
					}
				],
				defaultValue: "narrow",
				title: "Day Width"
			},
			datePackage: {
				datatype: "string",
				description: "JavaScript namespace to find Calendar routines.  Uses Gregorian Calendar routines\nat dojo.date by default.",
				hidden: false
			}
		}
	};

	return Widget;
});