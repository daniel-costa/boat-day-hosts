
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

Parse.Cloud.define("attachPictureToBoat", function(request, response) {
	
	var a = [];
	var _ = require('underscore');

	new Parse.Query("Boat").get(request.params.boat).then(function(boat) {
		new Parse.Query("FileHolder").get(request.params.fileHolder).then(function(fh) {
			boat.relation('boatPictures').add(fh);
			boat.save().then(function() {
				response.success("done");
			}, function(error) {
				console.log(error);
				response.error("error");
			});
		});
	});

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
		console.log(error);
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

Parse.Cloud.afterSave("Notification", function(notification) {

	var notification = notification.object;

	if( notification.get('sendEmail') ) {

		var Mailgun = require('mailgun');

		var cbError = function(error) {
			console.log(error);
			console.error("error in 'sendNotificationEmail' check logs for more informations.");
		};

		Parse.Config.get().then(function(config) {

			Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));
			
			var queryNotification = new Parse.Query("Notification");
			queryNotification.include('to');
			queryNotification.include('to.user');
			queryNotification.include('to.host');
			queryNotification.get(notification.id).then(function(notification) {

				var name = notification.get('to').get('host').get('firstname');

				var data = {
					to: notification.get('to').get('user').get("email"),
					from: config.get("CAPTAIN_EMAIL_FROM"),
					subject: "You have a new notification",
					text: 	"Hi "+name+",\n\nYou have a new message in your BoatDay inbox, access the BoatDay Host Center - https://www.boatdayhosts.com - to read your messages.\n\nWelcome aboard,\nThe BoatDay Team"
				};

				Mailgun.sendEmail(data).then(function(httpResponse) { console.log('Email sent'); }, cbError);

			}, cbError);

		});

	}
		
});


Parse.Cloud.afterSave("Host", function(host) {

	var host = host.object;

	if( host.get('status') == 'complete' && !host.get('notificationSent') ) {
		var Notification = Parse.Object.extend('Notification');
		
		var data = {
			action: 'bd-message',
			fromTeam: true,
			message: 'Welcome to BoatDay! We are currently reviewing your Host application. In the meantime, you can register a boat and start creating BoatDays.',
			to: host.get('profile'),
			sendEmail: false
		};
		
		new Notification().save(data).then(function() {
			host.save({ notificationSent: true }).then(function() {
				console.log('Notification sent / Host updated');
			});
		});

		var Mailgun = require('mailgun');

		var cbError = function(error) {
			console.log(error);
			console.error("error in 'sendNotificationEmail' check logs for more informations.");
		};

		Parse.Config.get().then(function(config) {

			Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));
			
			var data = {
				to: "registration@boatdayapp.com",
				from: config.get("CAPTAIN_EMAIL_FROM"),
				subject: "New BoatDay Host",
				text: "go to the CMS motherfucker"
			};

			Mailgun.sendEmail(data).then(function(httpResponse) { console.log('Email sent'); }, cbError);

		});
	}
		
});

Parse.Cloud.afterSave("HelpCenter", function(feedback) {

	var Mailgun = require('mailgun');

	var feedback = feedback.object;

	var cbError = function(error) {
		console.log(error);
		console.log("error in 'HelpCenter afterSave' check logs for more informations.");
	};

	Parse.Config.get().then(function(config) {

		Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));

		var query = new Parse.Query("_User");
		query.include('profile');
		query.get(feedback.get('user').id).then(function(user) {

			var message = feedback.get('feedback');

			var data = {
				to: "support@boatdayapp.com",
				from: config.get("CAPTAIN_EMAIL_FROM"),
				subject: 'HelpCenter from ' + user.get('profile').get('displayName') + ' <'+user.get('email')+'> : ' + feedback.get('category'),
				text: message
			};

			Mailgun.sendEmail(data).then(function(httpResponse) { console.log('Email sent'); }, cbError);

		}, cbError);

	});

		
});