//RIAStudio client runtime widget Mapper.

define([
    "rias"
], function(rias) {

	return [
		//studio:在riasdesigner中定义
		{
			riaswType: "rias.riasw.studio.DefaultError",
			requires: "rias/riasw/studio/DefaultError"
		},{
			riaswType: "rias.riasw.studio.Module",
			requires: "rias/riasw/studio/Module"
		},
		//============================================================================================================//
		//---------------------------------------------------------
		//chart
		//editor
		{
			riaswType: ["rias.riasw.editor.RichText"],
			requires: "rias/riasw/editor/RichText"
		},{
			riaswType: ["rias.riasw.editor.HTMLEditor"],
			requires: "rias/riasw/editor/HTMLEditor"
		},{
			riaswType: ["rias.riasw.editor.CodeEditor"],
			requires: "rias/riasw/editor/CodeEditor"

		},
		//flow
		//form
		{
		/*	riaswType: ["rias.riasw.form.Form"],
			requires: "rias/riasw/form/Form"
		},{*/
			riaswType: ["rias.riasw.form.ValidationTextBox"],
			requires: "rias/riasw/form/ValidationTextBox"
		},{
			riaswType: ["rias.riasw.form.TextBox"],
			requires: "rias/riasw/form/TextBox"
		},{
			riaswType: ["rias.riasw.form.NumberTextBox"],
			requires: "rias/riasw/form/NumberTextBox"
		},{
			riaswType: ["rias.riasw.form.CurrencyTextBox"],
			requires: "rias/riasw/form/CurrencyTextBox"
		},{
			riaswType: ["rias.riasw.form.ButtonBox"],
			requires: "rias/riasw/form/ButtonBox"
		},{
			riaswType: ["rias.riasw.form.ComboBox"],
			requires: "rias/riasw/form/ComboBox"
		},{
			riaswType: ["rias.riasw.form.MultiComboBox"],
			requires: "rias/riasw/form/MultiComboBox"
		},{
			riaswType: ["rias.riasw.form.FilteringSelect"],
			requires: "rias/riasw/form/FilteringSelect"
		},{
			riaswType: ["rias.riasw.form.Select"],
			requires: "rias/riasw/form/Select"
		},{
			riaswType: ["rias.riasw.form.MultiSelect"],
			requires: "rias/riasw/form/MultiSelect"
		},{
			riaswType: ["rias.riasw.form.CheckedMultiSelect"],
			requires: "rias/riasw/form/CheckedMultiSelect"
		},{
			riaswType: ["rias.riasw.form.Button"],
			requires: "rias/riasw/form/Button"
		},{
			riaswType: ["rias.riasw.form.ToggleButton"],
			requires: "rias/riasw/form/ToggleButton"
		},{
			riaswType: ["rias.riasw.form.CheckButton"],
			requires: "rias/riasw/form/CheckButton"
		},{
			riaswType: ["rias.riasw.form.TriStateCheckBox"],
			requires: "rias/riasw/form/TriStateCheckBox"
		},{
			riaswType: ["rias.riasw.form.RadioButton"],
			requires: "rias/riasw/form/RadioButton"
		},{
			riaswType: ["rias.riasw.form.DropDownButton"],
			requires: "rias/riasw/form/DropDownButton"
		},{
			riaswType: ["rias.riasw.form.ComboButton"],
			requires: "rias/riasw/form/ComboButton"
		},{
			riaswType: ["rias.riasw.form._Spinner"],
			requires: "rias/riasw/form/_Spinner"
		},{
			riaswType: ["rias.riasw.form.NumberSpinner"],
			requires: "rias/riasw/form/NumberSpinner"
		},{
			riaswType: ["rias.riasw.form.TimeSpinner"],
			requires: "rias/riasw/form/TimeSpinner"
		},{
			riaswType: ["rias.riasw.form.DateTextBox"],
			requires: "rias/riasw/form/DateTextBox"
		},{
			riaswType: ["rias.riasw.form.TimeTextBox"],
			requires: "rias/riasw/form/TimeTextBox"
		},{
			riaswType: ["rias.riasw.form.Uploader"],
			requires: "rias/riasw/form/Uploader"
		},{
			riaswType: ["rias.riasw.form.TextArea"],
			requires: "rias/riasw/form/TextArea"
		},{
			riaswType: ["rias.riasw.form.ExpandingTextArea"],
			requires: "rias/riasw/form/ExpandingTextArea"
		},{
			riaswType: ["rias.riasw.form.Rating"],
			requires: "rias/riasw/form/Rating"
		},{
			riaswType: ["rias.riasw.form.HRule"],
			requires: "rias/riasw/form/HRule"
		},{
			riaswType: ["rias.riasw.form.HRuleLabels"],
			requires: "rias/riasw/form/HRuleLabels"
		},{
			riaswType: ["rias.riasw.form.HSlider"],
			requires: "rias/riasw/form/HSlider"
		},{
			riaswType: ["rias.riasw.form.VRule"],
			requires: "rias/riasw/form/VRule"
		},{
			riaswType: ["rias.riasw.form.VRuleLabels"],
			requires: "rias/riasw/form/VRuleLabels"
		},{
			riaswType: ["rias.riasw.form.VSlider"],
			requires: "rias/riasw/form/VSlider"
		},
		//gauge
		//grid
		{
			riaswType: ["rias.riasw.grid.Grid"],
			requires: "rias/riasw/grid/DGrid"
		//},{
		//	riaswType: ["rias.riasw.grid.GridX"],
		//	requires: "rias/riasw/grid/GridX"
		},{
			riaswType: ["rias.riasw.grid.DGrid"],
			requires: "rias/riasw/grid/DGrid"
		},
		//html
		{
			riaswType: "rias.riasw.html.Tag",
			requires: "rias/riasw/html/Tag"
		},{
			riaswType: "rias.riasw.html.ContainerTag",
			requires: "rias/riasw/html/ContainerTag"
		},/*{
			riaswType: "rias.riasw.html.Image",
			requires: "rias/riasw/html/Image"
		},{
			riaswType: "rias.riasw.html.A",
			requires: "rias/riasw/html/A"
		},{
			riaswType: "rias.riasw.html.B",
			requires: "rias/riasw/html/B"
		},{
			riaswType: "rias.riasw.html.Div",
			requires: "rias/riasw/html/Div"
		},{
			riaswType: "rias.riasw.html.H1",
			requires: "rias/riasw/html/H1"
		},{
			riaswType: "rias.riasw.html.H2",
			requires: "rias/riasw/html/H2"
		},{
			riaswType: "rias.riasw.html.H3",
			requires: "rias/riasw/html/H3"
		},{
			riaswType: "rias.riasw.html.Hr",
			requires: "rias/riasw/html/Hr"
		},{
			riaswType: "rias.riasw.html.Iframe",
			requires: "rias/riasw/html/Iframe"
		},{
			riaswType: "rias.riasw.html.Label",
			requires: "rias/riasw/html/Label"
		},{
			riaswType: "rias.riasw.html.Li",
			requires: "rias/riasw/html/Li"
		},{
			riaswType: "rias.riasw.html.Span",
			requires: "rias/riasw/html/Span"
		},{
			riaswType: "rias.riasw.html.Table",
			requires: "rias/riasw/html/Table"
		},{
			riaswType: "rias.riasw.html.Td",
			requires: "rias/riasw/html/Td"
		},{
			riaswType: "rias.riasw.html.Tr",
			requires: "rias/riasw/html/Tr"
		},*/
		//layout
		{
			riaswType: ["rias.riasw.layout.Panel"],
			requires: "rias/riasw/layout/Panel"
		},{
			riaswType: ["rias.riasw.layout.ContentPanel"],
			requires: "rias/riasw/layout/ContentPanel"
		},{
			riaswType: ["rias.riasw.layout.CaptionPanel"],
			requires: "rias/riasw/layout/CaptionPanel"
		},{
			riaswType: ["rias.riasw.layout.FieldsetPanel"],
			requires: "rias/riasw/layout/FieldsetPanel"
		},{
			riaswType: ["rias.riasw.layout.TablePanel"],
			requires: "rias/riasw/layout/TablePanel"
		//},{
		//	riaswType: ["rias.riasw.layout.TablePanel"],
		//	requires: "rias/riasw/layout/TableContainer"
		},{
			riaswType: ["rias.riasw.layout.DialogPanel"],
			requires: "rias/riasw/layout/DialogPanel"
		},{
			riaswType: ["rias.riasw.layout.DockBar"],
			requires: "rias/riasw/layout/DockBar"
		//},{
		//	riaswType: ["rias.riasw.layout.BorderContainer"],
		//	requires: "rias/riasw/layout/BorderContainer"
		},{
			riaswType: ["rias.riasw.layout.AccordionPanel"],
			requires: "rias/riasw/layout/AccordionPanel"
		},{
			riaswType: ["rias.riasw.layout.TabPanel"],
			requires: "rias/riasw/layout/TabPanel"
		/*},{
			riaswType: ["rias.riasw.layout.StackController"],
			requires: "rias/riasw/layout/StackController"*/
		},{
			riaswType: ["rias.riasw.layout.StackPanel"],
			requires: "rias/riasw/layout/StackPanel"
		/*},{
			riaswType: ["rias.riasw.layout.SplitContainer"],
			requires: "rias/riasw/layout/SplitContainer"
		},{
			riaswType: ["rias.riasw.layout.GridContainer", "dojox.layout.GridContainer"],
			requires: "rias/riasw/layout/GridContainer"
		},{
			riaswType: ["rias.riasw.layout.RadioGroup", "dojox.layout.RadioGroup"],
			requires: "rias/riasw/layout/RadioGroup"*/
		/*},{
			riaswType: ["rias.riasw.layout.RadioGroupFade", "dojox.layout.RadioGroupFade"],
			requires: "rias/riasw/layout/RadioGroupFade"
		},{
			riaswType: ["rias.riasw.layout.RadioGroupSlide", "dojox.layout.RadioGroupSlide"],
			requires: "rias/riasw/layout/RadioGroupSlide"*/
		},
		//mobile
		{
			riaswType: ["rias.riasw.mobile.Button"],
			requires: "rias/riasw/mobile/Button"
		},{
			riaswType: ["rias.riasw.mobile.ToggleButton"],
			requires: "rias/riasw/mobile/ToggleButton"
		},{
			riaswType: ["rias.riasw.mobile.Switch"],
			requires: "rias/riasw/mobile/Switch"
		},{
			riaswType: ["rias.riasw.mobile.TextBox"],
			requires: "rias/riasw/mobile/TextBox"
		},{
			riaswType: ["rias.riasw.mobile.TextArea"],
			requires: "rias/riasw/mobile/TextArea"
		},{
			riaswType: ["rias.riasw.mobile.ComboBox"],
			requires: "rias/riasw/mobile/ComboBox"
		},{
			riaswType: ["rias.riasw.mobile.SearchBox"],
			requires: "rias/riasw/mobile/SearchBox"
		},{
			riaswType: ["rias.riasw.mobile.CheckBox"],
			requires: "rias/riasw/mobile/CheckBox"
		},{
			riaswType: ["rias.riasw.mobile.RadioButton"],
			requires: "rias/riasw/mobile/RadioButton"
		},{
			riaswType: ["rias.riasw.mobile.SpinWheel"],
			requires: "rias/riasw/mobile/SpinWheel"
		},{
			riaswType: ["rias.riasw.mobile.ProgressIndicator"],
			requires: "rias/riasw/mobile/ProgressIndicator"
		},{
			riaswType: ["rias.riasw.mobile.ProgressBar"],
			requires: "rias/riasw/mobile/ProgressBar"
		},{
			riaswType: ["rias.riasw.mobile.View"],
			requires: "rias/riasw/mobile/View"
		},{
			riaswType: ["rias.riasw.mobile.ScrollableView"],
			requires: "rias/riasw/mobile/ScrollableView"
		},{
			riaswType: ["rias.riasw.mobile.TreeView"],
			requires: "rias/riasw/mobile/TreeView"
		},{
			riaswType: ["rias.riasw.mobile.SwapView"],
			requires: "rias/riasw/mobile/SwapView"
		},{
			riaswType: ["rias.riasw.mobile.ListItem"],
			requires: "rias/riasw/mobile/ListItem"
		},{
			riaswType: ["rias.riasw.mobile.Heading"],
			requires: "rias/riasw/mobile/Heading"
		},{
			riaswType: ["rias.riasw.mobile.PageIndicator"],
			requires: "rias/riasw/mobile/PageIndicator"
		},{
			riaswType: ["rias.riasw.mobile.TabBar"],
			requires: "rias/riasw/mobile/TabBar"
		},{
			riaswType: ["rias.riasw.mobile.TabBarButton"],
			requires: "rias/riasw/mobile/TabBarButton"
		},{
			riaswType: ["rias.riasw.mobile.IconContainer"],
			requires: "rias/riasw/mobile/IconContainer"
		},{
			riaswType: ["rias.riasw.mobile.IconItem"],
			requires: "rias/riasw/mobile/IconItem"
		},{
			riaswType: ["rias.riasw.mobile.ToolBarButton"],
			requires: "rias/riasw/mobile/ToolBarButton"
		},{
			riaswType: ["rias.riasw.mobile.EdgeToEdgeList"],
			requires: "rias/riasw/mobile/EdgeToEdgeList"
		},{
			riaswType: ["rias.riasw.mobile.EdgeToEdgeStoreList"],
			requires: "rias/riasw/mobile/EdgeToEdgeStoreList"
		},{
			riaswType: ["rias.riasw.mobile.EdgeToEdgeCategory"],
			requires: "rias/riasw/mobile/EdgeToEdgeCategory"
		},{
			riaswType: ["rias.riasw.mobile.RoundRectList"],
			requires: "rias/riasw/mobile/RoundRectList"
		},{
			riaswType: ["rias.riasw.mobile.RoundRectStoreList"],
			requires: "rias/riasw/mobile/RoundRectStoreList"
		},{
			riaswType: ["rias.riasw.mobile.RoundRectCategory"],
			requires: "rias/riasw/mobile/RoundRectCategory"
		},{
			riaswType: ["rias.riasw.mobile.Pane"],
			requires: "rias/riasw/mobile/Pane"
		},{
			riaswType: ["rias.riasw.mobile.ContentPane"],
			requires: "rias/riasw/mobile/ContentPane"
		},{
			riaswType: ["rias.riasw.mobile.Accordion"],
			requires: "rias/riasw/mobile/Accordion"
		},{
			riaswType: ["rias.riasw.mobile.Tooltip"],
			requires: "rias/riasw/mobile/Tooltip"
		},
		//widget
		{
			riaswType: ["rias.riasw.widget.Toolbar"],
			requires: "rias/riasw/widget/Toolbar"
		},{
			riaswType: ["rias.riasw.widget.ToolbarSeparator"],
			requires: "rias/riasw/widget/ToolbarSeparator"
		},{
			riaswType: ["rias.riasw.widget.ToolbarLineBreak"],
			requires: "rias/riasw/widget/ToolbarLineBreak"
		},{
			riaswType: ["rias.riasw.widget.Menu", "dijit.Menu"],
			requires: "rias/riasw/widget/Menu"
		},{
			riaswType: ["rias.riasw.widget.DropDownMenu", "dijit.DropDownMenu"],
			requires: "rias/riasw/widget/DropDownMenu"
		},{
			riaswType: ["rias.riasw.widget.MenuBar", "dijit.MenuBar"],
			requires: "rias/riasw/widget/MenuBar"
		},{
			riaswType: ["rias.riasw.widget.MenuSeparator", "dijit.MenuSeparator"],
			requires: "rias/riasw/widget/MenuSeparator"
		},{
			riaswType: ["rias.riasw.widget.MenuItem", "dijit.MenuItem"],
			requires: "rias/riasw/widget/MenuItem"
		},{
			riaswType: ["rias.riasw.widget.PopupMenuItem", "dijit.PopupMenuItem"],
			requires: "rias/riasw/widget/PopupMenuItem"
		},{
			riaswType: ["rias.riasw.widget.CheckedMenuItem", "dijit.CheckedMenuItem"],
			requires: "rias/riasw/widget/CheckedMenuItem"
		},{
			riaswType: ["rias.riasw.widget.RadioMenuItem", "dijit.RadioMenuItem"],
			requires: "rias/riasw/widget/RadioMenuItem"
		},{
			riaswType: ["rias.riasw.widget.MenuBarItem", "dijit.MenuBarItem"],
			requires: "rias/riasw/widget/MenuBarItem"
		},{
			riaswType: ["rias.riasw.widget.PopupMenuBarItem", "dijit.PopupMenuBarItem"],
			requires: "rias/riasw/widget/PopupMenuBarItem"
		},{
			riaswType: ["rias.riasw.widget.TreeModel"],
			requires: "rias/riasw/widget/TreeModel"
		},{
			riaswType: ["rias.riasw.widget.Tree"],
			requires: "rias/riasw/widget/Tree"
		/*},{
			riaswType: ["rias.riasw.widget.LazyTreeModel"],
			requires: "rias/riasw/widget/LazyTreeModel"
		},{
			riaswType: ["rias.riasw.widget.LazyTree"],
			requires: "rias/riasw/widget/LazyTree"*/
		},{
			riaswType: ["rias.riasw.widget.Calendar", "dijit.Calendar"],
			requires: "rias/riasw/widget/Calendar"
		},{
			riaswType: ["rias.riasw.widget.CalendarX", "dojox.widget.Calendar"],
			requires: "rias/riasw/widget/CalendarX"
		},{
			riaswType: ["rias.riasw.widget.ColorPalette"],
			requires: "rias/riasw/widget/ColorPalette"
		},{
			riaswType: ["rias.riasw.widget.ColorPicker"],
			requires: "rias/riasw/widget/ColorPicker"
		},
		//store
		{
			riaswType: ["rias.riasw.store.MemoryStore"],
			requires: "rias/riasw/store/MemoryStore"
		},{
			riaswType: ["rias.riasw.store.JsonXhrStore"],
			requires: "rias/riasw/store/JsonXhrStore"
		//},{
		//	riaswType: ["rias.riasw.store.JsonRestStore"],
		//	requires: "rias/riasw/store/JsonRestStore"
		}
	];

});