
Parse.Cloud.define("createAdminCmsRole", function(request, response) {
	
	var cbBasicSuccess = function() {
		response.success();	
	};

	var cbBasicError = function(error) {
		response.error(error.message);
	}

	var roleACL = new Parse.ACL();
	roleACL.setPublicReadAccess(true);
	var role = new Parse.Role("admin-cms", roleACL);
	role.save().then(cbBasicSuccess, cbBasicError);

});

Parse.Cloud.define("grantCmsAdmin", function(request, response) {  
	
	if( !request.params.userId ) {
		response.error("please, give a userId in POST param");
	}

	var cbBasicSuccess = function() {
		response.success();	
	};

	var cbBasicError = function(error) {
		response.error(error.message);
	}

	var roleSuccess = function(role) {

		var gotUser = function(user) {
			Parse.Cloud.useMasterKey();
			role.getUsers().add(user);
			role.save().then(cbBasicSuccess, cbBasicError);
		}

		new Parse.Query(Parse.User).get(request.params.userId).then(gotUser, cbBasicError);
	};

	var query = new Parse.Query(Parse.Role); 
	query.equalTo("name", "admin-cms");
	query.first().then(roleSuccess, cbBasicError);

});

Parse.Cloud.define("sendDriverEmail", function(request, response) {

	/**
	  * Params :
	  * - captainRequest
	  **/

	var Mailgun = require('mailgun');

	var captainRequest = request.params.captainRequest;
	var config = null;

	var cbError = function(error) {
		response.error("error in 'sendDriverEmail' check logs for more informations [captainRequest="+captainRequest+"].");
	};

	var gotCaptainRequest = function(request) {
		
		var hostlname = request.get('fromHost').get('lastname');
		var hostfname = request.get('fromHost').get('firstname'); 
		var boatname = request.get('boat').get('name');

		var data = {
			to: request.get("email"),
			from: config.get("CAPTAIN_EMAIL_FROM"),
			subject: hostfname+" "+hostlname+" has invited you to join BoatDay",
			text: 	"Hi,\n\n"+hostfname+" "+hostlname+" has invited you to become a Captain for his boat "+boatname+".\nClick the link below to register as a Captain and begin hosting great BoatDays aboard "+boatname+".\n\nhttps://www.boatdayhosts.com\n\nThanks,\nThe BoatDay Team"
		};

		Mailgun.sendEmail(data).then(function(httpResponse) {
			response.success('Email sent');
		}, cbError);
	};

	Parse.Config.get().then(function(c) {

		config = c;

		Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));
		
		var query = new Parse.Query("CaptainRequest");
		query.include('boat');
		query.include('fromHost');
		query.get(captainRequest).then(gotCaptainRequest, cbError);

	});
	
});

Parse.Cloud.afterSave("CaptainRequest", function(request) {

		Parse.Cloud.run('sendDriverEmail', {captainRequest: request.object.id });
});