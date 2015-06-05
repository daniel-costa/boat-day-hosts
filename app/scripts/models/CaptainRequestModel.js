define([
'parse'
], function(Parse){
	var CaptainRequestModel = Parse.Object.extend("CaptainRequest", {

		defaults: {
			status: 'pending',
			email: null,
			captainHost: null,
			captainProfile: null,
			fromHost: null,
			fromProfile: null,
			boat: null
		}
 
	});
	return CaptainRequestModel;
});