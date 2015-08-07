Parse.Cloud.define("fillFacebookEmails", function(request) {

	Parse.Cloud.useMasterKey();

	var _ = require('underscore');
    var query = new Parse.Query(Parse.Object.extend('_User'));
	query.equalTo('type', 'guest');
	query.equalTo('email', undefined);
	query.limit(10);
	query.find().then(function(users) {
		_.each(users, function(user) {
			if( Parse.FacebookUtils.isLinked(user) ) {
				Parse.Cloud.httpRequest({
					url: 'https://graph.facebook.com/me?fields=email,name&access_token='+user.get('authData').facebook.access_token,
					success: function(httpResponse) {
						console.log(httpResponse.data.name);
						console.log(httpResponse.data.email);
					},
					error: function(httpResponse) {
						console.log(httpResponse.data.error.message);
					}
				});
			}
		}); 
	}); 
});

Parse.Cloud.define("updateUserInHost", function(request, response) {

	Parse.Cloud.useMasterKey();

	var _users = [];

	var _ = require('underscore');
    var query = new Parse.Query(Parse.Object.extend('_User'));
	query.equalTo('status', 'creation');
	query.include('host');
	query.find().then(function(users) {
		_.each(users, function(user) {

			if( typeof user.get('host').get('user') == typeof undefined ) {
				user.get('host').save({ user: user });
				_users.push(user);	
			}

		}); 
		response.success(_users);
	}); 

});

Parse.Cloud.define("registerDevice", function(request, response) {

	Parse.Cloud.useMasterKey();

	var installation = new Parse.Object("_Installation");
	
	if( installation ) {
		new Parse.Query(Parse.Object.extend('_User')).get(request.params.user).then(function(user) {
			new Parse.Query(Parse.Object.extend('Profile')).get(request.params.profile).then(function(profile) {
				installation.save({
					deviceToken: request.params.deviceToken,
					deviceType: request.params.deviceType,
					user: user,
					profile: profile,
				}).then(function() {
					console.log('success');
				}, function(error) {
					console.log('error');
					console.log(error);
				});
			});
		});
	}

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

Parse.Cloud.define("notifyAllGuests", function(request, response) {

	var _ = require('underscore');
	var Notification = Parse.Object.extend('Notification');
	
	new Parse.Query(Parse.Object.extend('Profile')).get('fIdom0mjKs').then(function(bdProfile) {
		var query = new Parse.Query(Parse.Object.extend('_User'));
		query.equalTo('type', 'guest');
		query.include('profile');
		query.limit(1000);
		query.find().then(function(users) {
			_.each(users, function(user) {
				var profile = user.get('profile');
				new Notification().save({
					action: 'bd-message',
					sendEmail: false,
					fromTeam: false,
					from: bdProfile,
					to: profile,
					message: 'New launch special: 30% off all July BoatDays. Don’t miss the boat!',
				}).then(function() {
					
				}, function(error) {
					console.log(error);
				});
			});
		});
	});
});

Parse.Cloud.define("createStripeCustomers", function(request, response) {
	
	var _ = require('underscore');

	Parse.Config.get().then(function(config) {
		var query = new Parse.Query(Parse.Object.extend('CreditCard'));
		query.doesNotExist('stripeId');
		query.limit(50);
		query.find().then(function(ccs) {	
			_.each(ccs, function(cc) {
				console.log("token="+cc.get('token'));
				Parse.Cloud.httpRequest({
					method : 'POST',
					url : 'https://api.stripe.com/v1/customers',
					headers : {
						Authorization : "Bearer " + config.get('STRIPE_SECRET_KEY')
					},
					body : {
						source: cc.get('token'),
						description: cc.id,
					},
					success : function(httpResponse) {
						console.log("cusID="+httpResponse.data.id);
						cc.save({ stripeId: httpResponse.data.id });
					},
					error : function(httpResponse) {
						console.log("** Error **");
						cc.save({ stripeId: "failed" });
						console.log(httpResponse.data.error.message);
					}
				});
			});
		});
	});
});

// Parse.Cloud.define("sendDownloadSMS", function(request, response) {
	
// 	var client = require('twilio')('ACc00e6d3c6380421f6a05634a11494195', 'c820541dd98d43081cce417171f33cbc');
// 	var _ = require('underscore');

// 	var query = new Parse.Query(Parse.Object.extend('OldUserSMS'));
// 	query.limit(20);
// 	query.equalTo('sent', false);
// 	query.find().then(function(users) {

// 		_.each(users, function(user) {

// 			console.log(user.get('number'));

// 			client.sendSms({
// 				to: user.get('number'),
// 				from: '+17865745669',
// 				body: "BoatDay version 2 is here... Download the app today and book a memorable boating getaway for this weekend! #BetterBoating https://appsto.re/i6L445q" 
// 			  }, function(err, responseData) { 
// 				if (err) {
// 				  user.save({ sent: true });
// 				  console.log(err);
// 				} else { 
// 				  user.save({ sent: true });
// 				}
// 			  }
// 			);

// 		});

// 	}, function(error) {
// 		console.log(error);
// 	});


// });

// Parse.Cloud.define("sendSMS", function(request, response) {
	
// 	var client = require('twilio')('ACc00e6d3c6380421f6a05634a11494195', 'c820541dd98d43081cce417171f33cbc');

// 	// Send an SMS message
// 	client.sendSms({
// 		to: request.params.number,
// 		from: '+17865745669',
// 		body: request.params.body 
// 	  }, function(err, responseData) { 
// 		if (err) {
// 		  response.error(err);
// 		} else { 
// 		  response.success("SMS sent");
// 		}
// 	  }
// 	);

// });

// Parse.Cloud.define("createAdminCmsRole", function(request, response) {
	
// 	var cbBasicSuccess = function() {
// 		response.success();	
// 	};

// 	var cbBasicError = function(error) {
// 		response.error(error.message);
// 	}

// 	var roleACL = new Parse.ACL();
// 	roleACL.setPublicReadAccess(true);
// 	var role = new Parse.Role("admin-cms", roleACL);
// 	role.save().then(cbBasicSuccess, cbBasicError);

// });

// Parse.Cloud.define("emailOldGuests", function(request, response) {
	
// 	var Mailgun = require('mailgun');
// 	var _ = require('underscore');
// 	var fs = require('fs');

// 	Parse.Config.get().then(function(config) {

// 		Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));
		
// 		var tpl = _.template(fs.readFileSync('cloud/templates/email-canvas-01.html.js','utf8'));

// 		var query = new Parse.Query(Parse.Object.extend('OldUser'));
// 		query.limit(500);
// 		query.equalTo('sent', false);
// 		query.find().then(function(users) {

// 			_.each(users, function(user) {
					
// 				var _tpl = tpl({
// 					date: 'JUNE 10, 2015',
// 					more: 'https://itunes.apple.com/us/app/boatday/id953574487?ls=1&mt=8',
// 					moreText: 'Update now',
// 					title: 'BoatDay 2.0 has arrived',
// 					text: 'Hi '+user.get('fname')+',<br/>Great news, <strong>BoatDay</strong> version 2.0 is here!<br/>Download the latest update from the app store and book your spot on one of our daily boating getaways. Fishing, sailing watersports and more, don’t miss the boat!'
// 				});

// 				/*
// 				Mailgun.sendEmail({
// 					to: user.get('email'),
// 				 	from: "Support@boatdayapp.com",
// 				 	subject: "BoatDay 2.0 has arrived",
// 				 	html: _tpl
// 				}).then(function(httpResponse) {
// 				 	user.save({ sent: true });
// 				}, function(error) {
// 				 	console.log(error);
// 				});
// 				*/
				
// 			});

// 		}, function(error) {
// 			console.log(error);
// 		});

// 	});
// });

Parse.Cloud.define("getHostsCreationStatus", function(request, response) {
	
	var _ = require('underscore');

	var query = new Parse.Query(Parse.Object.extend('_User'));
	query.matchesQuery('host', innerQuery);
	query.limit(1000);
	query.find().then(function(users) {

		var data = [];

		_.each(users, function(user) {
			data.push(user.get('email'));
		})

		response.success(data);
	})

});

// Parse.Cloud.define("attachPictureToBoat", function(request, response) {
	
// 	var a = [];
// 	var _ = require('underscore');

// 	new Parse.Query(Parse.Object.extend('Boat')).get(request.params.boat).then(function(boat) {
// 		new Parse.Query(Parse.Object.extend('FileHolder')).get(request.params.fileHolder).then(function(fh) {
// 			boat.relation('boatPictures').add(fh);
// 			boat.save().then(function() {
// 				response.success("done");
// 			}, function(error) {
// 				console.log(error);
// 				response.error("error");
// 			});
// 		});
// 	});

// });

Parse.Cloud.define("attachProfileToUser", function(request, response) {
	
	var a = [];
	var _ = require('underscore');

	new Parse.Query(Parse.Object.extend('_User')).find().then(function(users) {
		_.each(users, function(user) {
			new Parse.Query(Parse.Object.extend('Profile')).get(user.get('profile').id).then(function(profile) {
				console.log(profile.id);
				console.log(user.id);
				profile.save({ user: user });
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
		
		var query = new Parse.Query(Parse.Object.extend('CaptainRequest'));
		query.include('boat');
		query.include('fromHost');
		query.get(captainRequest).then(gotCaptainRequest, cbError);

	});

});

Parse.Cloud.afterSave("CaptainRequest", function(request) {

	Parse.Cloud.run('sendDriverEmail', {captainRequest: request.object.id });
		
});

Parse.Cloud.afterSave("Notification", function(request) {

	var notification = request.object;

	var queryNotification = new Parse.Query(Parse.Object.extend('Notification'));
	queryNotification.include('to');
	queryNotification.include('to.user');
	queryNotification.get(notification.id).then(function(notification) {

		// ToDo instead just the email exists in the account
		if( notification.get('to').get('user').get('type') != 'guest' && notification.get('sendEmail') ) {

			var Mailgun = require('mailgun');

			Parse.Config.get().then(function(config) {
				
				var name = notification.get('to').get('displayName');
				
				Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));

				Mailgun.sendEmail({
					to: notification.get('to').get('user').get("email"),
					from: config.get("CAPTAIN_EMAIL_FROM"),
					subject: "You have a new notification",
					text: 	"Hi "+name+",\n\nYou have a new message in your BoatDay inbox, access the BoatDay Host Center - https://www.boatdayhosts.com - to read your messages.\n\nWelcome aboard,\nThe BoatDay Team"
				});

			});

		} else {

			var query = new Parse.Query(Parse.Installation);
			query.equalTo('profile', notification.get('to'));

			switch( notification.get('action') ) {
				case "request-approved"       : var message = "Your seat request has been approved"; break;
				case "request-denied"         : var message = "Your seat request has been denied"; break;
				case "request-cancelled-host" : var message = "You have been removed from a BoatDay."; break;
				case "boatday-cancelled"      : var message = "Your BoatDay has been cancelled by the Host."; break;
				case "auto-payment"           : var message = "Your BoatDay payment has been charged."; break;
				case "boatday-message"        : var message = "You have a new chat message for your BoatDay!"; break;
				case "boatday-rating"         : var message = "You just received a review!"; break;
				case "bd-message"             : var message = notification.get('message'); break;
				default                       : var message = "You have a new notification!"; break;
			} 

			Parse.Push.send({
				where: query, // Set our Installation query
				data: {
					alert: message
			  	}
			}, {
				success: function() { },
				error: function(error) {
					console.log(error);
				}
			});

		}
	});
});

// Parse.Cloud.afterSave("Profile", function(request) {

// 	var profile = request.object;

// 	if( profile.get('host') && !profile.get('stripeId')) {

// 		Parse.Config.get().then(function(config) {

// 			var query = new Parse.Query(Parse.Object.extend('Host'));
// 			query.include('user');
// 			query.get(profile.get('host').id).then(function(host) {

// 				Parse.Cloud.httpRequest({
// 					method : 'POST',
// 					url : 'https://api.stripe.com/v1/accounts',
// 					headers : {
// 						Authorization : "Bearer " + config.get('STRIPE_SECRET_KEY')
// 					},
// 					body : {
// 						managed: true,
// 						country: "US",
// 						default_currency: "usd",
// 						email: host.get('user').get('email'),
// 						// display_name: host.get('firstname') + ' ' + host.get('lastname'),
// 						"tos_acceptance[ip]": "83.83.83.83",
// 						"tos_acceptance[date]": new Date().getTime(),
// 						"tos_acceptance[user_agent]": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_2) AppleWebKit/600.4.8 (KHTML, like Gecko) Version/8.0.3 Safari/600.4.8",
// 						"legal_entity[type]": host.get('type') == 'business' ? "company" : "individual",
// 						"legal_entity[business_name]": "test",
// 						"legal_entity[first_name]": host.get('firstname'),
// 						"legal_entity[last_name]": host.get('lastname'),
// 						"legal_entity[dob][day]": new Date(host.get('birthdate')).getDate(),
// 						"legal_entity[dob][month]": new Date(host.get('birthdate')).getMonth(),
// 						"legal_entity[dob][year]": new Date(host.get('birthdate')).getFullYear(),
// 						"external_account[object]": "bank_account",
// 						"external_account[country]": "US",
// 						"external_account[currency]": "USD",
// 						"external_account[routing_number]": "110000000",
// 						"external_account[account_number]": "000123456789",
// 					},
// 					success : function(httpResponse) {
// 						profile.save({ stripeId: httpResponse.data.id });
// 					},
// 					error : function(httpResponse) {
// 						console.log(httpResponse);
// 					}
// 				});

// 			}, function(error) {
// 				console.log(error);
// 			});

// 		});
// 	}

// });

Parse.Cloud.afterSave("Host", function(request) {

	var host = request.object;

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

		Parse.Config.get().then(function(config) {

			Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));

			Mailgun.sendEmail({
				to: "registration@boatdayapp.com",
				from: config.get("CAPTAIN_EMAIL_FROM"),
				subject: "New BoatDay Host",
				text: "go to the CMS motherfucker"
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
					
					console.log(card.get('stripe').card.id);
					console.log(card.get('token'));
					console.log(card.get('stripeId'));

					Stripe.Charges.create({
						amount: amount * 100,
						currency: "usd",
						customer: card.get('stripeId'),
						// description: 'Guest Contribution Paid - ' + seatRequest.id
					},{
						success: function(httpResponse) {
							seatRequest.save({ contributionPaid: true });
							console.log("**** Purchase made!");
						},
						error: function(httpResponse) {
							console.log(httpResponse);
							console.log("##### Uh oh, something went wrong");
						}
					});
				});
			});
		}

		if( seatRequest.get('status') == 'cancelled-guest' && !seatRequest.get('cancelled') ) {

			console.log('*** make him pay!!!');

			new Parse.Query(Parse.Object.extend('Host')).get(boatday.get('host').id).then(function(host) {

				Parse.Config.get().then(function(config) {

					var seats = seatRequest.get('seats');
					var priceSeat = boatday.get('price');
					var ts_fee = config.get('TRUST_AND_SAFETY_FEE');
					var isCharter = host.get('type') == 'business';
					var guestShare = isCharter ? config.get('PRICE_GUEST_CHARTER_PART') : config.get('PRICE_GUEST_PRIVATE_PART');
					var guestFee = Math.ceil(priceSeat / (1 - guestShare)) - priceSeat;
					var priceSeatTotal = priceSeat + guestFee + ts_fee;
					var priceTotal = priceSeatTotal * seats;

					seatRequest.get('card').fetch().then(function(card) {
						
						var Stripe = require('stripe');

						Stripe.initialize(config.get('STRIPE_SECRET_KEY'));

						// var desc = seatRequest.id;

						// Stripe.Charges.create({
						// 	amount: priceTotal * 100,
						// 	currency: "usd",
						// 	customer: card.get('stripeId'),
						// 	// description: desc
						// },{
						// 	success: function(httpResponse) {
						// 		seatRequest.save({ 
						// 			cancelled:true,
						// 			contribution: priceTotal,
						// 			contributionPaid: true,
						// 		});
						// 	},
						// 	error: function(httpResponse) {
						// 		console.log(httpResponse);
						// 		console.log("##### Uh oh, something went wrong");
						// 	}
						// });
					});
				});
			});
		}
	});

	
});

Parse.Cloud.beforeSave("CreditCard", function(request, response) {
	
	var card = request.object;

	if( !card.get('stripeId') ) {
		Parse.Config.get().then(function(config) {
			Parse.Cloud.httpRequest({
				method : 'POST',
				url : 'https://api.stripe.com/v1/customers',
				headers : {
					Authorization : "Bearer " + config.get('STRIPE_SECRET_KEY')
				},
				body : {
					source: card.get('token'),
					description: card.id,
				},
				success : function(httpResponse) {
					card.save({ stripeId: httpResponse.data.id });
					response.success();
				},
				error : function(httpResponse) {
					console.log(httpResponse.data.error.message);
					response.error(httpResponse.data.error.message);
				}
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
						console.log('** Notify Host ***');
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
				var query = boatday.relation('seatRequests').query();
				query.equalTo('status', 'approved');
				query.notEqualTo('profile', message.get('profile').id);
				query.find().then(function(requests) {
					_.each(requests, function(request) {
						console.log('** Notify User ***');
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
				});

			}, function(error) {
				console.log(error);
			});

		});

	}

});
