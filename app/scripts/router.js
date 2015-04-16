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
	'views/DriverRegistrationView',
	'views/ProfileView'
], function($, _, Parse, HomeView, DashboardView, TermsView, SignUpView, HostRegistrationView, DriverRegistrationView, ProfileView) {
	
	var AppRouter = Parse.Router.extend({

		routes: {
			'home': 'showHomeView',
			'sign-up/:type': 'showSignUpView',
			'sign-out': 'signOut',
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

		showSignUpView: function( type ) {

			// ToDo if logged, redirect the user
			if( Parse.User.current() ) {

				this.showDashboardView();
				return;

			}
			
			this.render(new SignUpView({ type: type }));

		},

		showDashboardView: function() {

			if( this.handleGuestAndSignUp() ) {

				this.render(new DashboardView());

			}

		},

		handleGuestAndSignUp: function(  ) {

			if( !Parse.User.current() ) {
				
				this.showHomeView();
				return false;
					
			}

			if( Parse.User.current().get("status") == "creation" ) {

				this.handleSignUp();
				return false;
			}

			return true;

		},

		handleSignUp: function() {
			
			var self = this;
			
			var callbackError = function(error) {

				console.log(error);

			};

			console.log(Parse.User.current().get("tos"));
			if( !Parse.User.current().get("tos") ) {

				this.render(new TermsView());
				return;

			}

			if( Parse.User.current().get('profile') ) {

				var profileSuccess = function(profile) {
					
					self.render(new ProfileView({ model: profile }));

				};

				Parse.User.current().get("profile").fetch().then(profileSuccess, callbackError);
				return;

			}

			if( Parse.User.current().get('driver') ) {

				var driverSuccess = function(driver) {
					
					self.render(new DriverRegistrationView({ model: driver }));	

				};

				Parse.User.current().get("driver").fetch().then(driverSuccess, callbackError);
				return;

			} else {

				var hostSuccess = function(host) {

					self.render(new HostRegistrationView({ model: host }));	

				};

				Parse.User.current().get("host").fetch().then(hostSuccess, callbackError);
				return;

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
