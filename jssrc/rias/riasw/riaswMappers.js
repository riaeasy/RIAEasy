//RIAStudio client runtime widget Mapper.

define([
    "rias"
], function(rias) {

	return [
		//studio:在riasdesigner中定义
		{
			riasType: "rias.riasw.studio.DefaultError",
			requires: "rias/riasw/studio/DefaultError"
		},{
			riasType: "rias.riasw.studio.Module",
			requires: "rias/riasw/studio/Module"
		},
		//============================================================================================================//
		//studio-riasd
		{
			riasType: ["rias.riasw.studio.WidgetPalette"],
			requires: "rias/riasd/studio/WidgetPalette"
		},{
			riasType: ["rias.riasw.studio.TextEditor"],
			requires: "rias/riasd/studio/TextEditor"
		},{
			riasType: ["rias.riasw.studio.OutlineTree"],
			requires: "rias/riasd/studio/OutlineTree"
		},{
			riasType: ["rias.riasw.widget.HTMLEditor"],
			requires: "rias/riasw/widget/HTMLEditor"
		},
		//---------------------------------------------------------
		//chart
		//flow
		//form
		{
		/*	riasType: ["rias.riasw.form.Form", "dijit.form.Form"],
			requires: "rias/riasw/form/Form"
		},{*/
			riasType: ["rias.riasw.form.ValidationTextBox", "dijit.form.ValidationTextBox"],
			requires: "rias/riasw/form/ValidationTextBox"
		},{
			riasType: ["rias.riasw.form.TextBox", "dijit.form.TextBox"],
			requires: "rias/riasw/form/TextBox"
		},{
			riasType: ["rias.riasw.form.NumberTextBox", "dijit.form.NumberTextBox"],
			requires: "rias/riasw/form/NumberTextBox"
		},{
			riasType: ["rias.riasw.form.CurrencyTextBox", "dijit.form.CurrencyTextBox"],
			requires: "rias/riasw/form/CurrencyTextBox"
		},{
			riasType: ["rias.riasw.form.ComboBox", "dijit.form.ComboBox"],
			requires: "rias/riasw/form/ComboBox"
		},{
			riasType: ["rias.riasw.form.ButtonBox"],
			requires: "rias/riasw/form/ButtonBox"
		/*},{
			riasType: ["rias.riasw.form.Select"],
			requires: "rias/riasw/form/Select"
		},{
			riasType: ["rias.riasw.form.CheckedMultiSelect", "dojox.form.CheckedMultiSelect"],
			requires: "rias/riasw/form/CheckedMultiSelect"
		*/},{
			riasType: ["rias.riasw.form.Button", "dijit.form.Button"],
			requires: "rias/riasw/form/Button"
		},{
			riasType: ["rias.riasw.form.ToggleButton", "dijit.form.ToggleButton"],
			requires: "rias/riasw/form/ToggleButton"
		},{
			riasType: ["rias.riasw.form.CheckButton", "dijit.form.CheckBox"],
			requires: "rias/riasw/form/CheckButton"
		},{
			riasType: ["rias.riasw.form.TriStateCheckBox", "dojox.form.TriStateCheckBox"],
			requires: "rias/riasw/form/TriStateCheckBox"
		},{
			riasType: ["rias.riasw.form.RadioButton", "dijit.form.RadioButton"],
			requires: "rias/riasw/form/RadioButton"
		},{
			riasType: ["rias.riasw.form.DropDownButton", "dijit.form.DropDownButton"],
			requires: "rias/riasw/form/DropDownButton"
		},{
			riasType: ["rias.riasw.form.ComboButton", "dijit.form.ComboButton"],
			requires: "rias/riasw/form/ComboButton"
		},{
			riasType: ["rias.riasw.form._Spinner", "dijit.form._Spinner"],
			requires: "rias/riasw/form/_Spinner"
		},{
			riasType: ["rias.riasw.form.NumberSpinner", "dijit.form.NumberSpinner"],
			requires: "rias/riasw/form/NumberSpinner"
		},{
			riasType: ["rias.riasw.form.TimeSpinner", "dojox.form.TimeSpinner"],
			requires: "rias/riasw/form/TimeSpinner"
		},{
			riasType: ["rias.riasw.form.DateTextBox", "dijit.form.DateTextBox"],
			requires: "rias/riasw/form/DateTextBox"
		},{
			riasType: ["rias.riasw.form.TimeTextBox", "dijit.form.TimeTextBox"],
			requires: "rias/riasw/form/TimeTextBox"
		},{
			riasType: ["rias.riasw.form.FileInput", "dojox.form.FileInput"],
			requires: "rias/riasw/form/FileInput"
		},{
			riasType: ["rias.riasw.form.FileInputAuto", "dojox.form.FileInputAuto"],
			requires: "rias/riasw/form/FileInputAuto"
		},{
			riasType: ["rias.riasw.form.FileInputBlind", "dojox.form.FileInputBlind"],
			requires: "rias/riasw/form/FileInputBlind"
		},{
			riasType: ["rias.riasw.form.TextArea", "dijit.form.SimpleTextarea"],
			requires: "rias/riasw/form/TextArea"
		},{
			riasType: ["rias.riasw.form.ExpandingTextArea", "dijit.form.Textarea"],
			requires: "rias/riasw/form/ExpandingTextArea"
		//},{
		//	riasType: ["rias.riasw.form.MultiComboBox", "dojox.form.MultiComboBox"],
		//	requires: "rias/riasw/form/MultiComboBox"
		//},{
		//	riasType: ["rias.riasw.form.MultiSelect", "dijit.form.MultiSelect"],
		//	requires: "rias/riasw/form/MultiSelect"
		},{
			riasType: ["rias.riasw.form.FilteringSelect", "dijit.form.FilteringSelect"],
			requires: "rias/riasw/form/FilteringSelect"
		},{
			riasType: ["rias.riasw.form.Rating", "dojox.form.Rating"],
			requires: "rias/riasw/form/Rating"
		},{
			riasType: ["rias.riasw.form.HRule", "dijit.form.HorizontalRule"],
			requires: "rias/riasw/form/HRule"
		},{
			riasType: ["rias.riasw.form.HRuleLabels", "dijit.form.HorizontalRuleLabels"],
			requires: "rias/riasw/form/HRuleLabels"
		},{
			riasType: ["rias.riasw.form.HSlider", "dijit.form.HorizontalSlider"],
			requires: "rias/riasw/form/HSlider"
		},{
			riasType: ["rias.riasw.form.VRule", "dijit.form.VerticalRule"],
			requires: "rias/riasw/form/VRule"
		},{
			riasType: ["rias.riasw.form.VRuleLabels", "dijit.form.VerticalRuleLabels"],
			requires: "rias/riasw/form/VRuleLabels"
		},{
			riasType: ["rias.riasw.form.VSlider", "dijit.form.VerticalSlider"],
			requires: "rias/riasw/form/VSlider"
		},
		//gauge
		//grid
		{
			riasType: ["rias.riasw.grid.GridX", "gridx.Grid"],
			requires: "rias/riasw/grid/GridX"
		}/*,{
			riasType: ["rias.riasw.grid.LazyTreeGrid", "dojox.grid.LazyTreeGrid"],
			requires: "rias/riasw/grid/LazyTreeGrid"
		},{
			riasType: ["rias.riasw.grid.DataGrid", "dojox.grid.DataGrid"],
			requires: "rias/riasw/grid/DataGrid"
		},{
			riasType: ["rias.riasw.grid.TreeGrid", "dojox.grid.TreeGrid"],
			requires: "rias/riasw/grid/TreeGrid"
		},{
			riasType: ["rias.riasw.grid.LazyTreeGridModel", "dojox.grid.LazyTreeGridStoreModel"],
			requires: "rias/riasw/grid/LazyTreeGridModel"
		}*/,
		//html
		{
			riasType: "rias.riasw.html.Tag",
			requires: "rias/riasw/html/Tag"
		},/*{
			riasType: "rias.riasw.html.Image",
			requires: "rias/riasw/html/Image"
		},{
			riasType: "rias.riasw.html.A",
			requires: "rias/riasw/html/A"
		},{
			riasType: "rias.riasw.html.B",
			requires: "rias/riasw/html/B"
		},{
			riasType: "rias.riasw.html.Div",
			requires: "rias/riasw/html/Div"
		},{
			riasType: "rias.riasw.html.H1",
			requires: "rias/riasw/html/H1"
		},{
			riasType: "rias.riasw.html.H2",
			requires: "rias/riasw/html/H2"
		},{
			riasType: "rias.riasw.html.H3",
			requires: "rias/riasw/html/H3"
		},{
			riasType: "rias.riasw.html.Hr",
			requires: "rias/riasw/html/Hr"
		},{
			riasType: "rias.riasw.html.Iframe",
			requires: "rias/riasw/html/Iframe"
		},{
			riasType: "rias.riasw.html.Label",
			requires: "rias/riasw/html/Label"
		},{
			riasType: "rias.riasw.html.Li",
			requires: "rias/riasw/html/Li"
		},{
			riasType: "rias.riasw.html.Span",
			requires: "rias/riasw/html/Span"
		},{
			riasType: "rias.riasw.html.Table",
			requires: "rias/riasw/html/Table"
		},{
			riasType: "rias.riasw.html.Td",
			requires: "rias/riasw/html/Td"
		},{
			riasType: "rias.riasw.html.Tr",
			requires: "rias/riasw/html/Tr"
		},*/
		//pane
		//{
		//	riasType: ["rias.riasw.layout.ContentPane", "dijit.layout.ContentPane"],
		//	requires: "rias/riasw/layout/ContentPane"
		//},{
		//	riasType: ["rias.riasw.layout.ExpandoPane"],
		//	requires: "rias/riasw/layout/ExpandoPane"
		//},{
		//	riasType: ["rias.riasw.layout.TitlePane", "dijit.TitlePane"],
		//	requires: "rias/riasw/layout/TitlePane"
		//},{
		//	riasType: ["rias.riasw.layout.LinkPane", "dijit.layout.LinkPane"],
		//	requires: "rias/riasw/layout/LinkPane"
		//},
		//layout
		{
			riasType: ["rias.riasw.layout.Panel", "dijit.layout.Pane"],
			requires: "rias/riasw/layout/Panel"
		},{
			riasType: ["rias.riasw.layout.ContentPanel", "dijit.layout.ContentContainer"],
			requires: "rias/riasw/layout/ContentPanel"
		},{
			riasType: ["rias.riasw.layout.CaptionPanel"],
			requires: "rias/riasw/layout/CaptionPanel"
		},{
			riasType: ["rias.riasw.layout.TablePanel"],
			requires: "rias/riasw/layout/TablePanel"
		//},{
		//	riasType: ["rias.riasw.layout.TablePanel"],//, "dojox.layout.TableContainer"],
		//	requires: "rias/riasw/layout/TableContainer"
		},{
			riasType: ["rias.riasw.layout.DialogPanel"],
			requires: "rias/riasw/layout/DialogPanel"
		},{
			riasType: ["rias.riasw.layout.DockBar"],
			requires: "rias/riasw/layout/DockBar"
		//},{
		//	riasType: ["rias.riasw.layout.BorderContainer"],
		//	requires: "rias/riasw/layout/BorderContainer"
		},{
			riasType: ["rias.riasw.layout.AccordionPanel", "dijit.layout.AccordionContainer"],
			requires: "rias/riasw/layout/AccordionPanel"
		},{
			riasType: ["rias.riasw.layout.TabPanel", "dijit.layout.TabContainer"],
			requires: "rias/riasw/layout/TabPanel"
		},{
			riasType: ["rias.riasw.layout.StackPanel", "dijit.layout.StackContainer"],
			requires: "rias/riasw/layout/StackPanel"
		},{
			riasType: ["rias.riasw.layout.SplitContainer"],
			requires: "rias/riasw/layout/SplitContainer"
		},{
			riasType: ["rias.riasw.layout.GridContainer", "dojox.layout.GridContainer"],
			requires: "rias/riasw/layout/GridContainer"
		/*},{
			riasType: ["rias.riasw.layout.StackController", "dijit.layout.StackController"],
			requires: "rias/riasw/layout/StackController"*/
		},{
			riasType: ["rias.riasw.layout.RadioGroup", "dojox.layout.RadioGroup"],
			requires: "rias/riasw/layout/RadioGroup"
		/*},{
			riasType: ["rias.riasw.layout.RadioGroupFade", "dojox.layout.RadioGroupFade"],
			requires: "rias/riasw/layout/RadioGroupFade"
		},{
			riasType: ["rias.riasw.layout.RadioGroupSlide", "dojox.layout.RadioGroupSlide"],
			requires: "rias/riasw/layout/RadioGroupSlide"*/
		},
		//mobile
		{
			riasType: ["rias.riasw.mobile.Button"],
			requires: "rias/riasw/mobile/Button"
		},{
			riasType: ["rias.riasw.mobile.ToggleButton"],
			requires: "rias/riasw/mobile/ToggleButton"
		},{
			riasType: ["rias.riasw.mobile.Switch"],
			requires: "rias/riasw/mobile/Switch"
		},{
			riasType: ["rias.riasw.mobile.TextBox"],
			requires: "rias/riasw/mobile/TextBox"
		},{
			riasType: ["rias.riasw.mobile.TextArea"],
			requires: "rias/riasw/mobile/TextArea"
		},{
			riasType: ["rias.riasw.mobile.ComboBox"],
			requires: "rias/riasw/mobile/ComboBox"
		},{
			riasType: ["rias.riasw.mobile.SearchBox"],
			requires: "rias/riasw/mobile/SearchBox"
		},{
			riasType: ["rias.riasw.mobile.CheckBox"],
			requires: "rias/riasw/mobile/CheckBox"
		},{
			riasType: ["rias.riasw.mobile.RadioButton"],
			requires: "rias/riasw/mobile/RadioButton"
		},{
			riasType: ["rias.riasw.mobile.SpinWheel"],
			requires: "rias/riasw/mobile/SpinWheel"
		},{
			riasType: ["rias.riasw.mobile.ProgressIndicator"],
			requires: "rias/riasw/mobile/ProgressIndicator"
		},{
			riasType: ["rias.riasw.mobile.ProgressBar"],
			requires: "rias/riasw/mobile/ProgressBar"
		},{
			riasType: ["rias.riasw.mobile.View"],
			requires: "rias/riasw/mobile/View"
		},{
			riasType: ["rias.riasw.mobile.ScrollableView"],
			requires: "rias/riasw/mobile/ScrollableView"
		},{
			riasType: ["rias.riasw.mobile.TreeView"],
			requires: "rias/riasw/mobile/TreeView"
		},{
			riasType: ["rias.riasw.mobile.SwapView"],
			requires: "rias/riasw/mobile/SwapView"
		},{
			riasType: ["rias.riasw.mobile.ListItem"],
			requires: "rias/riasw/mobile/ListItem"
		},{
			riasType: ["rias.riasw.mobile.Heading"],
			requires: "rias/riasw/mobile/Heading"
		},{
			riasType: ["rias.riasw.mobile.PageIndicator"],
			requires: "rias/riasw/mobile/PageIndicator"
		},{
			riasType: ["rias.riasw.mobile.TabBar"],
			requires: "rias/riasw/mobile/TabBar"
		},{
			riasType: ["rias.riasw.mobile.TabBarButton"],
			requires: "rias/riasw/mobile/TabBarButton"
		},{
			riasType: ["rias.riasw.mobile.IconContainer"],
			requires: "rias/riasw/mobile/IconContainer"
		},{
			riasType: ["rias.riasw.mobile.IconItem"],
			requires: "rias/riasw/mobile/IconItem"
		},{
			riasType: ["rias.riasw.mobile.ToolBarButton"],
			requires: "rias/riasw/mobile/ToolBarButton"
		},{
			riasType: ["rias.riasw.mobile.EdgeToEdgeList"],
			requires: "rias/riasw/mobile/EdgeToEdgeList"
		},{
			riasType: ["rias.riasw.mobile.EdgeToEdgeStoreList"],
			requires: "rias/riasw/mobile/EdgeToEdgeStoreList"
		},{
			riasType: ["rias.riasw.mobile.EdgeToEdgeCategory"],
			requires: "rias/riasw/mobile/EdgeToEdgeCategory"
		},{
			riasType: ["rias.riasw.mobile.RoundRectList"],
			requires: "rias/riasw/mobile/RoundRectList"
		},{
			riasType: ["rias.riasw.mobile.RoundRectStoreList"],
			requires: "rias/riasw/mobile/RoundRectStoreList"
		},{
			riasType: ["rias.riasw.mobile.RoundRectCategory"],
			requires: "rias/riasw/mobile/RoundRectCategory"
		},{
			riasType: ["rias.riasw.mobile.Pane"],
			requires: "rias/riasw/mobile/Pane"
		},{
			riasType: ["rias.riasw.mobile.ContentPane"],
			requires: "rias/riasw/mobile/ContentPane"
		},{
			riasType: ["rias.riasw.mobile.Accordion"],
			requires: "rias/riasw/mobile/Accordion"
		},{
			riasType: ["rias.riasw.mobile.Tooltip"],
			requires: "rias/riasw/mobile/Tooltip"
		},
		//widget
		{
		//	riasType: ["rias.riasw.widget.WindowPane"],
		//	requires: "rias/riasw/widget/WindowPane"
		//},{
		//	riasType: ["rias.riasw.widget.Tooltip", "dijit.Tooltip"],
		//	requires: "rias/riasw/widget/Tooltip"
		//},{
			riasType: ["rias.riasw.widget.Toolbar", "dijit.Toolbar"],
			requires: "rias/riasw/widget/Toolbar"
		},{
			riasType: ["rias.riasw.widget.Menu", "dijit.Menu"],
			requires: "rias/riasw/widget/Menu"
		},{
			riasType: ["rias.riasw.widget.MenuBar", "dijit.MenuBar"],
			requires: "rias/riasw/widget/MenuBar"
		},{
			riasType: ["rias.riasw.widget.MenuSeparator", "dijit.MenuSeparator"],
			requires: "rias/riasw/widget/MenuSeparator"
		},{
			riasType: ["rias.riasw.widget.MenuItem", "dijit.MenuItem"],
			requires: "rias/riasw/widget/MenuItem"
		},{
			riasType: ["rias.riasw.widget.PopupMenuItem", "dijit.PopupMenuItem"],
			requires: "rias/riasw/widget/PopupMenuItem"
		},{
			riasType: ["rias.riasw.widget.CheckedMenuItem", "dijit.CheckedMenuItem"],
			requires: "rias/riasw/widget/CheckedMenuItem"
		},{
			riasType: ["rias.riasw.widget.RadioMenuItem", "dijit.RadioMenuItem"],
			requires: "rias/riasw/widget/RadioMenuItem"
		},{
			riasType: ["rias.riasw.widget.MenuBarItem", "dijit.MenuBarItem"],
			requires: "rias/riasw/widget/MenuBarItem"
		},{
			riasType: ["rias.riasw.widget.PopupMenuBarItem", "dijit.PopupMenuBarItem"],
			requires: "rias/riasw/widget/PopupMenuBarItem"
		},{
			riasType: ["rias.riasw.widget.TreeModel"],
			requires: "rias/riasw/widget/TreeModel"
		},{
			riasType: ["rias.riasw.widget.Tree"],
			requires: "rias/riasw/widget/Tree"
		/*},{
			riasType: ["rias.riasw.widget.LazyTreeModel"],
			requires: "rias/riasw/widget/LazyTreeModel"
		},{
			riasType: ["rias.riasw.widget.LazyTree"],
			requires: "rias/riasw/widget/LazyTree"*/
		},{
			riasType: ["rias.riasw.widget.Editor"],
			requires: "rias/riasw/widget/Editor"
		},{
			riasType: ["rias.riasw.widget.Calendar", "dijit.Calendar"],
			requires: "rias/riasw/widget/Calendar"
		},{
			riasType: ["rias.riasw.widget.CalendarX", "dojox.widget.Calendar"],
			requires: "rias/riasw/widget/CalendarX"
		},{
			riasType: ["rias.riasw.widget.ColorPalette", "dijit.ColorPalette"],
			requires: "rias/riasw/widget/ColorPalette"
		},
		//store
		{
			riasType: ["rias.riasw.store.MemoryStore"],
			requires: "rias/riasw/store/MemoryStore"
		},{
			riasType: ["rias.riasw.store.JsonRestStore"],
			requires: "rias/riasw/store/JsonRestStore"
		/*},{
			riasType: ["rias.riasw.store.QueryReadStore", "dojox.data.QueryReadStore"],
			requires: "rias/riasw/store/QueryReadStore"
		},{
			riasType: ["rias.riasw.store.JsonRpcStore", "dojox.data.JsonRestStore"],
			requires: "rias/riasw/store/JsonRpcStore"
		},{
			riasType: ["rias.riasw.store.ItemStore", "dojo.data.ItemFileWriteStore"],
			requires: "rias/riasw/store/ItemStore"
		},{
			riasType: ["rias.riasw.store.XQueryReadStore"],
			requires: "rias/riasw/store/XQueryReadStore"
		},{
			riasType: ["rias.riasw.store.FileStore"],
			requires: "rias/riasw/store/FileStore"
		},{
			riasType: ["rias.riasw.store.XmlStore", "dojox.data.XmlStore"],
			requires: "rias/riasw/store/XmlStore"
		},{
			riasType: ["rias.riasw.store.CssRuleStore"],
			requires: "rias/riasw/store/CssRuleStore"
		},{
			riasType: ["rias.riasw.store.CssClassStore"],
			requires: "rias/riasw/store/CssClassStore"
		},{
			riasType: ["rias.riasw.store.CvsStore", "dojox.data.CvsStore"],
			requires: "rias/riasw/store/CvsStore"*/
		}
	];

});