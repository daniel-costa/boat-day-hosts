// Filename: router.js
define([
	'jquery',
	'underscore',
	'parse',
	'models/BoatModel',
	'models/DriverModel',
	'models/BoatdayModel',
	'views/HomeView',
	'views/DashboardView',
	'views/TermsView',
	'views/SignUpView',
	'views/HostRegistrationView',
	'views/DriverRegistrationView',
	'views/ProfileView',
	'views/BoatView', 
	'views/BoatdayView'
], function(
	$, _, Parse, 
	BoatModel, DriverModel, BoatdayModel,
	HomeView, DashboardView, TermsView, SignUpView, HostRegistrationView, DriverRegistrationView, ProfileView, BoatView, BoatdayView) {
	
	var AppRouter = Parse.Router.extend({

		routes: {
			'home': 'showHomeView',
			'sign-up/:type': 'showSignUpView',
			'sign-out': 'signOut',
			'boat/add': 'showBoatView',
			'boat/:boatid': 'showBoatView',
			'boatday/add': 'showBoatdayView',
			'boatday/:boatdayid': 'showBoatdayView',
			'driver/edit': 'showDriverView',
			'host': 'showHostView',
			'host/edit': 'showHostView',
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

		showBoatdayView: function( boatdayid ) {

			var self = this;
			var cb = function() {
				
				if( boatdayid ) {

					var boatdayQuerySuccess = function(boatday) {

						self.render(new BoatdayView({ model: boatday })); 
					};

					var boatdayQueryError = function(error){

						console.log(error);

					};

					Parse.User.current().get('host').relation('boatdays').query().get(boatdayid).then(boatdayQuerySuccess, boatdayQueryError);

				} else {

					var boatday = new BoatdayModel({ host: Parse.User.current().get('host') });
					self.render(new BoatdayView({ model: boatday }));
					
				}
			};

			this.handleGuestAndSignUp(cb);
		},

		showDriverView: function(driverid) {

			var self = this;

			var cb = function() {

				self.render(new DriverRegistrationView({ model: Parse.User.current().get('driver') }));	

			};

			this.handleGuestAndSignUp(cb);

		},

		showHostView: function() {

			var self = this;

			var cb = function() {
				
				self.render(new HostRegistrationView({ model: Parse.User.current().get('host') }));	

			};

			this.handleGuestAndSignUp(cb);

		},

		handleGuestAndSignUp: function( cb ) {

			if( !Parse.User.current() ) {
				
				this.showHomeView();
				return false;
					
			}

			if( Parse.User.current().get("status") == "creation" ) {

				this.handleSignUp();
				return false;
			}


			if( Parse.User.current().get('host') && !Parse.User.current().get('host').createdAt ) {

				console.log("**Fetch host**");

				Parse.User.current().get('host').fetch().done(cb);

			} else if( Parse.User.current().get('driver') && !Parse.User.current().get('driver').createdAt ) {

				console.log("**Fetch driver**");

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

			view.afterRender();
			
			this.currentView = view;

		}

	});
	return AppRouter;
});
