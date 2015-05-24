// Filename: router.js
define([
	'models/BoatModel',
	'models/BoatDayModel',
	'models/HelpCenterModel',
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
	'views/BoatView', 
	'views/BoatDayView', 
	'views/HelpCenterView'
], function(
	BoatModel, BoatDayModel, HelpCenterModel,
	HomeView, ForgotPasswordView, ResetPasswordView, InvalidLinkView, PasswordChangedView, DashboardView, TermsView, SignUpView, HostView, ProfileView, BoatView, BoatDayView, HelpCenterView) {
	
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
			'host': 'showHostView',
			'profile': 'showProfileView',
			'help-center': 'showHelpCenterView',
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

					var boat = new BoatModel({ host: Parse.User.current().get('host') });
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

					Parse.User.current().get('host').relation('boatdays').query().get(id).then(boatDayQuerySuccess, boatDayQueryError);

				} else {

					var boatday = new BoatDayModel({ host: Parse.User.current().get('host') });
					self.render(new BoatDayView({ model: boatday }));
					
				}
			};

			this.handleGuestAndSignUp(cb);
		},

		showHostView: function() {

			var self = this;

			var cb = function( ) {

				self.render(new HostView({ model: Parse.User.current().get('host') }));	

			};

			this.handleGuestAndSignUp(cb);

		},

		showProfileView: function() {

			var self = this;

			var cb = function( ) {

				var profileSuccess = function(profile) {
					
					self.render(new ProfileView({ model: profile }));

				};

				Parse.User.current().get("profile").fetch().then(profileSuccess);

			};

			this.handleGuestAndSignUp(cb);

		},

		showHelpCenterView: function() {
			
			var self = this;
			var cb = function() {

				self.render(new HelpCenterView({ model: new HelpCenterModel() }));

			};

			this.handleGuestAndSignUp(cb);
		}, 

		handleGuestAndSignUp: function( cb ) {

			if( !Parse.User.current() ) {
				
				this.showHomeView();
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
			
			var profileSuccess = function(profile) {

				if( Parse.User.current().get("host").get('status') == 'creation' ) {
				
					self.render(new HostView({ model: Parse.User.current().get("host") }));	

				} else {

					self.render(new ProfileView({ model: profile }));

				}

			};

			var hostSuccess = function(host) {
				
				Parse.User.current().get("profile").fetch().then(profileSuccess, callbackError);

			};

			Parse.User.current().get("host").fetch().then(hostSuccess, callbackError);


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
