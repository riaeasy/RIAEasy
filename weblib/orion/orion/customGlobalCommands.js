/*******************************************************************************
 * @license Copyright (c) 2013 IBM Corporation and others. All rights
 *          reserved. This program and the accompanying materials are made
 *          available under the terms of the Eclipse Public License v1.0
 *          (http://www.eclipse.org/legal/epl-v10.html), and the Eclipse
 *          Distribution License v1.0
 *          (http://www.eclipse.org/org/documents/edl-v10.html).
 * 
 * Contributors: IBM Corporation - initial API and implementation
 ******************************************************************************/
/*eslint-env browser, amd*/

define(['orion/Deferred', 'orion/widgets/projects/RunBar'],
function(Deferred, mRunBar){
	
	function createRunBar(options) {
		var runBarDeferred = new Deferred();
		var runBar = new mRunBar.RunBar(options);
		runBarDeferred.resolve(runBar);
		return runBarDeferred;
	}
	
	return {
		createRunBar: createRunBar
	};
});