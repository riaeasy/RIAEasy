//RIAStudio client runtime widget Metadata.

define([
], function() {

	return {
		//"dojo.x": {},
		//"dijit.x": {},
		//"dojox.x": {},
		/// sys =============================== ///
		"riasw.sys.DefaultError": {
			requires: ["riasw/sys/DefaultError"]
		},
		"riasw.sys.Module": {
			requires: ["riasw/sys/Module"]
		},
		"riasw.sys.Dialog": {
			requires: ["riasw/sys/Dialog"]
		},
		"riasw.sys.Scene": {
			requires: ["riasw/sys/Scene"]
		},
		//"riasw.sys.View": {
		//	requires: ["riasw/sys/View"]
		//},
		"riasw.sys.Form": {
			requires: ["riasw/sys/Form"]
		},
		"riasw.sys.Logo": {
			requires: ["riasw/sys/Logo"]
		},
		"riasw.sys.Label": {
			requires: ["riasw/sys/Label"]
		},
		"riasw.sys.Tag": {
			requires: ["riasw/sys/Tag"]
		},
		"riasw.sys.ContainerTag": {
			requires: ["riasw/sys/ContainerTag"]
		},
		"riasw.sys.TimerLabel": {
			requires: ["riasw/sys/TimerLabel"]
		},
		"riasw.sys.Tooltip": {
			requires: ["riasw/sys/Tooltip"]
		},
		"riasw.sys.ToolButton": {
			requires: ["riasw/sys/ToolButton"]
		},
		"riasw.sys.Toolbar": {
			requires: ["riasw/sys/Toolbar"]
		},
		"riasw.sys.ToolbarSeparator": {
			requires: ["riasw/sys/ToolbarSeparator"]
		},
		"riasw.sys.ToolbarLineBreak": {
			requires: ["riasw/sys/ToolbarLineBreak"]
		},
		"riasw.sys.Menu": {
			//dojoType: "dijit.Menu",
			requires: ["riasw/sys/Menu"]
		},
		"riasw.sys.DropDownMenu": {
			//dojoType: "dijit.DropDownMenu",
			requires: ["riasw/sys/DropDownMenu"]
		},
		"riasw.sys.MenuBar": {
			//dojoType: "dijit.MenuBar",
			requires: ["riasw/sys/MenuBar"]
		},
		"riasw.sys.MenuSeparator": {
			//dojoType: "dijit.MenuSeparator",
			requires: ["riasw/sys/MenuSeparator"]
		},
		"riasw.sys.MenuItem": {
			//dojoType: "dijit.MenuItem",
			requires: ["riasw/sys/MenuItem"]
		},
		"riasw.sys.PopupMenuItem": {
			//dojoType: "dijit.PopupMenuItem",
			requires: ["riasw/sys/PopupMenuItem"]
		},
		"riasw.sys.CheckMenuItem": {
			//dojoType: "dijit.CheckedMenuItem",
			requires: ["riasw/sys/CheckMenuItem"]
		},
		"riasw.sys.RadioMenuItem": {
			//dojoType: "dijit.RadioMenuItem",
			requires: ["riasw/sys/RadioMenuItem"]
		},
		"riasw.sys.MenuBarItem": {
			//dojoType: "dijit.MenuBarItem",
			requires: ["riasw/sys/MenuBarItem"]
		},
		"riasw.sys.PopupMenuBarItem": {
			//dojoType: "dijit.PopupMenuBarItem",
			requires: ["riasw/sys/PopupMenuBarItem"]
		},
		/// chart =============================== ///
		/// editor =============================== ///
		"riasw.editor.RichText": {
			requires: ["riasw/editor/RichText"]
		},
		"riasw.editor.HTMLEditor": {
			requires: ["riasw/editor/HTMLEditor"]
		},
		"riasw.editor.CodeEditor": {
			requires: ["riasw/editor/CodeEditor"]
		},
		/// flow =============================== ///
		/// form =============================== ///
		//"riasw.form.Form": {
		//	requires: ["riasw/form/Form"]
		//},
		"riasw.form.ValidationTextBox": {
			requires: ["riasw/form/ValidationTextBox"]
		},
		"riasw.form.TextBox": {
			requires: ["riasw/form/TextBox"]
		},
		"riasw.form.NumberTextBox": {
			requires: ["riasw/form/NumberTextBox"]
		},
		"riasw.form.CurrencyTextBox": {
			requires: ["riasw/form/CurrencyTextBox"]
		},
		"riasw.form.ButtonBox": {
			requires: ["riasw/form/ButtonBox"]
		},
		"riasw.form.ComboBox": {
			requires: ["riasw/form/ComboBox"]
		},
		"riasw.form.MultiComboBox": {
			requires: ["riasw/form/MultiComboBox"]
		},
		"riasw.form.FilteringSelect": {
			requires: ["riasw/form/FilteringSelect"]
		},
		"riasw.form.Select": {
			requires: ["riasw/form/Select"]
		},
		//"riasw.form.MultiSelect": {
		//	requires: ["riasw/form/MultiSelect"]
		//},
		"riasw.form.CheckedMultiSelect": {
			requires: ["riasw/form/CheckedMultiSelect"]
		},
		"riasw.form.Button": {
			requires: ["riasw/form/Button"]
		},
		"riasw.form.Switch": {
			requires: ["riasw/form/Switch"]
		},
		"riasw.form.ToggleButton": {
			requires: ["riasw/form/ToggleButton"]
		},
		"riasw.form.CheckBox": {
			requires: ["riasw/form/CheckBox"]
		},
		"riasw.form.CheckButton": {
			requires: ["riasw/form/CheckButton"]
		},
		"riasw.form.TriStateCheckBox": {
			requires: ["riasw/form/TriStateCheckBox"]
		},
		"riasw.form.RadioButton": {
			requires: ["riasw/form/RadioButton"]
		},
		"riasw.form.DropDownButton": {
			requires: ["riasw/form/DropDownButton"]
		},
		"riasw.form.ComboButton": {
			requires: ["riasw/form/ComboButton"]
		},
		"riasw.form.NumberSpinner": {
			requires: ["riasw/form/NumberSpinner"]
		},
		"riasw.form.TimeSpinner": {
			requires: ["riasw/form/TimeSpinner"]
		},
		"riasw.form.DayTextBox": {
			requires: ["riasw/form/DayTextBox"]
		},
		"riasw.form.DateTextBox": {
			requires: ["riasw/form/DateTextBox"]
		},
		"riasw.form.TimeTextBox": {
			requires: ["riasw/form/TimeTextBox"]
		},
		"riasw.form.Uploader": {
			requires: ["riasw/form/Uploader"]
		},
		"riasw.form.TextArea": {
			requires: ["riasw/form/TextArea"]
		},
		//"riasw.form.ExpandingTextArea": {
		//	requires: ["riasw/form/ExpandingTextArea"]
		//},
		"riasw.form.ProgressBar": {
			requires: ["riasw/form/ProgressBar"]
		},
		"riasw.form.Rating": {
			requires: ["riasw/form/Rating"]
		},
		"riasw.form.SimpleSlider": {
			requires: ["riasw/form/SimpleSlider"]
		},
		"riasw.form.SliderRule": {
			requires: ["riasw/form/SliderRule"]
		},
		"riasw.form.SliderLabels": {
			requires: ["riasw/form/SliderLabels"]
		},
		"riasw.form.HSlider": {
			requires: ["riasw/form/HSlider"]
		},
		"riasw.form.VSlider": {
			requires: ["riasw/form/VSlider"]
		},
		"riasw.form.ColorPalette": {
			requires: ["riasw/form/ColorPalette"]
		},
		"riasw.form.ColorPicker": {
			requires: ["riasw/form/ColorPicker"]
		},
		/// gauge =============================== ///
		/// grid =============================== ///
		"riasw.grid.DGrid": {
			requires: ["riasw/grid/DGrid"]
		},
		/// layout =============================== ///
		"riasw.layout.Panel": {
			requires: ["riasw/layout/Panel"]
		},
		"riasw.layout.ContentPanel": {
			requires: ["riasw/layout/ContentPanel"]
		},
		"riasw.layout.CaptionPanel": {
			requires: ["riasw/layout/CaptionPanel"]
		},
		"riasw.layout.Fieldset": {
			requires: ["riasw/layout/Fieldset"]
		},
		"riasw.layout.TablePanel": {
			requires: ["riasw/layout/TablePanel"]
		},
		"riasw.layout.DockBar": {
			requires: ["riasw/layout/DockBar"]
		},
		"riasw.layout.AccordionPanel": {
			requires: ["riasw/layout/AccordionPanel"]
		},
		"riasw.layout.TabPanel": {
			requires: ["riasw/layout/TabPanel"]
		},
		"riasw.layout.StackPanel": {
			requires: ["riasw/layout/StackPanel"]
		},
		/// mobile =============================== ///
		"riasw.mobile.Button": {
			requires: ["riasw/mobile/Button"]
		},
		"riasw.mobile.ToggleButton": {
			requires: ["riasw/mobile/ToggleButton"]
		},
		"riasw.mobile.Switch": {
			requires: ["riasw/mobile/Switch"]
		},
		"riasw.mobile.TextBox": {
			requires: ["riasw/mobile/TextBox"]
		},
		"riasw.mobile.TextArea": {
			requires: ["riasw/mobile/TextArea"]
		},
		"riasw.mobile.ComboBox": {
			requires: ["riasw/mobile/ComboBox"]
		},
		"riasw.mobile.SearchBox": {
			requires: ["riasw/mobile/SearchBox"]
		},
		"riasw.mobile.CheckBox": {
			requires: ["riasw/mobile/CheckBox"]
		},
		"riasw.mobile.RadioButton": {
			requires: ["riasw/mobile/RadioButton"]
		},
		"riasw.mobile.SpinWheel": {
			requires: ["riasw/mobile/SpinWheel"]
		},
		"riasw.mobile.ProgressIndicator": {
			requires: ["riasw/mobile/ProgressIndicator"]
		},
		"riasw.mobile.ProgressBar": {
			requires: ["riasw/mobile/ProgressBar"]
		},
		"riasw.mobile.View": {
			requires: ["riasw/mobile/View"]
		},
		"riasw.mobile.ScrollableView": {
			requires: ["riasw/mobile/ScrollableView"]
		},
		//"riasw.mobile.TreeView": {
		//	requires: ["riasw/mobile/TreeView"]
		//},
		"riasw.mobile.SwapView": {
			requires: ["riasw/mobile/SwapView"]
		},
		"riasw.mobile.ListItem": {
			requires: ["riasw/mobile/ListItem"]
		},
		"riasw.mobile.Heading": {
			requires: ["riasw/mobile/Heading"]
		},
		"riasw.mobile.PageIndicator": {
			requires: ["riasw/mobile/PageIndicator"]
		},
		"riasw.mobile.TabBar": {
			requires: ["riasw/mobile/TabBar"]
		},
		"riasw.mobile.TabBarButton": {
			requires: ["riasw/mobile/TabBarButton"]
		},
		"riasw.mobile.IconContainer": {
			requires: ["riasw/mobile/IconContainer"]
		},
		"riasw.mobile.IconItem": {
			requires: ["riasw/mobile/IconItem"]
		},
		"riasw.mobile.ToolBarButton": {
			requires: ["riasw/mobile/ToolBarButton"]
		},
		"riasw.mobile.EdgeToEdgeList": {
			requires: ["riasw/mobile/EdgeToEdgeList"]
		},
		"riasw.mobile.EdgeToEdgeStoreList": {
			requires: ["riasw/mobile/EdgeToEdgeStoreList"]
		},
		"riasw.mobile.EdgeToEdgeCategory": {
			requires: ["riasw/mobile/EdgeToEdgeCategory"]
		},
		"riasw.mobile.RoundRectList": {
			requires: ["riasw/mobile/RoundRectList"]
		},
		"riasw.mobile.RoundRectStoreList": {
			requires: ["riasw/mobile/RoundRectStoreList"]
		},
		"riasw.mobile.RoundRectCategory": {
			requires: ["riasw/mobile/RoundRectCategory"]
		},
		/*"riasw.mobile.Pane": {
		 requires: ["riasw/mobile/Pane"]
		 },
		 "riasw.mobile.ContentPane": {
		 requires: ["riasw/mobile/ContentPane"]
		 },
		 "riasw.mobile.Accordion": {
		 requires: ["riasw/mobile/Accordion"]
		 },*/
		"riasw.mobile.Tooltip": {
			requires: ["riasw/mobile/Tooltip"]
		},
		/// store =============================== ///
		"riasw.store.MemoryStore": {
			requires: ["riasw/store/MemoryStore"]
		},
		"riasw.store.JsonXhrStore": {
			requires: ["riasw/store/JsonXhrStore"]
			//},
			//"riasw.store.JsonRestStore": {
			//	requires: "riasw/store/JsonRestStore"]
		},
		/// tree =============================== ///
		"riasw.tree.TreeModel": {
			requires: ["riasw/tree/TreeModel"]
		},
		"riasw.tree.Tree": {
			requires: ["riasw/tree/Tree"]
		},
		/// widget =============================== ///
		"riasw.widget.Audio": {
			requires: ["riasw/widget/Audio"]
		},
		"riasw.widget.Video": {
			requires: ["riasw/widget/Video"]
		},
		"riasw.widget.Calendar": {
			//dojoType: "dijit.Calendar",
			requires: ["riasw/widget/Calendar"]
		},
		"riasw.widget.CalendarX": {
			//dojoType: "dojox.widget.Calendar",
			requires: ["riasw/widget/CalendarX"]
		}
	};

});