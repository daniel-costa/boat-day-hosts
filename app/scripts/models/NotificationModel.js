define([
'parse'
], function(Parse){
	var NotificationModel = Parse.Object.extend("Notification", {

		defaults: {
			to: null,
			from: null,
			message: null
		}
 
	});
	return NotificationModel;
});