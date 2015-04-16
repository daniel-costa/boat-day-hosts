// Filename: router.js
define([
	'jquery',
	'underscore',
	'parse',
	'models/BoatModel',
	'views/HomeView',
	'views/DashboardView',
	'views/TermsView',
	'views/SignUpView',
	'views/HostRegistrationView',
	'views/DriverRegistrationView',
	'views/ProfileView',
	'views/BoatView'
], function(
	$, _, Parse, 
	BoatModel,
	HomeView, DashboardView, TermsView, SignUpView, HostRegistrationView, DriverRegistrationView, ProfileView, BoatView) {
	
	var AppRouter = Parse.Router.extend({

		routes: {
			'home': 'showHomeView',
			'sign-up/:type': 'showSignUpView',
			'sign-out': 'signOut',
			'boat/add': 'showBoatView',
			'boat/:boatid': 'showBoatView',
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

		showBoatView: function( boatid ) {
			
			if( this.handleGuestAndSignUp() ) {

				console.log("boatid="+boatid);

				if( boatid ) {

					// fetch boat

				} else {

					var boat = new BoatModel({ host: Parse.User.current().get('host') });

				}
				
				this.render(new BoatView({ model: boat }));

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

			var allGood = function() {
				
				return true;

			};

			var handleError = function(error) {

				console.log(error);

			};

			var fetchHostOrDriver = function() {

				// Fetch all informations about user
				if( Parse.User.current().get('host') ) {

					if( !Parse.User.current().get('host').createdAt ) {

						console.log("**Fetch host**");

						return Parse.User.current().get('host').fetch().then(allGood, handleError);

					} else {
						
						return true;

					}
					

				} else {

					if( !Parse.User.current().get('driver').createdAt ) {

						console.log("**Fetch driver**");

						Parse.User.current().get('driver').fetch().then(allGood, handleError);

					} else {
						
						return true;

					}

				}

			};

			if( !Parse.User.current().get('profile').createdAt ) {
				
				console.log("**Fetch profile**");
				return Parse.User.current().get('profile').fetch().then(fetchHostOrDriver, handleError);

			} else {
				
				return fetchHostOrDriver();

			}

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
