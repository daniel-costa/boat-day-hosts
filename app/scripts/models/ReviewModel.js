define([
'parse'
], function(Parse){
	var ReviewModel = Parse.Object.extend("Review", {

		defaults: {

			fromProfile: null, 
			toProfile: null, 
			review: null, 
			rate1: null, 
			rate2: null, 
			rate3: null, 
			rateAvg: null
		}
 
	});
	return ReviewModel;
});