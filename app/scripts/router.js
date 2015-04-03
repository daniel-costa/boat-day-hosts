// Filename: router.js
define([
	'jquery',
	'underscore',
	'parse',
	'views/HomeView',
	'views/DashboardView',
	'views/TermsView',
	'views/SignUpAccountView',
	'views/SignUpPersonalView',
	'views/SignUpBusinessView',
], function($, _, Parse, HomeView, DashboardView, TermsView, SignUpAccountView, SignUpPersonalView, SignUpBusinessView) {
	
	var AppRouter = Parse.Router.extend({

		routes: {
			// Define some URL routes
			'home': 'showHome',
			'dashboard': 'showDashboard',
			'terms': 'showTerms',
			'sign-up': 'showSignUpAccount',
			'sign-up-personal': 'showSignUpPersonal',
			'sign-up-business': 'showSignUpBusiness',
			
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

		showSignUpAccount: function() {
			this.render(new SignUpAccountView());
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
