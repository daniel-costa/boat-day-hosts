define([
'models/CaptainRequestModel',
'models/NotificationModel',
'models/ChatMessageModel',
'models/BoatModel',
'models/BoatDayModel',
'views/BaseView',
'text!templates/DashboardTemplate.html',
'text!templates/DashboardCaptainRequestRowTemplate.html',
'text!templates/DashboardBoatRowTemplate.html',
'text!templates/DashboardBoatDayTemplate.html',
//'text!templates/DashboardBoatDayRowTemplate.html',
'text!templates/DashboardBoatDayRequestTemplate.html',
'text!templates/DashboardBoatDayMessageTemplate.html',
], function(CaptainRequestModel, NotificationModel, ChatMessageModel, BoatModel, BoatDayModel, BaseView, DashboardTemplate, DashboardCaptainRequestRowTemplate, DashboardBoatRowTemplate, DashboardBoatDayTemplate, DashboardBoatDayRequestTemplate, DashboardBoatDayMessageTemplate){
	var DashboardView = BaseView.extend({

		className: "view-dashboard",
		
		template: _.template(DashboardTemplate),
		
		events: {
			'click .captainRequest': 'processCaptainRequest',
			'click .boatday-box-close': 'closeBox',
			'click .boatday-box-open': 'openBox',
			'click .btn-cancel': 'cancelBoatDay',
			'click .btn-cancel-confirm': 'confirmCancellation',
			'click .seat-approve': 'seatApprove',
			'click .seat-deny': 'seatDeny',
			'click .seat-cancel': 'seatCancel',
			'keyup input': 'detectEnter',
			'click .profile-picture': 'detectClickOnProfile',
			'click .btn-promo': 'sharePromo',
			'click .btn-duplicate': 'duplicate',
		},
		
		captainRequests: {},

		boatdays: {},

		requests: {},

		theme: "dashboard",

		chatLastFetch: null,

		duplicate: function(event) {

			event.preventDefault();

			var query = new Parse.Query(Parse.Object.extend("BoatDay"));
			query.get($(event.currentTarget).closest('.my-boatday').attr('data-id')).then(function(boatDay) {
			  	new BoatDayModel({
			  		status:'creation',
			  		name: boatDay.get('name'), 
			  		description: boatDay.get('description'),
			  		date: null,
			  		departureTime: boatDay.get('departureTime'),
			  		arrivalTime: boatDay.get('arrivalTime'),
			  		duration: boatDay.get('duration'), 
			  		location: boatDay.get('location'),
			  		locationText: boatDay.get('locationText'), 
			  		availableSeats: boatDay.get('availableSeats'),
			  		price: boatDay.get('price'),
			  		bookingPolicy: boatDay.get('bookingPolicy'),
			  		cancellationPolicy: boatDay.get('cancellationPolicy'),
			  		category: boatDay.get('category'),
			  		arrivalTime: boatDay.get('arrivalTime'), 
				  	captain: boatDay.get('captain'),
				  	boat: boatDay.get('boat'),
				  	host: boatDay.get('host'), 
				  	chatMessages: boatDay.get('chatMessages'), 
				  	seatRequests: boatDay.get('seatRequests')
			  	}).save().then(function(bd) {
			  		Parse.history.navigate('boatday/'+bd.id, true);
			  	});
			});

		},

		detectEnter: function(event) {

			if( event.keyCode == 13 ) {
				event.preventDefault();
				$(event.currentTarget).blur();
				this.addMessage(event);
			}

		},

		sharePromo: function() {
            FB.ui({
				method: "feed",
				link: "http://www.boatdayapp.com/hosts",
				picture: "https://www.boatdayhosts.com/resources/FB-Ad2.png",
				name: "20% more for your first 5 BoatDays!",
				caption: "#BetterBoating with BoatDay!",
				description: "I just signed-up as a BoatDay Host! \n Own a boat? Sign-up as a Host using my invite code "+Parse.User.current().get('host').id+", and earn 20% more for your first 5 BoatDays."
			}, function( fbReturn ) {

			});
		},

		addMessage: function(event) {

			event.preventDefault();

			var self = this;
			var target = $(event.currentTarget);
			var boatday = self.boatdays[$(event.currentTarget).closest('.my-boatday').attr("data-id")];
			var msg = target.val();

			if( msg == '' ) {
				return;
			}

			target.val('');

			new ChatMessageModel({
				message: msg,
				boatday: boatday,
				profile: Parse.User.current().get('profile'),
				addToBoatDay: true
			}).save().then(function(message) {
				self.appendMessage(boatday.id, message);
				self._scrollDown(boatday.id);
				self.saveLastReading(boatday);
			}, function(error) {
				console.log(error);
			});

		},
		
		_scrollDown: function(boatdayId) {

			var item = this.$el.find('.my-boatday-'+boatdayId+' .box-messages .info');
			item.scrollTop(item.prop('scrollHeight'));
		},

		watchEnter: function(event) {

		},

		seatApprove: function(event) { this.seatChangeStatus(event, 'approved'); } ,
		seatDeny:    function(event) { this.seatChangeStatus(event, 'denied'); } ,
		seatCancel:  function(event) { this.seatChangeStatus(event, 'cancelled-host'); } ,

		seatChangeStatus: function(event, status) {
			
			event.preventDefault();

			if( typeof Parse.User.current().get('host').get('stripeId') === typeof undefined || !Parse.User.current().get('host').get('stripeId') ) {
				
				this.modal({
					title: 'How you get paid!',
					body: 'To confirm Guests on-board your BoatDay, you must first provide a payment account (its how Guests pay you!)<br/><br/>Don’t worry, this information is NEVER shared with other Users.',
					noButton: false,
					cancelButtonText: 'Do it later',
					yesButtonText: 'Add Payment Account',
					yesCb: function() {
						Parse.history.navigate('my-bank-account', true);
					}
				});

				return;
			}

			var self = this;
			var boatdayId = $(event.currentTarget).closest('.my-boatday').attr("data-id");
			var requestId = $(event.currentTarget).closest('.request').attr("data-id");
			var request = self.requests[boatdayId][requestId];

			self.buttonLoader('...', $(event.currentTarget));
			request.save({ status: status }).then(function() {
				
				if( status == 'approved' ) {
					request.get('boatday').increment('bookedSeats', request.get('seats'));
					request.get('boatday').save();
				}

				if( status == 'cancelled-host' ) {
					request.get('boatday').increment('bookedSeats', -1 * request.get('seats'));
					request.get('boatday').save();
				}
				
				new NotificationModel().save({
					action: 'request-'+status,
					fromTeam: false,
					message: null,
					to: request.get('profile'),
					from:  Parse.User.current().get('profile'),
					boatday: request.get('boatday'),
					sendEmail: false,
					request: request
				}).then(function() {
					self.buttonLoader();
					self.renderRequests(boatdayId);
				});

			});
		},

		cancelBoatDay: function(event) {

			$(event.currentTarget).closest('.info').find('.details').hide();
			$(event.currentTarget).closest('.info').find('.cancel').show();
		},

		confirmCancellation: function(event) {
			var self = this;
			var id = $(event.currentTarget).closest('.my-boatday').attr('data-id');
			var boatday = self.boatdays[id];
			
			var cancelReason = $(event.currentTarget).closest('.my-boatday').find('[name="cancelReason"]').val();

			if(cancelReason == '') {
				self.fieldError('cancelReason', 'Please indicate a reason');
				return;
			}

			self.buttonLoader('...', $(event.currentTarget));

			boatday.save({status: 'cancelled', cancelReason: cancelReason }).then(function(boatday) {
				
				self.cleanForm();

				boatday.relation('seatRequests').query().find().then(function(requests) {

					_.each(requests, function(request) {

						// Cancel boatday for each participant
						new NotificationModel().save({
							action: 'boatday-cancelled',
							fromTeam: false,
							message: null,
							to: request.get('profile'),
							from:  Parse.User.current().get('profile'),
							boatday: boatday,
							sendEmail: false,
							request: request
						}).then(function() {
							request.save({ status: 'cancelled-host' }).then(function() {
								self.buttonLoader();
								self.render();
								self._info('Your BoatDay ' + boatday.get('name') + ' is now cancelled.');
							});
						});
						
					});

					Parse.history.loadUrl(Parse.history.fragment);
				})
			});
		},

		openBox: function(event) {
			var self = this;
			$(event.currentTarget).closest('.my-boatday').find('.boatday-share').hide();
			$(event.currentTarget).closest('.my-boatday').find($(event.currentTarget).attr('data-target')).fadeIn();

			if($(event.currentTarget).attr('data-target') == '.box-messages') {
				var boatdayId = $(event.currentTarget).closest('.my-boatday').attr('data-id');
				var boatday = this.boatdays[boatdayId];

				this._scrollDown(boatdayId);

				this.saveLastReading(boatday);
			}
		},

		saveLastReading: function(boatday) {
			var self = this;
			if( boatday.get('host').id == Parse.User.current().get('host').id ) {
				boatday.save({ hostLastRead: new Date() }).then(function() {
					self.displayMessagesUnread(boatday, 0);
				});
			} else if( boatday.get('captain').id == Parse.User.current().get('profile').id ) {
				boatday.save({ captainLastRead: new Date() }).then(function() {
					self.displayMessagesUnread(boatday, 0);
				});
			}
		},

		closeBox: function(event) {
			$(event.currentTarget).closest('.my-boatday').find('.boatday-share').show();
			$(event.currentTarget).closest('.box').fadeOut();
		},

		processCaptainRequest: function(event) {

			var self = this;
			var e = $(event.currentTarget);
			this.captainRequests[e.attr('data-id')].save({ 
				status: e.is('.accept') ? 'approved' : 'denied' 
			}).then(function() {
				self.render();
			});
			
		},

		render: function() {

			BaseView.prototype.render.call(this);
			
			var self = this;

			self.$el.find('.left-navigation .menu-host-center').addClass('active');
			self.$el.find('.left-navigation .menu-host-center').text('Dashboard');
			self.$el.find('.add-boat, .add-boatday, .my-boatdays, .my-boats, .my-requests').hide();

			var queryBoats = new Parse.Query(BoatModel);
			queryBoats.equalTo("host", Parse.User.current().get("host"));
			queryBoats.ascending('name');
			queryBoats.select("name", "buildYear", "type", "status"); 

			var startingDate = new Date(new Date().getFullYear(), new Date().getMonth(), new Date().getDate());

			var queryBoatDaysHost = new Parse.Query(BoatDayModel);
			queryBoatDaysHost.equalTo("host", Parse.User.current().get("host"));
			queryBoatDaysHost.equalTo("status", "complete");
			queryBoatDaysHost.greaterThanOrEqualTo("date", startingDate);

			var queryBoatDaysCaptain = new Parse.Query(BoatDayModel);
			queryBoatDaysCaptain.equalTo("captain", Parse.User.current().get("profile"));
			queryBoatDaysCaptain.equalTo("status", "complete");
			queryBoatDaysCaptain.greaterThanOrEqualTo("date", startingDate);
			
			var queryBoatDays = new Parse.Query.or(queryBoatDaysHost, queryBoatDaysCaptain);
			queryBoatDays.ascending('date,departureTime');
			queryBoatDays.include('boat');
			queryBoatDays.include('captain');

			var queryCaptainRequests = new Parse.Query(CaptainRequestModel);
			queryCaptainRequests.ascending('createdAt');
			queryCaptainRequests.equalTo('email', Parse.User.current().getEmail());
			queryCaptainRequests.include('boat');
			queryCaptainRequests.include('fromProfile');
			queryCaptainRequests.find().then(function(requests) {

				if(requests.length == 0) {
					return;
				}
				
 				var tpl = _.template(DashboardCaptainRequestRowTemplate);
				var target = self.$el.find('.my-requests .content');
				target.html('');

				_.each(requests, function(request) {
					target.append(tpl({
						id: request.id,
						status: request.get('status'),
						displayName: request.get('fromProfile').get('displayName'),
						profilePicture: request.get('fromProfile').get('profilePicture').url(),
						boatName: request.get('boat').get('name'),
						boatType: request.get('boat').get('type'),
						buildYear: request.get('boat').get('buildYear')
					}));

					self.captainRequests[request.id] = request;
 				});
				
				self.$el.find('.my-requests').fadeIn();

			});

			Parse.Promise.when(queryBoats.find(), queryBoatDays.find()).then(function(boats, boatdays) {

				if(boats.length == 0 && boatdays.length == 0) {
					self.$el.find('.add-boat').fadeIn();
					self.$el.find('.menu-new-boatday').hide();
					self.$el.find('.menu-my-boatdays').hide();
				}

				if(boats.length > 0 && boatdays.length == 0) {
					self.$el.find('.add-boatday').fadeIn();
				}

				if( boats.length > 0 ) {

					var tpl = _.template(DashboardBoatRowTemplate);
					var target = self.$el.find('.my-boats .content .rows');
					target.html('');

					_.each(boats, function(boat) {

						var _tpl = tpl({
							id: boat.id,
							name: boat.get('name'),
							buildYear: boat.get('buildYear'),
							type: boat.get('type'),
							status: boat.get('status'),
							picture: 'resources/boat-placeholder.png'
						});

						target.append(_tpl);
						
						var q = boat.relation('boatPictures').query();
						q.ascending('order');
						q.first().then(function(fileholder) {
							if( fileholder ) {
								self.$el.find('.my-boats .my-boat-'+boat.id+' .picture').css({ backgroundImage: 'url('+fileholder.get('file').url()+')' });
							}
						});
					});

					self.$el.find('.my-boats').fadeIn();
				}
		
				if( boatdays.length > 0 ) {

					var tpl = _.template(DashboardBoatDayTemplate);
					var target = self.$el.find('.my-boatdays .content .items');
					target.html('');

					var left = false;

					_.each(boatdays, function(boatday) {
						
						left = !left;

						var bdDate = new Date(boatday.get("date"));

						var _tpl = tpl({
							_class: left ? 'left' : 'right',
							id: boatday.id,
							status: boatday.get('status'),
							//date: self.dateParseToDisplayDate(boatday.get('date')),
							date: self.formatDateWithMonthAndDate(bdDate) + ", " + bdDate.getFullYear(),
							time: self.departureTimeToDisplayTime(boatday.get('departureTime')),
							duration: boatday.get('duration'),
							name: boatday.get('name'),
							availableSeats: boatday.get('availableSeats'),
							bookedSeats: boatday.get('bookedSeats'),
							potEarings: boatday.get('price') * (1 - Parse.User.current().get('host').get('rate') ) * boatday.get('availableSeats'),
							boatName: boatday.get('boat').get('name'),
							boatType: boatday.get('boat').get('type'),
							boatYear: boatday.get('boat').get('buildYear'),
							captainName: boatday.get('captain').get('displayName'),
							picture: 'resources/boat-placeholder.png',
							description: boatday.get('description'),
							price: boatday.get('price'),
							activity: self.boatdayActivityToDisplay(boatday.get('category')),
							booking: self.boatdayBookingToDisplay(boatday.get('bookingPolicy')),
							cancellation: self.boatdayCancellationToDisplay(boatday.get('cancellationPolicy')),
							location: boatday.get('locationText'),
							active: true,
							host: boatday.get('host')
						});

						self.boatdays[boatday.id] = boatday;
						target.append(_tpl);

						var q = boatday.get('boat').relation('boatPictures').query()
						q.ascending('order');
						q.first().then(function(fileholder) {
							
							if( fileholder ) {
								self.$el.find('.my-boatdays .my-boatday-'+boatday.id+' .picture').css({ backgroundImage: 'url('+fileholder.get('file').url()+')' });
							}

						});

						self.requests[boatday.id] = {};

						var q = boatday.relation('seatRequests').query();
						q.descending('createdAt');
						q.include('profile');
						q.include('boatday');
						q.find().then(function(requests) {

							if( requests.length == 0 ) {

								self.$el.find('.my-boatdays .my-boatday-'+boatday.id+' .box-requests .info').html('<p class="empty"><em>All requests for this BoatDay will be listed here, including confirmed, pending and denied Guests.</em></p>');
								
								if( boatday.get('host').id == Parse.User.current().get('host').id ) {
									self.$el.find('.my-boatdays .my-boatday-'+boatday.id+' .edit-button').show();
								}

								return ;
							}

							
							var unread = 0;

							_.each(requests, function(request) {
								
								if( request.get('status') == 'pending' ) {
									unread++;
								}

								self.requests[boatday.id][request.id] = request;
								
							});

							if( unread == 0 ) {
								self.$el.find('.my-boatdays .my-boatday-'+boatday.id+' .new-requests').hide();
							} else {
								self.$el.find('.my-boatdays .my-boatday-'+boatday.id+' .new-requests').show().html(unread + ' pending');
							}

							self.renderRequests(boatday.id);

						});
						
						self.fetchChat(boatday);

						setInterval(function() { self.fetchChat(boatday) }, 10000);
						
					});


					self.$el.find('.my-boatdays').fadeIn();

				}
			});

			return this;

		},

		fetchChat: function(boatday) {

			var self = this;

			var q = boatday.relation('chatMessages').query();
			q.equalTo('status', 'approved');
			q.ascending('createdAt');
			q.include('profile');

			if( self.chatLastFetch ) {
				query.greaterThan('createdAt', self.chatLastMessage.createdAt);
			}

			q.find().then(function(messages) {

				if( messages.length == 0 ) {

					self.$el.find('.my-boatdays .my-boatday-'+boatday.id+' .box-messages .info').html('<p class="empty"><em>Use this message board to chat directly with your confirmed Guests, we recommend starting with a welcome message to say hello.</em></p>');
					
					return ;
				}

				self.$el.find('.my-boatdays .my-boatday-'+boatday.id+' .box-messages .inner').html('');
				self.$el.find('.my-boatdays .my-boatday-'+boatday.id+' .box-messages .bottom').show();

				var unread = 0;

				_.each(messages, function(message) {

					if( boatday.get('host').id == Parse.User.current().get('host').id ) {
						if( boatday.get('hostLastRead') < new Date(message.createdAt) ) {
							unread++;
						}
					} else if( boatday.get('captain').id == Parse.User.current().get('profile').id ) {
						if( boatday.get('captainLastRead') < new Date(message.createdAt) ) {
							unread++;
						}
					}

					self.appendMessage(boatday.id, message);
				});

				self.displayMessagesUnread(boatday, unread);

			// if( boatday.get('host').id == Parse.User.current().get('host').id ) {
			// 	boatday.save({ hostLastRead: new Date() });
			// } else if( boatday.get('captain').id == Parse.User.current().get('profile').id ) {
			// 	boatday.save({ captainLastRead: new Date() });
			// }
				self._scrollDown(boatday.id);
			});

		},

		displayMessagesUnread: function(boatday, unread) {
			if( unread == 0 ) {
				this.$el.find('.my-boatdays .my-boatday-'+boatday.id+' .new-messages').hide();
			} else {
				this.$el.find('.my-boatdays .my-boatday-'+boatday.id+' .new-messages').show().html(unread + ' pending').show();
			}
		},

		appendMessage: function(boatdayId, message) {

			var self = this;
			var tpl = _.template(DashboardBoatDayMessageTemplate);

			self.$el.find('.my-boatdays .my-boatday-'+boatdayId+' .box-messages .info .empty').remove();

			var _tpl = tpl({
				profile: message.get('profile'),
				message: message,
				self: self
			});

			self.$el.find('.my-boatdays .my-boatday-'+boatdayId+' .box-messages .info > .inner').append(_tpl);

			self.chatLastMessage = message;

		},

		renderRequests: function(boatdayId) {
			
			var self = this;
			var tpl = _.template(DashboardBoatDayRequestTemplate);

			self.$el.find('.my-boatdays .my-boatday-'+boatdayId+' .box-requests .info').html('');

			_.each(self.requests[boatdayId], function(request) {

				var _tpl = tpl({
					profile: request.get('profile'),
					request: request,
				});

				self.$el.find('.my-boatdays .my-boatday-'+boatdayId+' .box-requests .info').append(_tpl);
			});
		}

	});
	return DashboardView;
});
