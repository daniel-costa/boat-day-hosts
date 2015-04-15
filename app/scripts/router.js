// Filename: router.js
define([
	'jquery',
	'underscore',
	'parse',
	'views/HomeView',
	'views/DashboardView',
	'views/TermsView',
	'views/SignUpView',
	'views/HostRegistrationView',
	'views/DriverRegistrationView'
], function($, _, Parse, HomeView, DashboardView, TermsView, SignUpView, HostRegistrationView, DriverRegistrationView) {
	
	var AppRouter = Parse.Router.extend({

		routes: {
			// Define some URL routes
			'home': 'showHomeView',
			// 'sign-up': 'showSignUpView',
			'sign-up-host': 'showSignUpHost',
			'sign-up-driver': 'showSignUpDriver',
			'terms': 'showTermsView',
			'host-registration': 'showHostRegistration',
			'driver-registration': 'showDriverRegistration',
		 	'dashboard': 'showDashboardView',
			
			'sign-out': 'signOut',

			'*actions': 'showHomeView'
		},

		currentView: null,

		signOut: function() {

			console.log("signing out")
			Parse.User.logOut();
			this.showHomeView();

		},
		
		showHomeView: function() {

			this.render(new HomeView());

		},

		showSignUpHost: function() {
			
			this.showSignUpView('host');

		},

		showSignUpDriver: function() {
			
			this.showSignUpView('driver');

		},

		showSignUpView: function(type) {

			if( !Parse.User.current() ) {
				
				this.render(new SignUpView({ type: type }));
					
			} else {

				this.showDashboardView();

			}

		},

		showTermsView: function() {

			if( Parse.User.current() && this.isUserCreationSteps() && !this.userAcceptedTos() ) {

				this.render(new TermsView());

			} else {

				this.showDashboardView();

			}

		},

		showHostRegistration: function() {

			if( Parse.User.current() && this.isUserCreationSteps() && this.userAcceptedTos() ) {

				var self = this;

				var hostFetchSuccess = function(host) {
					self.render(new HostRegistrationView({ model: host }));	
				};

				var hostFetchError = function(error) {
					console.log(error);
				};

				Parse.User.current().get("host").fetch().then(hostFetchSuccess, hostFetchError);

			} else {

				this.showDashboardView();

			}
			
		},

		showDriverRegistration: function() {

			if( Parse.User.current() && this.isUserCreationSteps() && this.userAcceptedTos() ) {

				var self = this;

				var hostFetchSuccess = function(driver) {
					self.render(new DriverRegistrationView({ model: driver }));	
				};

				var hostFetchError = function(error) {
					console.log(error);
				};

				Parse.User.current().get("driver").fetch().then(hostFetchSuccess, hostFetchError);

			} else {

				this.showDashboardView();

			}
			
		},

		showDashboardView: function() {

			if(this.handleSignOut()) {
				
				this.render(new DashboardView());
			
			}

		},

		isUserCreationSteps: function() {

			return Parse.User.current().get("status") == "creation";

		},

		userAcceptedTos: function() {

			return Parse.User.current().get("tos");

		},

		handleSignOut: function() {
			
			if( Parse.User.current() ) {
				
				if( this.isUserCreationSteps() ) {

					if( this.userAcceptedTos() ) {
						
						this.showHostRegistration();

					} else {
						
						this.showTermsView();

					}

				} else {

					return true;

				}

			} else {

				this.showHomeView();

			}

		},

		render: function(view) {

			if(this.currentView != null) {

				this.currentView.teardown();

			}

			$("#app").html( view.render().el );
			
			this.currentView = view;
		}
	});
	return AppRouter;
});
