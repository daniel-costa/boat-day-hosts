// Filename: router.js
define([
	'jquery',
	'underscore',
	'parse',
	'models/BoatModel',
	'models/DriverModel',
	'models/BoatDayModel',
	'views/HomeView',
	'views/DashboardView',
	'views/TermsView',
	'views/SignUpView',
	'views/HostView',
	'views/DriverView',
	'views/ProfileView',
	'views/BoatView', 
	'views/BoatDayView'
], function(
	$, _, Parse, 
	BoatModel, DriverModel, BoatDayModel,
	HomeView, DashboardView, TermsView, SignUpView, HostView, DriverView, ProfileView, BoatView, BoatDayView) {
	
	var AppRouter = Parse.Router.extend({

		routes: {
			'home': 'showHomeView',
			'sign-up/:type': 'showSignUpView',
			'sign-out': 'signOut',
			'boat/new': 'showBoatView',
			'boat/:boatid': 'showBoatView',
			'boatday/new': 'showBoatDayView',
			'boatday/:boatdayid': 'showBoatDayView',
			'driver': 'showDriverView',
			'host': 'showHostView',
			'profile': 'showProfileView',
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
					self.render(new BoatView({ model: boat }));

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

		showDriverView: function(driverid) {

			var self = this;

			var cb = function() {

				self.render(new DriverView({ model: Parse.User.current().get('driver') }));	

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

		handleGuestAndSignUp: function( cb ) {

			if( !Parse.User.current() ) {
				
				this.showHomeView();
				return ;
					
			}

			if( Parse.User.current().get("status") == "creation" ) {

				this.handleSignUp();
				return ;
			}


			if( Parse.User.current().get('host') && !Parse.User.current().get('host').createdAt ) {

				Parse.User.current().get('host').fetch().done(cb);

			} else if( Parse.User.current().get('driver') && !Parse.User.current().get('driver').createdAt ) {

				Parse.User.current().get('driver').fetch().done(cb);

			} else {
				
				cb();

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
					
					self.render(new DriverView({ model: driver }));	

				};

				Parse.User.current().get("driver").fetch().then(driverSuccess, callbackError);
				return;

			} else {

				var hostSuccess = function(host) {

					self.render(new HostView({ model: host }));	

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

			view.afterRender();
			
			this.currentView = view;

		}

	});
	return AppRouter;
});
