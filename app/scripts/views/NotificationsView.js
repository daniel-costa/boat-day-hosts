define([
'views/BaseView',
'models/NotificationModel',
'text!templates/NotificationTemplate.html',
'text!templates/NotificationsTemplate.html'
], function(BaseView, NotificationModel, NotificationTemplate, NotificationsTemplate){
	var NotificationsView = BaseView.extend({

		className: "view-my-notifications",

		template: _.template(NotificationsTemplate),

		debug: true,

		theme: "dashboard",

		events: {
			"click .approve-request": "approveRequest",
			"click .deny-request": "denyRequest",
			"click .profile-picture": "detectClickOnProfile",
			"mouseover .row-remove": "showRemove",
			"mouseout .row-remove": "hideRemove",
			"click .remove-notification": "removeNotification",
		},

		notifications: {},

		showRemove: function(event) {
			$(event.currentTarget).find('.action').hide();
			$(event.currentTarget).find('.remove').show();
		},

		hideRemove: function(event) {
			$(event.currentTarget).find('.remove').hide();
			$(event.currentTarget).find('.action').show();
		},

		removeNotification: function(event) {
			this.notifications[$(event.currentTarget).closest('.row-remove').attr('data-id')].destroy().then(function() {
				$(event.currentTarget).closest('.row-remove').remove();
			});
		},

		approveRequest: function(event) {
			
			event.preventDefault();

			var self = this;			
			var notification = self.notifications[$(event.currentTarget).attr("data-id")];

			self.buttonLoader('...', $(event.currentTarget));

			notification.get('request').save({ status: 'approved' }).then(function() {
				notification.get('boatday').increment('bookedSeats', notification.get('request').get('seats'));
				notification.get('boatday').save().then(function() {
					new NotificationModel().save({
						notification: notification,
						action: 'request-approved',
						fromTeam: false,
						message: null,
						to: notification.get('request').get('profile'),
						from:  Parse.User.current().get('profile'),
						boatday: notification.get('boatday'),
						sendEmail: false,
						request: notification.get('request')
					}).then(function() {
						self.buttonLoader();
						self.render();
					});
				});
			});

		},	

		denyRequest: function(event) {
			
			event.preventDefault();

			var self = this;
			var notification = self.notifications[$(event.currentTarget).attr("data-id")];

			self.buttonLoader('...', $(event.currentTarget));

			notification.get('request').save({ status: 'denied' }).then(function() {
				
				new NotificationModel().save({
					action: 'request-denied',
					fromTeam: false,
					message: null,
					to: notification.get('request').get('profile'),
					from:  Parse.User.current().get('profile'),
					boatday: notification.get('boatday'),
					sendEmail: false,
					request: notification.get('request')
				}).then(function() {
					self.buttonLoader();
					self.render();
				});

			});

		},	



		render: function() {

			BaseView.prototype.render.call(this);
			var self = this;

			//self.$el.find('.navbar-brand').text('My messages');
			self.$el.find('.left-navigation .menu-my-notifications').addClass('active');
			//self.$el.find('.left-navigation a.link').hide();
			//self.$el.find('.left-navigation a.menu-my-notifications').show().css('display', "block");

			self.$el.find('.add-boat, .add-boatday, .my-boats, .my-requests').hide();

			var gotNotification = function(notification) {

				self.notifications[notification.id] = notification;

				var boatdayIsPast = false;
				var bd = notification.get("boatday") ? notification.get("boatday") : null;

				if( bd != null ){
					var _bd = new Date(bd.get('date'));
					var _bt = bd.get('arrivalTime');
					var _td = new Date();
					var _tdn = new Date(_td.getFullYear(), _td.getMonth(), _td.getDate(), 0, 0, 0, 0);
					var _tdx = new Date(_td.getFullYear(), _td.getMonth(), _td.getDate(), 23, 59, 59, 999);
					var _ct = _td.getHours() + ( _td.getMinutes() >= 30 ? 0.5 : 0 );

					if( _bd < _tdn || ( _bd < _tdx && _bt <= _ct ) ) {
						boatdayIsPast = true;
					} 
				}

				console.log(notification);
				var data = {
					boatdayIsPast: boatdayIsPast,
					dateStr: self.formatDateWithMonthAndDate(notification.createdAt),
					timeStr: self.formatAmPm(notification.createdAt),
					self: self,
					notification: notification,
					id: notification.id,
					bd: notification.get("fromTeam"),
					action: notification.get("action"),
					boatId: notification.get("boat") ? notification.get("boat").id : null,
					boatName: notification.get("boat") ? notification.get("boat").get('name') : null,
					boatdayId: notification.get("boatday") ? notification.get("boatday").id : null,
					boatdayName: notification.get("boatday") ? notification.get("boatday").get('name') : null,
					message: notification.get("message") ? notification.get("message").replace(/\n/g, "<br>") : '',
					sender: notification.get("from"),
					read:  notification.get("read"),
					boatdayStatus: notification.get('boatday') ? notification.get('boatday').get('status') : null,
					// requestId: request.id,
					// amount: request.get('contribution'),
					// seats: request.get('seats')
					requestId: notification.id,
					amount: notification.get('request') ? notification.get('request').get('contribution') : null,
					seats: notification.get('request') ? notification.get('request').get('seats') : null,
					requestStatus: notification.get('request') ? notification.get('request').get('status') : null,
					request: notification.get('request'),
					clickable: notification.get("boatday") ? "clickable" : ""
				};


				

				self.$el.find('.notification-list').append(_.template(NotificationTemplate)(data));


				if(!notification.get("read")) {
					notification.save({ read: new Date()});
				}
			}

			var query = new Parse.Query(NotificationModel);
			query.descending('createdAt');
			query.equalTo("to", Parse.User.current().get("profile"));
			query.include('from');
			query.include('boat');
			query.include('boatday');
			query.include('request');
			query.include('request.boatday');

			query.find().then(function(matches){

				if(matches.length > 0) {
					self.$el.find('.notification-list').show();
				}

				_.each(matches, gotNotification);
			});

			return this;

		}

	});
	return NotificationsView;
});