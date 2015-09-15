
Parse.Cloud.define("saveAllProfilesWithoutUsers", function(request, response) {
 	var _ = require('underscore');
	Parse.Cloud.useMasterKey();
	
	var queryNull = new Parse.Query(Parse.Object.extend('Profile'));
	queryNull.equalTo('user', null);
	
	var queryUndefined = new Parse.Query(Parse.Object.extend('Profile'));
	queryUndefined.equalTo('user', null);

	var query = new Parse.Query.or(queryNull, queryUndefined);
	query.limit(1000);
	query.count().then(function(total) {
		console.log("#### Total objects = "+ total);
		query.find().then(function(objs) {
			_.each(objs, function(profile) {
				var query = new Parse.Query(Parse.Object.extend('_User'));
				query.equalTo('profile', profile);
				query.first().then(function(user) {
					if( user ) {
						console.log('found user='+user.id);
						profile.save({ user: user });
					} else {
						console.log("no user for this profile, proceed to delete");
						// profile.destroy();
					}
				});

			});
		});

	});
});

Parse.Cloud.define("notifyAllGuests", function(request, response) {
	var _ = require('underscore');

	var NotificationModel = Parse.Object.extend('Notification');
	var NotificationSentModel = Parse.Object.extend('NotificationSent');
	var ProfileModel = Parse.Object.extend('Profile');
	var UserModel = Parse.Object.extend('_User');
	
	new Parse.Query(ProfileModel).get('fIdom0mjKs').then(function(bdProfile) {

		var fetched = 0;
		var total = 0;
		var __sent = [];

		var doQuery = function() {
			queryNotificationSent.find().then(function(matches) {

				_.each(matches, function(_x_) {
					__sent.push(_x_.get('user').id);
				});

				fetched += matches.length;

				if( total > fetched) {
					queryNotificationSent.skip(fetched);
					doQuery();
				} else {
					var queryUsers = new Parse.Query(UserModel);
					queryUsers.equalTo('type', 'guest');
					queryUsers.notContainedIn('objectId', __sent);
					queryUsers.limit(300);
					queryUsers.find().then(function(users) {
						console.log("******* Users=" + users.length);
						
						_.each(users, function(user) {
							new Notification().save({
								action: 'bd-message',
								sendEmail: false,
								fromTeam: false,
								from: bdProfile,
								to: user.get('profile'),
								message: 'BoatDay deal of the week: Enjoy a full moon cruise this Friday or Saturday night! Use the promo code “FULL MOON” at checkout to get $15 off your booking.',
							}).then(function() {	
								var n = new NotificationSentModel();
								n.save({ 
									user: user,
									profile: user.get('profile')
								});
							}, function(error) {
								console.log(error);
							});
						});
					});
				}
			});
		};

		var queryNotificationSent = new Parse.Query(NotificationSent);
		queryNotificationSent.limit(500);
		queryNotificationSent.count().then(function(_total) {
			total = _total;
			doQuery();
		});
	});
});

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

Parse.Cloud.define("hostChangeCountryUSAToUS", function(request, response) {
 	var _ = require('underscore');
	Parse.Cloud.useMasterKey();
	var query = new Parse.Query(Parse.Object.extend('Host'));
	query.equalTo('country', 'USA');
	query.find().then(function(hosts) {
		_.each(hosts, function(host) {
			host.save({ country: 'US' });
		});
		response.success(hosts.length);
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

Parse.Cloud.define("sendDownloadSMS", function(request, response) {
	var client = require('twilio')('ACc00e6d3c6380421f6a05634a11494195', 'c820541dd98d43081cce417171f33cbc');
	var _ = require('underscore');
	var query = new Parse.Query(Parse.Object.extend('OldUserSMS'));
	query.limit(20);
	query.equalTo('sent', false);
	query.find().then(function(users) {
		_.each(users, function(user) {
			console.log(user.get('number'));
			client.sendSms({
				to: user.get('number'),
				from: '+17865745669',
				body: "BoatDay version 2 is here... Download the app today and book a memorable boating getaway for this weekend! #BetterBoating https://appsto.re/i6L445q" 
			  }, function(err, responseData) { 
				if (err) {
				  user.save({ sent: true });
				  console.log(err);
				} else { 
				  user.save({ sent: true });
				}
			  }
			);
		});
	}, function(error) {
		console.log(error);
	});
});

Parse.Cloud.define("sendSMS", function(request, response) {
	var client = require('twilio')('ACc00e6d3c6380421f6a05634a11494195', 'c820541dd98d43081cce417171f33cbc');
	// Send an SMS message
	client.sendSms({
		to: request.params.number,
		from: '+17865745669',
		body: request.params.body 
	  }, function(err, responseData) { 
		if (err) {
		  response.error(err);
		} else { 
		  response.success("SMS sent");
		}
	  }
	);
});

Parse.Cloud.define("createAdminCmsRole", function(request, response) {
	var roleACL = new Parse.ACL();
	roleACL.setPublicReadAccess(true);
	var role = new Parse.Role("admin-cms", roleACL);
	role.save().then(function() {
		response.success();	
	}, function(error) {
		response.error(error.message);
	});
});

Parse.Cloud.define("emailOldGuests", function(request, response) {
	var Mailgun = require('mailgun');
	var _ = require('underscore');
	var fs = require('fs');
	Parse.Config.get().then(function(config) {
		Mailgun.initialize(config.get("MAILGUN_DOMAIN"), config.get("MAILGUN_API_KEY"));
		var tpl = _.template(fs.readFileSync('cloud/templates/email-canvas-01.html.js','utf8'));
		var query = new Parse.Query(Parse.Object.extend('OldUser'));
		query.limit(500);
		query.equalTo('sent', false);
		query.find().then(function(users) {
			_.each(users, function(user) {
				var _tpl = tpl({
					date: 'JUNE 10, 2015',
					more: 'https://itunes.apple.com/us/app/boatday/id953574487?ls=1&mt=8',
					moreText: 'Update now',
					title: 'BoatDay 2.0 has arrived',
					text: 'Hi '+user.get('fname')+',<br/>Great news, <strong>BoatDay</strong> version 2.0 is here!<br/>Download the latest update from the app store and book your spot on one of our daily boating getaways. Fishing, sailing watersports and more, don’t miss the boat!'
				});
				/*
				Mailgun.sendEmail({
					to: user.get('email'),
				 	from: "Support@boatdayapp.com",
				 	subject: "BoatDay 2.0 has arrived",
				 	html: _tpl
				}).then(function(httpResponse) {
				 	user.save({ sent: true });
				}, function(error) {
				 	console.log(error);
				});
				*/
			});
		}, function(error) {
			console.log(error);
		});
	});
});

Parse.Cloud.define("attachPictureToBoat", function(request, response) {
	var a = [];
	var _ = require('underscore');
	new Parse.Query(Parse.Object.extend('Boat')).get(request.params.boat).then(function(boat) {
		new Parse.Query(Parse.Object.extend('FileHolder')).get(request.params.fileHolder).then(function(fh) {
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
