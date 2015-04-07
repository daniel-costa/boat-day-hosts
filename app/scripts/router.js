// Filename: router.js
define([
	'jquery',
	'underscore',
	'parse',
	'views/HomeView',
	'views/DashboardView',
	'views/TermsView',
	'views/SignUpView',
	'views/HostRegistrationView'
], function($, _, Parse, HomeView, DashboardView, TermsView, SignUpView, HostRegistrationView) {
	
	var AppRouter = Parse.Router.extend({

		routes: {
			// Define some URL routes
			'home': 'showHome',
			'dashboard': 'showDashboard',
			'terms': 'showTerms',
			'sign-up': 'showSignUp',
			'sign-up-personal': 'showSignUpPersonal',
			'sign-up-business': 'showSignUpBusiness',
			'host-registration': 'showHostRegistration',
			
			// Default
			'*actions': 'defaultAction'
		},

		currentView: null,

		signOut: function() {
			Parse.User.logOut();
			this.showHome();
		},
		
		showHome: function() {
			this.render(new HomeView());
		},

		showSignUp: function() {
			this.render(new SignUpView());
		},

		showSignUpPersonal: function() {
			this.render(new SignUpPersonalView());
		},

		showSignUpBusiness: function() {
			this.render(new SignUpBusinessView());
		},

		showDashboard: function() {
			this.render(new DashboardView());
		},

		showTerms: function() {
			this.render(new TermsView());
		},

		showHostRegistration: function() {

			var self = this;

			console.log(Parse.User.current().id);
			
			Parse.User.current().get("host").fetch().then(function(host){
				self.render(new HostRegistrationView({
					model: host
				}));	
			});
			
		},

		defaultAction: function() {
			if(Parse.User.current()) {
				this.showDashboard();
				// this.showProfileView();
			} else {
				this.showHome();
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
