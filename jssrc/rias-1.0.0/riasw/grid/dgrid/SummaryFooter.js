
define([
	"rias"
], function (rias) {
	return rias.declare(null, {
		// summary:
		//		A mixin for dgrid components which renders
		//		a row with summary information (e.g. totals).

		// Show the footer area, which will hold the summary row
		//showFooter: true,

		adjustVScroll: function(){
			this.inherited(arguments);
			///增加
			//rias.dom.toggleClass(this.footerSummaryScrollNode, "dgrid-scrollbar-width", !!this.bodyNode.style.overflow);
			if(this.contentNode.scrollHeight > this.contentNode.offsetHeight){
				rias.dom.visible(this.footerSummaryScrollNode, true);
				this.footerSummaryNode.style.right = "";
			}else{
				rias.dom.visible(this.footerSummaryScrollNode, false);
				this.footerSummaryNode.style.right = "0";
			}
		},

		buildRendering: function () {
			this.inherited(arguments);

			var areaNode = this.footerSummaryNode =
				rias.dom.create('div', {
					className: 'dgrid-footer-summary-row',
					role: 'row',
					style: { overflow: 'hidden' }
				}, this.domNode);
			this.footerSummaryScrollNode = rias.dom.create('div', {
				className: 'dgrid-footer-summary-scroll dgrid-scrollbar-width' + (this.addUiClasses ? ' ui-widget-summary-scroll' : '')
				//className: 'dgrid-footer-summary-scroll ' + (this.addUiClasses ? ' ui-widget-summary-scroll' : '')
			}, this.domNode);

			// Keep horizontal alignment in sync
			this.on('scroll', rias.hitch(this, function () {
				areaNode.scrollLeft = this.getScrollPosition().x;
			}));
			this.on('scroll', rias.hitch(this, function () {
				areaNode.scrollLeft = this.getScrollPosition().x;
			}));

			// Process any initially-passed summary data
			if (this.summary) {
				this._setSummary(this.summary);
			}
		},

		_updateColumns: function () {
			this.inherited(arguments);
			if (this.summary) {
				// Re-render summary row for existing data,
				// based on new structure
				this._setSummary(this.summary);
			}
		},

		_renderSummaryCell: function (cell, column, item) {
			if(column.field in item){
				cell.appendChild(rias.dom.doc.createTextNode(item[column.field]));
				rias.dom.addClass(cell, "dgrid-summary-cell");
			}else{
				rias.dom.addClass(cell, "dgrid-summary-cell-none");
			}
		},

		_setSummary: function (data) {
			// summary:
			//		Given an object whose keys map to column IDs,
			//		updates the cells in the footer row with the
			//		provided data.

			var tableNode = this.footerSummaryTableNode;

			this.summary = data;

			// Remove any previously-rendered summary row
			if (tableNode) {
				rias.dom.destroy(tableNode);
			}

			// Render row, calling _renderSummaryCell for each cell
			tableNode = this.footerSummaryTableNode = this.createRowCells('td', rias.hitch(this, '_renderSummaryCell'), undefined, data);
			this.footerSummaryNode.appendChild(tableNode);

			// Force resize processing,
			// in case summary row's height changed
			if (this._started) {
				this.resize();
			}
		}
	});
});