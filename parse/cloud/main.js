
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

		console.log(data);

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

	var queryNotification = new Parse.Query(Parse.Object.extend('Notification'));
	queryNotification.include('to');
	queryNotification.include('to.user');
	queryNotification.get(notification.id).then(function(notification) {

		if( notification.get('to').get('user') && typeof notification.get('to').get('user').get("email") !== typeof undefined && notification.get('sendEmail') ) {

			var Mailgun = require('mailgun');

			Parse.Config.get().then(function(config) {
				
				Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));

				Mailgun.sendEmail({
					to: notification.get('to').get('user').get("email"),
					from: config.get("CAPTAIN_EMAIL_FROM"),
					subject: "You have a new notification",
					text: 	"Hi " + notification.get('to').get('displayName') + ",\n\nYou have a new message in your BoatDay inbox, access the BoatDay Host Center - https://www.boatdayhosts.com - to read your messages.\n\nWelcome aboard,\nThe BoatDay Team"
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
		/*
		3767 5055 3631 017
		0046
		11 19

		osed64lXDK
	*/
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
				var query = new Parse.Query(Parse.Object.extend('SeatRequest'));
				query.equalTo('status', 'approved');
				query.equalTo('boatday', boatday);
				query.notEqualTo('profile', message.get('profile'));
				query.find().then(function(requests) {

					console.log("got requests")
					console.log(requests);

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

				}, function(error) {
					console.log('123 ww')
					console.log(error)
				});

			}, function(error) {
				console.log('123 xx')
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
