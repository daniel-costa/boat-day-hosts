define([
'parse'
], function(Parse){
	var FileHolder = Parse.Object.extend("FileHolder", {

		defaults: {
			file: null
		}
 
	});
	return FileHolder;
});