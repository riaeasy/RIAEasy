
//RIAStudio Client Runtime(riasw) in Browser.

define([
	"rias/riasBase"
], function (rias) {

/// riasw ******************************************************************************///
	var riasw = rias.getObject("riasw", true);
	riasw._scopeName = "riasw";
	dojo.scopeMap.riasw = ["riasw", riasw];
	//rias.riasw = riasw;

	return riasw;

});