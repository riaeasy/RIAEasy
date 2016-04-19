//RIAStudio client runtime widget - Calendar

define([
	"rias",
	"dijit/Calendar"
], function(rias, _Widget) {

	rias.theme.loadRiasCss([
		"widget/Calendar.css"
	]);

	_Widget.extend({
		_createMonthWidget: function(){
			// summary:
			//		Creates the drop down button that displays the current month and lets user pick a new one

			return new _Widget._MonthDropDownButton({
				ownerRiasw: this,
				id: this.id + "_mddb",
				tabIndex: -1,
				onMonthSelect: rias.hitch(this, "_onMonthSelect"),
				lang: this.lang,
				dateLocaleModule: this.dateLocaleModule
			}, this.monthNode);
		}
	});
	_Widget._MonthDropDownButton.extend({
		postCreate: function(){
			this.inherited(arguments);
			this.dropDown = new _Widget._MonthDropDown({
				ownerRiasw: this,
				id: this.id + "_mdd", //do not change this id because it is referenced in the template
				onChange: this.onMonthSelect
			});
		}
	});

	var riasType = "rias.riasw.widget.Calendar";
	var Widget = rias.declare(riasType, [_Widget], {
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