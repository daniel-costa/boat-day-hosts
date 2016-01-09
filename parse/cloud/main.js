//Bibash
Parse.Cloud.define("requestRescheduleGuestAnswer", function(request, response) {

	var action     = request.params.action;
	var requestId  = request.params.request;
	var isApproved = action == 'approve';
	var message    = isApproved ? "Your seats are now confirmed for this rescheduled BoatDay!" : "You have succesfully cancelled your seat on this rescheduled BoatDay.";
	var data       = isApproved ? { status: 'approved' } : { status: 'cancelled-guest', cancelled: true };
	
	var query = new Parse.Query(Parse.Object.extend('SeatRequest'));
	query.include('boatday');
	query.include('boatday.captain');
	query.get(requestId).then(function(seatRequest) {
		var boatday = seatRequest.get('boatday');
		seatRequest.save(data).then(function(seatRequest) {
			var cbDone = function() {
				var Notification = Parse.Object.extend('Notification');
				new Notification().save({
					action: isApproved ? 'reschedule-approved' : 'reschedule-denied',
					fromTeam: false,
					sendEmail: true,
					message: null,
					to: boatday.get('captain'),
					from: seatRequest.get('profile'),
					request: seatRequest
				}).then(function() {
					response.success(message);
				}, function(error) {
					console.log(error);
				});
			};

			if( isApproved ) {
				boatday.increment('bookedSeats', seatRequest.get('seats'));
				boatday.save().then(function() {
					cbDone();
				}, function(error) {
					console.log(error);
				});
			} else {
				cbDone();
			}
		}, function(error) {
			console.log(error);
		});
	}, function(error) {
		console.log(error);
	})		
});

Parse.Cloud.define("updateHostBankAccount", function(request, response) {

	var hostId = request.params.host;
	var accountHolder = request.params.accountHolder;
	var accountNumber = request.params.accountNumber;
	var accountRouting = request.params.accountRouting;
		
	Parse.Config.get().then(function(config) {
		
		var host = new Parse.Query(Parse.Object.extend('Host'));
		host.include('user');
		host.get(hostId).then(function(host) {

			var data = {
				"managed": true,
				"country": "US",
				"default_currency": "usd",
				"email": host.get('user').get('email'),
				"product_description": "BoatDay Host",
				"statement_descriptor": "BoatDay App",
				"tos_acceptance[ip]": "83.83.83.83",
				"tos_acceptance[date]": parseInt(new Date().getTime() / 1000),
				"tos_acceptance[user_agent]": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.4.8 (KHTML, like Gecko) Version/8.0.3 Safari/600.4.8",
				"legal_entity[type]": host.get('type') == 'business' ? "company" : "individual",
				"legal_entity[first_name]": host.get('firstname'),
				"legal_entity[last_name]": host.get('lastname'),
				"legal_entity[address][line1]": host.get('street'),
				"legal_entity[address][city]": host.get('city'),
				"legal_entity[address][state]": host.get('state'),
				"legal_entity[address][postal_code]": host.get('zipCode'),
				"legal_entity[address][country]": host.get('country'),
				"legal_entity[dob][day]": new Date(host.get('birthdate')).getDate(),
				"legal_entity[dob][month]": new Date(host.get('birthdate')).getMonth() + 1,
				"legal_entity[dob][year]": new Date(host.get('birthdate')).getFullYear(),
				"external_account[object]": "bank_account",
				"external_account[country]": "US",
				"external_account[currency]": "USD",
				"external_account[account_number]": accountNumber,
				"external_account[routing_number]": accountRouting,
			};

			if( host.get('businessName') ) {
				data["legal_entity[business_name]"] = host.get('businessName');
			}

			Parse.Cloud.httpRequest({
				method : 'POST',
				url : 'https://api.stripe.com/v1/accounts',
				headers : {
					Authorization : "Bearer " + config.get('STRIPE_SECRET_KEY')
				},
				body : data,
				success : function(httpResponse) {
					host.save({ 
						accountHolder: accountHolder,
						accountNumber: accountNumber,
						accountRouting: accountRouting,
						stripeId: httpResponse.data.id,
						// stripeResponse: httpResponse.data // Do not store because it is too dangerous if someone sees the public/private keys
					}).then(function() {
						response.success();
					});
				},
				error : function(httpResponse) {
					response.error(httpResponse.data.error.message);
				}
			});
		});
	});
});

Parse.Cloud.define("attachUserProfileToInstallation", function(request, response) {

	Parse.Cloud.useMasterKey();

	var query = new Parse.Query(Parse.Installation);
	query.equalTo('deviceToken', request.params.token);
	query.first().then(function(install) {
		new Parse.Query(Parse.Object.extend('_User')).get(request.params.user).then(function(user) {
			new Parse.Query(Parse.Object.extend('Profile')).get(request.params.profile).then(function(profile) {
				install.set('user', user);
				install.set('profile', profile);
				install.save().then(function() {
					response.success();
				});
			});
		});
	});

});

Parse.Cloud.define("attachUserProfileToInstallationWithInstallationId", function(request, response) {

	Parse.Cloud.useMasterKey();

	var query = new Parse.Query(Parse.Installation);
	query.equalTo('installationId', request.params.installationId);
	query.first().then(function(install) {
		if( install ) {
			new Parse.Query(Parse.Object.extend('_User')).get(request.params.user).then(function(user) {
				new Parse.Query(Parse.Object.extend('Profile')).get(request.params.profile).then(function(profile) {
					install.set('user', user);
					install.set('profile', profile);
					install.save().then(function() {
						response.success();
					});
				});
			});
		} else {
			// yes
			console.log('** no installation found for "' + request.params.installationId +'" **');
			response.success();
		}
	});

});

Parse.Cloud.define("grantCmsAdmin", function(request, response) {  
	
	if( !request.params.userId ) 
		response.error("please, give a userId in POST param");

	var query = new Parse.Query(Parse.Role); 
	query.equalTo("name", "admin-cms");
	query.first().then(function(role) {
		new Parse.Query(Parse.User).get(request.params.userId).then(function(user) {
			Parse.Cloud.useMasterKey();
			role.getUsers().add(user);
			role.save().then(function() {
				response.success();	
			}, function(error) {
				response.error(error.message);
			});
		}, function(error) {
			response.error(error.message);
		});
	}, function(error) {
		response.error(error.message);
	});

});

Parse.Cloud.afterSave("CaptainRequest", function(request) {

	var Mailgun = require('mailgun');
	var captainRequest = request.object.id;

	var cbError = function(error) {
		console.log(error);
		response.error("error in 'sendDriverEmail' check logs for more informations [captainRequest="+captainRequest+"].");
	};

	Parse.Config.get().then(function(config) {

		Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));
		
		var query = new Parse.Query(Parse.Object.extend('CaptainRequest'));
		query.include('boat');
		query.include('fromHost');
		query.get(captainRequest).then(function(request) {
		
			var hostlname = request.get('fromHost').get('lastname');
			var hostfname = request.get('fromHost').get('firstname'); 
			var boatname = request.get('boat').get('name');

			Mailgun.sendEmail({
				to: request.get("email"),
				from: config.get("CAPTAIN_EMAIL_FROM"),
				subject: hostfname+" "+hostlname+" has invited you to join BoatDay",
				text: 	"Hi,\n\n"+hostfname+" "+hostlname+" has invited you to become a Captain for his boat "+boatname+".\nClick the link below to register as a Captain and begin hosting great BoatDays aboard "+boatname+".\n\nhttps://www.boatdayhosts.com\n\nThanks,\nThe BoatDay Team"
			}).then(function(httpResponse) {
				response.success('Email sent');
			}, cbError);
		}, cbError);
	});
});

Parse.Cloud.afterSave("Notification", function(request) {

	var notification = request.object;

	Parse.Config.get().then(function(config) {
		var queryNotification = new Parse.Query(Parse.Object.extend('Notification'));
		queryNotification.include('to');
		queryNotification.include('to.user');
		queryNotification.include('to.host');
		queryNotification.include('from');
		queryNotification.include('from.user');
		queryNotification.include('from.host');
		queryNotification.include('boatday');
		queryNotification.include('request');
		queryNotification.get(notification.id).then(function(notification) {

			if( typeof notification.get('alertsSent') !== typeof undefined && notification.get('alertsSent') ) {
				console.log('*** Alerts already sent for ' + notification.id);
				return ;
			} else {
				console.log('*** Needs to send alerts');
			}

			var isHost = typeof notification.get('to').get('host') !== typeof undefined;
			var phoneNumber = !isHost ? notification.get('to').get('phone') : notification.get('to').get('host').get('phone');

			var sendPush = false;
			var pushMessage = null;

			var sendEmail = false;
			var emailFrom = "no-reply@boatdayapp.com";
			var emailSubject = "New BoatDay Message";
			var emailMessage = "Hi " + notification.get('to').get('displayName') + ",\n\nYou have a new message in your BoatDay inbox, access the BoatDay Host Center - https://www.boatdayhosts.com - to read your messages.\n\nWelcome aboard,\nThe BoatDay Team";
			
			var sendText = false;
			var textMessage = null; 

			var bdName = typeof notification.get('boatday') !== typeof undefined ? notification.get('boatday').get('name') : '';
			var bdHostLink = typeof notification.get('boatday') !== typeof undefined ? 'https://www.boatdayhosts.com/#/boatday-overview/'+ notification.get('boatday').id  : '';

			// ToDo 
			// - request-approved: append to message "Share your personal invite link to give friends $[responsive #] off to join you onboard. Get a $[responsive #] credit for every friend that joins the fun.(invite friends button) [BooatDay Preview/summary view]."
			// - request-approved: add deeplink to chat wall.

			switch( notification.get('action') ) {
				case "request-approved": // Done (ToDo remaining)
					// To Guest
					var sendPush = true;
					var pushMessage = "Your seat request has been approved - " + bdName;
					// var sendEmail = true;
					// var emailSubject = "Your BoatDay is confirmed - " + bdName + "!";
					// var emailMessage = "Hi " + notification.get('to').get('displayName') +",\n\nGrab your bathing suit because youre going boating!\n\n" + notification.get('from').get('displayName') + " has confirmed your request for " + notification.get('request').get('seats')+ " seats on " + bdName +". Review the details of your trip and use the chat wall [link to app chat wall] to coordinate any last-minute details with your Host.\n\nInvite friends to join you!";
					break;
				case "request-denied": // Done Push
					// To Guest
					var sendPush = true;
					var pushMessage = "Your seat request was denied - " + bdName;
					// var sendEmail = true;
					// var emailSubject = "Your BoatDay Request - " + bdName;
					// var emailMessage = "Hi " + notification.get('to').get('displayName') + ",\n\nYour request for " + notification.get('request').get('seats') + " seats on " + bdName + " has been denied by the Host.\n\nStill looking for a great "+ notification.get('boatday').get('category') +" BoatDay nearby? Take a look at these other great trips available in the area.\n\nTo make it even better, book with the promo code [auto generated Promo Code] to get $[responsive #] off your day out! [Preview of BoatDays matching criteria of rejected BoatDay] [View More BoatDays button]";
					break;
				case "request-cancelled-host": // Done Push
					// To Guest
					var sendPush = true;
					var pushMessage = "Uh oh! You were removed by the Host from the BoatDay " + bdName + ".";
					// var sendEmail = true;
					// var emailSubject = "BoatDay Cancellation - " + bdName;
					// var emailMessage = "Hi " + notification.get('to').get('displayName') + ",\n\nLooks like you were removed from the BoatDay " + bdName + " by the Host. Still looking for a great "+ notification.get('boatday').get('category') + " BoatDay nearby? Take a look at these other great trips available in the area.\n\nWait! It gets better . . . book with the promo code [auto generated Promo Code] to get $[responsive #] off your day out!  [Preview of BoatDays matching criteria of rejected BoatDay] [View More BoatDays button] \n\n If you think you were removed from this BoatDay by mistake contact [email link - support@boatdayapp.com] us and let us know.";
					break;
				case "boatday-question": // Done
					// To Host
					var sendText = true;
					var textMessage = "Good news! A Guest has asked a question about one of your BoatDays. Click " + bdHostLink + '?show=question to view.';
					break;
				case "boatday-answer": // Done
					// To Guest
					var sendPush = true;
					var pushMessage = notification.get('from').get('displayName') + " has answered your question about " + bdName + ".";
					break;
				case "boatday-request": // Done
					// To Host
					var sendText = true;
					var textMessage = "Great news! You have a new BoatDay request. Click " + bdHostLink + "?show=request to view.";
					break;
				case "boatday-cancelled": // Done Push
					// To Guest
					var sendPush = true;
					var pushMessage = "Uh oh! Your BoatDay " + bdName + " was cancelled by the Host.";
					// var sendEmail = true;
					// var emailSubject = "BoatDay Cancellation - " + bdName;
					// var emailMessage = "Hi " + notification.get('to').get('displayName') + ",\n\nLooks like your BoatDay " + bdName + " was cancelled by the Host. Don't worry, there are still lots of great " + notification.get('boatday').get('category') + " BoatDays nearby, like one of these other fun trips.\n\nBut wait, it gets better! Book with the promo code [auto generated Promo Code] and get $[responsive #] off your day out!  [Preview of BoatDays matching criteria of rejected BoatDay] [View More BoatDays button].";
					break;
				case "boatday-message": // Done
					// To Guest + Host
					if( !isHost ) {
						var sendPush = true;
						var pushMessage = "You have a new chat message for " + bdName + "!";
					} else {
						var sendText = true;
						var textMessage = "You have a new Guest message in your BoatDay Account. Click " + bdHostLink + "?show=message to view.";
					}
					break;
				case "boatday-reschedule": // Done Push
					// To Guest
					var sendPush = true;
					var pushMessage = "Your BoatDay " + bdName + " was rescheduled by the Host.";
					// var sendEmail = true;
					// var emailSubject = "Rescheduled BoatDay - " + bdName;
					// var emailMessage = "Hi " + notification.get('to').get('displayName') + ",\n\nYour BoatDay " + bdName + " has been rescheduled by the Host. [Graphic - Host pic + rescheule message] [Graphic rescheuled boatday info]. Click here to confirm or deny your seat(s) for the rescheduled trip [Two Buttons - Confirm Seat, Can't Make it].\n\nCan't make it? Don't worry, there are still lots of great "+ notification.get('boatday').get('category') + " BoatDays nearby, like one of these other fun trips.\n\nBut wait, it gets better! Book with the promo code [auto generated Promo Code] and get $[responsive #] off your day out!  [Preview of BoatDays matching criteria of BoatDay before rescheudling] [View More BoatDays button].";
					break;
				case "boatday-rating": // Done
					// To Guest
					var stars = notification.get('request').get('ratingHost');
					var sendPush = true;
					var pushMessage = "You just received a " + stars + " star" + (stars == 1 ? '' : 's') + " Host rating.";
					break;
				case "auto-payment": // Done
					// To Guest
					// Kimon: I dont think we send them anything, leave it for stripe email
					break;
				case "boatday-review": // Check with Kimon
					// To Host
					// Kimon: DUPLICATE OF ABOVE line 322
					break;
				case "boatday-payment":
					// To Host
					// Kimon: send once all payments done
					// var sendEmail = true;
					// var emailSubject = "BoatDay Payment Summary";
					// var emailMessage = "Hi " + notification.get('from').get('displayName') + ",\n\n Here's the payment summary for your BoatDay " + bdName + " (graphic showing BD thumbnail, date, time, # of Guests, payout # [with expand to view button to show per Guest/fees/etc] \n\nNote: Please allow 2-3 days for payment to appear in your Bank Account.\n\nIt's that easy! Create another BoatDay and plan your next day out. [Create BoatDay Link to Host Profile]";
					break;
				case "reschedule-approved": 
					// To Host
					var sendEmail = true;
					// var emailSubject = "Reschedule Accepted - " + bdName + "!";
					// var emailMessage = "Hi " + notification.get('from').get('displayName') + ",\n\n" + notification.get('to').get('displayName') + " is confirmed for your rescheduled BoatDay " + bdName + ". Don't forget, you can chat with all confirmed Guests from your BoatDay account [link to Chat wall for BD].  (graphic/preview of rescheduled BoatDay)\n\nHave a great day out!";
					break;
				case "reschedule-denied": 
					// To Host
					var sendEmail = true;
					// var emailSubject = "Reschedule Declined - " + bdName + "!";
					// var emailMessage = "Hi " + notification.get('from').get('displayName') + ",\n\n" + notification.get('to').get('displayName') + " is unable to attend your rescheduled BoatDay " + bdName + ". (graphic/preview of rescheduled BoatDay) \n\nGot some extra space on-board? Find more great BoatDay Guests from the BoatDay community! Share your BoatDay on Facebook or invite your friends directly.  [Invite Friends Button] Have a great day out!";
					break;
				case "certification-approved": // Done 
					// To Host
					var sendEmail = true;
					break;
				case "certification-denied": // Done 
					// To Host
					var sendEmail = true;
					break;
				case "host-approved": 
					// To Host
					var sendEmail = true;
					// var emailSubject = "Grab your Captain's hat, you're a BoatDay Host";
					// var emailMessage = "Hi " + notification.get('from').get('displayName') + ",\n\nGood news, your Host registration has been approved! \n\nYou're now just one step away from Hosting BoatDays. Register your Boat, and once its approved by the BoatDay Team, you'll be all set to accept your first Guests on-board! \n\nAlready added a boat? Create your first BoatDay while you wait for approval \n\nSee you on the water! \n\nBoatDay Registration Team (two buttons - add boat, create boatday)";
					break;
				case "host-denied": 
					// To Host
					var sendEmail = true;
					// var emailSubject = "Your BoatDay Host Registration";
					// var emailMessage = "Hi " + notification.get('from').get('displayName') + ",\n\nWe are unable to approve your Host registration at this time.\n\nWe'll be sure to let you know if your status changes, and how to continue with the registration process at that time.\n\nThanks for your interest in BoatDay,\n\nThe BoatDay Registration Team.";
					break;
				case "boat-approved": 
					// To Host
					var sendEmail = true;
					// var emailSubject = "Set sail on your approved boat";
					// var emailMessage = "Hi " + notification.get('from').get('displayName') + ",\n\nGet ready to set sail! \n\nYour Boat " + notification.get('boat').get('name') + " has been approved and you're all set to start Hosting BoatDays.\n\nHaven't created a BoatDay yet? Click below to plan your first BoatDay! [one button: create boatday) \n\nAlready created a BoatDay . . . it's now listed in the BoatDay app for Guest bookings. [BD Preview Card] See you on the water,\n\nThe BoatDay Registration Team.";
					break;
				case "boat-denied": 
					// To Host
					var sendEmail = true;
					// var emailSubject = "Your BoatDay Registration";
					// var emailMessage = "Hi " + notification.get('from').get('displayName') + ", \n\nYour boat registration has been denied. Don't worry, a member of our Registration team will contact you to let you know the reason, and what is still needed to register your Boat for Hosting BoatDays.\n\nSee you on the water soon, \n\nthe BoatDay Registration Team.";
					break;
				case "bd-message": // Done Guest
					// To Guest + Host
					if( !isHost ) {
						var sendPush = true;
						var pushMessage = "Hi " + notification.get('to').get('firstName') + "! Check your BoatDay notifications for a new message from the BoatDay team.";
					} else {
						var sendEmail = true;
						// var emailSubject = "Message from the BoatDay Team";
						// var emailMessage = "Hi " + notification.get('to').get('displayName') + ", You have a new message from the BoatDay team: \n\nnotification.get('message')";
					}
					break;
				default : // Done
					// To Guest + Host
					if( !isHost ) {
						var sendPush = true;
						var pushMessage = "You have a new notification!";
					} else {
						var sendEmail = true;
					}
					break;
			} 
			
			var promises = [];

			if( sendEmail && notification.get('to').get('user') && typeof notification.get('to').get('user').get("email") !== typeof undefined ) {
				console.log("-> send email");
				var Mailgun = require('mailgun');
				Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));
				var promiseEmail = Mailgun.sendEmail({
					to: notification.get('to').get('user').get("email"),
					from: emailFrom,
					subject: emailSubject,
					text: emailMessage
				}).then(function() {
					console.log("Notification sent to email: " + notification.get('to').get('user').get("email"));
				}, function(error) {
					console.log("Email error: " + error.data.message);
				});
				promises.push(promiseEmail);
			}

			if( sendText && typeof phoneNumber !== typeof undefined ) {
				
				console.log("-> send text: " + textMessage);

				var twilio = require('twilio')(config.get("TWILIO_ACCOUNT_SID"), config.get("TWILIO_AUTH_TOKEN"));
				
				var promiseText = new Parse.Promise();
				promises.push(promiseText);
				twilio.sendSms({
					to: phoneNumber,
					from: '+17865745669',
					body: textMessage 
				}, function(err, responseData) { 
					if (err) {
						console.log("Text sending error: ");
						console.log(err);
						promiseText.reject('** Error on text sending');
					} else {
						console.log("Notification sent to text: " + phoneNumber);
						promiseText.resolve();
					}
				});
			}

			if( sendPush ) {
				console.log("-> send push");

				var query = new Parse.Query(Parse.Installation);
				query.equalTo('profile', notification.get('to'));
				var promisePush = Parse.Push.send({
					where: query,
					data: { alert: pushMessage }
				}).then(function() {
					console.log("Notification sent to push");
				}, function(error) { 
					console.log(error);
				});
				promises.push(promisePush);
			}

			Parse.Promise.when(promises).then(function() {
				console.log("~> all sent!");
				// notification.save({ alertsSent: true });
			});
		});
	});
});

Parse.Cloud.afterSave("Profile", function(request) {

	var profile = request.object;

	if( typeof profile.get('user') === typeof undefined || !profile.get('user') ) {

		var query = new Parse.Query(Parse.Object.extend('_User'));
		query.equalTo('profile', profile);
		query.first().then(function(user) {
			if( user ) {
				console.log('found user='+user.id);
				profile.save({ user: user });
			}
		});
	}

});

Parse.Cloud.afterSave("Host", function(request) {

	var host = request.object;
	var Notification = Parse.Object.extend('Notification');
	var Mailgun = require('mailgun');

	if( host.get('status') == 'complete' &&  !host.get('notificationSent') ) {
			
		new Notification().save({
			action: 'bd-message',
			fromTeam: true,
			message: 'Welcome to BoatDay! We are currently reviewing your Host application. In the meantime, you can register a boat and start creating BoatDays.',
			to: host.get('profile'),
			sendEmail: false
		}).then(function() {
			host.save({ notificationSent: true });
		});

		Parse.Config.get().then(function(config) {

			Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));

			Mailgun.sendEmail({
				to: "registration@boatdayapp.com",
				from: config.get("CAPTAIN_EMAIL_FROM"),
				subject: "New BoatDay Host",
				text: "New Host."
			});

		});
	}

});

Parse.Cloud.afterSave("HelpCenter", function(request) {

	var Mailgun = require('mailgun');

	var feedback = request.object;

	Parse.Config.get().then(function(config) {

		var query = new Parse.Query(Parse.User);
		query.include('profile');
		query.get(feedback.get('user').id).then(function(user) {

			Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));

			Mailgun.sendEmail({
				to: "support@boatdayapp.com",
				from: config.get("CAPTAIN_EMAIL_FROM"),
				subject: 'HelpCenter from ' + user.get('profile').get('displayName') + ' <'+user.get('email')+'> : ' + feedback.get('category'),
				text: feedback.get('feedback')
			});

		});

	});

});

Parse.Cloud.afterSave("Report", function(request) {

	var Mailgun = require('mailgun');

	var report = request.object;

	Parse.Config.get().then(function(config) {

		var query = new Parse.Query(Parse.Object.extend('Report'));
		query.include('fromProfile');
		query.include('user');
		query.get(report.id).then(function(report) {

			Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));
			
			var email = typeof report.get('user').get('email') !== typeof undefined ? report.get('user').get('email') : 'no email';

			Mailgun.sendEmail({
				to: "support@boatdayapp.com",
				from: config.get("CAPTAIN_EMAIL_FROM"),
				subject: 'Report from ' + report.get('fromProfile').get('displayName') + ' <'+email+'> : ' + report.get('action'),
				text: report.get('message')
			});

		});

	});

});

Parse.Cloud.beforeSave("FileHolder", function(request, response) {
	
	var fh = request.object;

	if( !fh.get('order') ) {
		var query = new Parse.Query(Parse.Object.extend('FileHolder'));
		query.equalTo("host", fh.get('host'));
		query.descending('order');
		query.count().then(function(t) {
			if( t > 0 ) {
				query.first().then(function(_fh) {
					fh.set('order', _fh.get('order') + 1);
					response.success();
				});
			} else {
				fh.set('order', 1);
				response.success();	
			}
		});
	} else {
		response.success();	
	}

});

Parse.Cloud.afterSave("SeatRequest", function(request) {
	
	var seatRequest = request.object;

	// ToDo 
	// - Charge automatically for charters at the begining
	
	new Parse.Query(Parse.Object.extend('BoatDay')).get(seatRequest.get('boatday').id).then(function(boatday) {
		
		var data = {};

		if( seatRequest.get('addToBoatDay') ) {

			if( boatday.get('bookingPolicy') == 'automatically' && seatRequest.get('status') == 'pending' ) {
			
				data.status = 'approved';
				
				boatday.increment('bookedSeats', seatRequest.get('seats'));

				var Notification = Parse.Object.extend('Notification');
					
				new Notification().save({
					action: 'request-approved',
					fromTeam: false,
					message: null,
					to: seatRequest.get('profile'),
					from:  boatday.get('captain'),
					boatday: boatday,
					sendEmail: false,
					request: seatRequest
				});
			}

			data.addToBoatDay = false;

			boatday.relation('seatRequests').add(seatRequest);
			boatday.save().then(function() {

				new Parse.Query(Parse.Object.extend('Host')).get(boatday.get('host').id).then(function(host) {
					
					var Notification = Parse.Object.extend('Notification');

					new Notification().save({
						action: 'boatday-request',
						fromTeam: false,
						message: null,
						to: host.get('profile'),
						from: seatRequest.get('profile'),
						boatday: boatday,
						sendEmail: true,
						request: seatRequest
					}).then(function() {
						console.log('**** Done');
					}, function(error) {
						console.log('**** Error');
						console.log(error);
					});
				});
			});

			seatRequest.save(data);
		} 

		if( seatRequest.get('contribution') && !seatRequest.get('contributionPaid')) {

			var Stripe = require('stripe');
			var card = seatRequest.get('card');
			var amount = seatRequest.get('contribution');

			seatRequest.get('card').fetch().then(function(card) {

				Parse.Config.get().then(function(config) {
						
					Stripe.initialize(config.get('STRIPE_SECRET_KEY'));

					var data = {
						amount: amount * 100,
						currency: "usd",
						customer: card.get('stripeId'),
						statement_descriptor: 'BoatDay App',
						description: 'BoatDay contribution for ' + seatRequest.get('seats') + ' seat' + ( seatRequest.get('seats') == 1 ? '' : 's' )
					};

					seatRequest.get('user').fetch().then(function(user) {

						if( typeof seatRequest.get('user').get('email') != typeof undefined ) {
							data.receipt_email = seatRequest.get('user').get('email');
						} else {
							data.receipt_email = "receipts@boatdayapp.com";
						}

						Stripe.Charges.create(data, {
							success: function(httpResponse) {
								seatRequest.save({ 
									contributionPaid: true,
									stripeCharge: httpResponse.id
								});
							},
							error: function(httpResponse) {
								console.log(httpResponse);
								console.log("##### Uh oh, something went wrong");
							}
						});
					});
					
				});
			});
		}

		if( seatRequest.get('status') == 'cancelled-guest' && !seatRequest.get('cancelled') ) {

			new Parse.Query(Parse.Object.extend('Host')).get(boatday.get('host').id).then(function(host) {

				Parse.Config.get().then(function(config) {

					var payCancellation = function(data) {

						seatRequest.get('card').fetch().then(function(card) {

							var guestShare = host.get('type') == 'business' ? config.get('PRICE_GUEST_CHARTER_PART') : config.get('PRICE_GUEST_PRIVATE_PART');
							var guestFee = Math.ceil(boatday.get('price') / (1 - guestShare)) - boatday.get('price');
							var priceSeatTotal = boatday.get('price') + guestFee - ( seatRequest.get('bdDiscountPerSeat') + data.promoCodeSeat );
							var priceTotal = priceSeatTotal * seatRequest.get('seats') - ( seatRequest.get('bdDiscount') + data.promoCode );
							var chargedAmount = config.get('TRUST_AND_SAFETY_FEE') * seatRequest.get('seats');

							// console.log("data=");
							// console.log(data);
							// console.log("price="+boatday.get('price'));
							// console.log("bdDiscountPerSeat="+seatRequest.get('bdDiscountPerSeat'));
							// console.log("bdDiscount="+seatRequest.get('bdDiscount') );
							// console.log("guestShare="+guestShare);
							// console.log("guestFee="+guestFee);
							// console.log("priceSeatTotal="+priceSeatTotal);
							// console.log("priceTotal="+priceTotal);
							// console.log("chargedAmount="+chargedAmount);

							var _d = new Date(boatday.get('date'));
							var baseDate = new Date(_d.getFullYear(), _d.getMonth(), _d.getDate(), 0, 0, 0, 0);

							if( boatday.get('cancellationPolicy') == 'flexible' ) {

								console.log("** flexible **");

								var maxTime = baseDate.getTime() - 1 * 24 * 3600000;

								if( new Date().getTime() > maxTime ) {
									chargedAmount += priceTotal;
								}

							} else if( boatday.get('cancellationPolicy') == 'moderate' ) {
								
								console.log("** moderate **");
								
								var maxTime = baseDate.getTime() - 3 * 24 * 3600000;

								if( new Date().getTime() > maxTime ) {
									chargedAmount += priceTotal;
								}

							} else if( boatday.get('cancellationPolicy') == 'strict' ) {

								console.log("** strict **");

								var maxTime = baseDate.getTime() - 5 * 24 * 3600000;

								if( new Date().getTime() > maxTime ) {
									chargedAmount += priceTotal;
								} else {
									chargedAmount += priceTotal * 0.5;
								}

							}

							console.log('** Cancellation amount: '+ chargedAmount);

							var Stripe = require('stripe');
							Stripe.initialize(config.get('STRIPE_SECRET_KEY'));

							var desc = seatRequest.id;
							Stripe.Charges.create({
								amount: chargedAmount * 100,
								currency: "usd",
								customer: card.get('stripeId'),
								statement_descriptor: 'BoatDay App',
								description: 'BoatDay cancellation for ' + seatRequest.get('seats') + ' seat' + ( seatRequest.get('seats') == 1 ? '' : 's' )
							}, {
								success: function(httpResponse) {
									seatRequest.save({ 
										cancelled: true,
										contribution: chargedAmount,
										contributionPaid: true,
									}).then(function() {
										// Save Notification boatday-review
									});
								},
								error: function(httpResponse) {
									console.log(httpResponse);
									console.log("##### Uh oh, something went wrong");
								}
							});
						});
					};
					
					if( seatRequest.get('promoCode') ) {
						seatRequest.get('promoCode').fetch().then(function(coupon) {
							payCancellation({
								promoCodeSeat: coupon.get('perSeat') ? coupon.get('discount') : 0,
								promoCode: coupon.get('perSeat') ? 0 : coupon.get('discount')
							});
						});
					} else {
						payCancellation({
							promoCodeSeat: 0,
							promoCode: 0
						});
					}
				});
			});
		}
	});

});

Parse.Cloud.beforeSave("CreditCard", function(request, response) {
	
	var card = request.object;

	if( !card.get('stripeId') ) {
		Parse.Config.get().then(function(config) {
			var query = new Parse.Query(Parse.Object.extend('_User'));
			query.include('profile');
			query.get(request.user.id).then(function(user) {
				
				var data = {
					source: card.get('token'),
					description: card.id,
				};

				var profile = user.get('profile');

				if( typeof user.get('email') !== typeof undefined ) {
					data.email = user.get('email');
				}

				if( typeof profile !== typeof undefined 
					&& typeof profile.get('firstName') !== typeof undefined 
					&& typeof profile.get('lastName') !== typeof undefined ) {
					data.description = profile.get('firstName') + ' ' + profile.get('lastName') + ' (User ' + user.id + ', Profile ' + profile.id + ', Card ' + card.get('last4') + ')';
				}

				Parse.Cloud.httpRequest({
					method: 'POST',
					url: 'https://api.stripe.com/v1/customers',
					headers: {
						Authorization : "Bearer " + config.get('STRIPE_SECRET_KEY')
					},
					body: data,
					success: function(httpResponse) {
						card.save({ stripeId: httpResponse.data.id });
						response.success();
					},
					error: function(httpResponse) {
						console.log(httpResponse.data.error.message);
						response.error(httpResponse.data.error.message);
					}
				});
			});
		});
	}
	
});

Parse.Cloud.afterSave("ChatMessage", function(request) {
	
	var message = request.object;
	var Notification = Parse.Object.extend('Notification');
	var _ = require('underscore');

	if( message.get('addToBoatDay') ) {
		message.save({ addToBoatDay: false });
		new Parse.Query(Parse.Object.extend('BoatDay')).get(message.get('boatday').id).then(function(boatday) {
			boatday.relation('chatMessages').add(message);
			boatday.save().then(function() {
				// Notify host		
				new Parse.Query(Parse.Object.extend('Host')).get(boatday.get('host').id).then(function(host) {
					if( message.get('profile').id != host.get('profile').id ) {
						new Notification().save({
							action: 'boatday-message',
							fromTeam: false,
							message: null,
							to: host.get('profile'),
							from: message.get('profile'),
							boatday: boatday,
							sendEmail: false
						});
					}
					// Notify Captain
					if( message.get('profile').id != boatday.get('captain').id && boatday.get('captain').id != host.get('profile').id ) {
						console.log('** Notify Captain ***');
						new Notification().save({
							action: 'boatday-message',
							fromTeam: false,
							message: null,
							to: boatday.get('captain'),
							from: message.get('profile'),
							boatday: boatday,
							sendEmail: false
						});
					}
				});

				// Notify Users approved
				var query = new Parse.Query(Parse.Object.extend('SeatRequest'));
				query.equalTo('status', 'approved');
				query.equalTo('boatday', boatday);
				query.notEqualTo('profile', message.get('profile'));
				query.find().then(function(requests) {
					_.each(requests, function(request) {
						new Notification().save({
							action: 'boatday-message',
							fromTeam: false,
							message: null,
							to: request.get('profile'),
							from: message.get('profile'),
							boatday: boatday,
							sendEmail: false
						});
					});
				}, function(error) {
					console.log(error)
				});
			}, function(error) {
				console.log(error);
			});
		});
	}
});

Parse.Cloud.afterSave("Question", function(request) {
	
	var question = request.object;
	var Notification = Parse.Object.extend('Notification');
	var _ = require('underscore');

	if( question.get('addToBoatDay') ) {
		new Parse.Query(Parse.Object.extend('BoatDay')).get(question.get('boatday').id).then(function(boatday) {
			boatday.relation('questions').add(question);
			boatday.save().then(function() {
				question.save({ addToBoatDay: false });
				new Parse.Query(Parse.Object.extend('Host')).get(boatday.get('host').id).then(function(host) {
					new Notification().save({
						action: 'boatday-question',
						fromTeam: false,
						message: null,
						to: host.get('profile'),
						from: question.get('from'),
						boatday: boatday,
						sendEmail: true
					});
				});
			}, function(error) {
				console.log(error);
			});
		});
	}
});
