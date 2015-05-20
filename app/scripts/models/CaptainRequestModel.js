define([
'parse'
], function(Parse){
	var CaptainRequestModel = Parse.Object.extend("CaptainRequest", {

		defaults: {
			status: 'pending',
			email: null,
			captain: null,
			profile: null
		}
 
	});
	return CaptainRequestModel;
});