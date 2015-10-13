// Filename: router.js
define([
	'models/ReportModel',
	'models/BoatModel',
	'models/BoatDayModel',
	'models/HelpCenterModel',
	'models/NotificationModel',
	'models/ProfileModel',
	'models/HostModel',
	'views/ReportView',
	'views/HomeView',
	'views/ForgotPasswordView',
	'views/ResetPasswordView',
	'views/InvalidLinkView',
	'views/PasswordChangedView',
	'views/DashboardView',
	'views/TermsView',
	'views/SignUpView',
	'views/HostView',
	'views/ProfileView',
	'views/AccountView',
	'views/BoatView', 
	'views/BoatDayView', 
	'views/BoatDaysView', 
	'views/HelpCenterView',
	'views/CertificationsView',
	'views/NotificationsView',
	'views/BoatDayOverview',
	'views/HostBankAccountView',
	'views/NotificationSettingsView'
], function(
	ReportModel, BoatModel, BoatDayModel, HelpCenterModel, NotificationModel, ProfileModel, HostModel, 
	ReportView, HomeView, ForgotPasswordView, ResetPasswordView, InvalidLinkView, PasswordChangedView, 
	DashboardView, TermsView, SignUpView, HostView, ProfileView, AccountView, BoatView, BoatDayView, 
	BoatDaysView, HelpCenterView, CertificationsView, NotificationsView, BoatDayOverview, HostBankAccountView, NotificationSettingsView) {
	
	var AppRouter = Parse.Router.extend({

		routes: {
			'home': 'showHomeView',
			'sign-up': 'showSignUpView',
			'sign-out': 'signOut',
			'forgot-password': 'showForgotPasswordView',
			'reset-password?*queryString': 'showResetPasswordView',
			'invalid-link': 'showInvalidLinkView',
			'password-changed': 'showPasswordChangedView',
			'boat/new': 'showBoatView',
			'boat/:boatid': 'showBoatView',
			'boatday/new': 'showBoatDayView',
			'boatday/:boatdayid': 'showBoatDayView',
			// 'host': 'showHostView',
			'my-account': 'showAccountView',
			'my-profile': 'showProfileView',
			'my-certifications': 'showCertificationsView',
			'my-notifications': 'showNotificationsView',
			'my-bank-account?*queryString': 'showHostBankAccountView',
			'my-boatdays': 'showBoatDaysView',
			'help-center': 'showHelpCenterView',
			'help-center/:category': 'showHelpCenterView',
			'report/:id': 'showReportView',
			'boatday-overview/:boatdayid?*queryString' : 'showBoatDayOverview',
			'notifications-settings': 'showNotificationSettingsView',
			'*actions': 'showDashboardView'
			
		},

		currentView: null,

		signOut: function() {

			Parse.User.logOut();
			this.showHomeView();

		},
		
		showHomeView: function() {

			this.render(new HomeView());

		},

		showForgotPasswordView: function() {

			this.render(new ForgotPasswordView());

		},

		showResetPasswordView: function(queryString) {

			this.render(new ResetPasswordView({ queryString: queryString}));

		},

		showInvalidLinkView: function() {

			this.render(new InvalidLinkView());

		},

		showPasswordChangedView: function() {

			this.render(new PasswordChangedView());

		},

		showSignUpView: function( type ) {

			if( Parse.User.current() ) {

				this.showDashboardView();
				return;

			}
			
			this.render(new SignUpView());

		},

		showDashboardView: function() {

			var self = this;
			var cb = function() {
				
				self.render(new DashboardView());

			};

			this.handleGuestAndSignUp(cb);

		},

		showReportView: function( id ) {
			
			var self = this;

			var cb = function() {
				
				var success = function(profile) {

					self.render(new ReportView({ model: profile }));

				};

				var error = function(error) {

					console.log(error);

				};

				new Parse.Query(ProfileModel).get(id).then(success, error);

			};

			this.handleGuestAndSignUp(cb);

		},
		showBoatView: function( boatid ) {
			
			var self = this;
			var cb = function() {
				
				if( boatid ) {

					var boatQuerySuccess = function(boat) {

						self.render(new BoatView({ model: boat }));

					};

					var boatQueryError = function(error) {

						console.log(error);

					};

					Parse.User.current().get('host').relation('boats').query().get(boatid).then(boatQuerySuccess, boatQueryError);

				} else {

					var boat = new BoatModel({ host: Parse.User.current().get('host'), profile: Parse.User.current().get('profile') });
					self.render(new BoatView({ model: boat, init: true }));

				}

			};

			this.handleGuestAndSignUp(cb);

		},

		showBoatDayView: function( id ) {

			var self = this;
			var cb = function() {
				
				if( id ) {

					var boatDayQuerySuccess = function(boatday) {

						self.render(new BoatDayView({ model: boatday })); 
					};

					var boatDayQueryError = function(error){

						console.log(error);

					};

					new Parse.Query(BoatDayModel).get(id).then(boatDayQuerySuccess, boatDayQueryError);

				} else {

					var boatday = new BoatDayModel({ host: Parse.User.current().get('host') });
					self.render(new BoatDayView({ model: boatday }));
					
				}
			};

			this.handleGuestAndSignUp(cb);
		},

		showCertificationsView: function() {

			var self = this;

			var cb = function( ) {

				self.render(new CertificationsView({ model: Parse.User.current().get('host') }));	

			};

			this.handleGuestAndSignUp(cb);

		},

		showNotificationsView: function() {

			var self = this;

			var cb = function( ) {
				
				self.render(new NotificationsView());

			};

			this.handleGuestAndSignUp(cb);

		},

		showBoatDaysView: function() {

			var self = this;

			var cb = function( ) {
				
				self.render(new BoatDaysView());

			};

			this.handleGuestAndSignUp(cb);

		},

		showAccountView: function() {

			var self = this;

			var cb = function( ) {

				self.render(new AccountView({ model: Parse.User.current() }));

			};

			this.handleGuestAndSignUp(cb);

		},

		showProfileView: function() {

			var self = this;

			var cb = function( ) {

				self.render(new ProfileView({ model: Parse.User.current().get('profile') }));

			};

			this.handleGuestAndSignUp(cb);

		},

		showHelpCenterView: function(category) {
			
			var self = this;
			var cb = function() {

				self.render(new HelpCenterView({ model: new HelpCenterModel({ category: category }) }));

			};

			this.handleGuestAndSignUp(cb);
		}, 

		showHostBankAccountView: function(queryString) {
			
			var self = this;
			var cb = function() {

				self.render(new HostBankAccountView({queryString: queryString}));

			};

			this.handleGuestAndSignUp(cb);
		}, 

		handleGuestAndSignUp: function( cb ) {

			var self = this;
			
			if( !Parse.User.current() ) {
				
				this.showHomeView();
				return ;
					
			}


			if( typeof Parse.User.current().get("status") == typeof undefined ) {

				Parse.User.current().save({
					tos: false,
					status: 'creation',
					host: new HostModel({ type: "personal", rate: Parse.Config.current().get('PRICE_HOST_PRIVATE_PART') }),
					type: 'host'
				}).then(function() {
					self.handleGuestAndSignUp(cb);
				});

				return ;
			}

			if( Parse.User.current().get("status") == "creation" ) {

				this.handleSignUp();
				return ;
			}

			cb();

		},

		handleSignUp: function() {
			
			var self = this;
			
			var callbackError = function(error) {
				console.log(error);
			};

			if( !Parse.User.current().get("tos") ) {

				this.render(new TermsView());
				return;

			}
			
			var cb = function() {

				if( Parse.User.current().get("host").get('status') == 'creation' ) {
				
					self.render(new HostView({ model: Parse.User.current().get("host") }));	

				} else {

					self.render(new ProfileView({ model: Parse.User.current().get("profile") }));

				}

			};

			$(document).trigger('fetchUserInfo', cb);


		},


		showBoatDayOverview: function( boatdayid, queryString ) {
			var self = this;
			var cb = function() {
				
				if( boatdayid ) {

					var boatDayOverviewSuccess = function(boatday){
						self.render(new BoatDayOverview({model: boatday, queryString: queryString}));
					};

					var boatDayOverviewError = function(error){
						console.log(error);
						 

					};

					new Parse.Query(BoatDayModel).get(boatdayid).then(boatDayOverviewSuccess, boatDayOverviewError);
				
				} else {
					console.log("Error in getting boatday id");
				}

			};

			this.handleGuestAndSignUp(cb);
		},


		showNotificationSettingsView: function(){
			var self = this;

			var cb = function() {

				self.render(new NotificationSettingsView({ model: Parse.User.current().get('profile') }));

			};

			this.handleGuestAndSignUp(cb);
		},

		render: function(view) {

			if(this.currentView != null) {

				this.currentView.teardown();

			}

			$("#app").html( view.render().el );

			view.afterRender();
			
			this.currentView = view;

		}

	});
	return AppRouter;
});
