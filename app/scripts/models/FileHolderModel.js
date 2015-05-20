define([
'parse'
], function(Parse){
	var FileHolderModel = Parse.Object.extend("FileHolderModel", {

		defaults: {
			file: null
		}
 
	});
	return FileHolderModel;
});