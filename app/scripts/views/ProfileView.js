define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'models/ProfileModel',
'text!templates/ProfileTemplate.html'
], function($, _, Parse, BaseView, ProfileModel, ProfileTemplate){
	var ProfileView = BaseView.extend({

		className: "view-profile",

		template: _.template(ProfileTemplate),

		events: {
			"submit form" : "saveProfile"
		},

		initialize: function(){

		},

		render: function() {

			BaseView.prototype.render.call(this);

			return this;
		},

		saveProfile: function() {

			event.preventDefault();

			var self = this;

			var data = {
				displayName: this._in('displayName').val(),
				about: this._in('about').val()
			};

			var userStatusUpdateSuccess = function() {

				Parse.history.navigate('dashboard', true);

			};

			var profileSuccess = function() {
				
				Parse.User.current().save({ status: 'complete' }).then(userStatusUpdateSuccess, saveError);

			};

			var saveError = function(error) {
				
				self._error(error);

			};

			this.model.save(data).then(profileSuccess, saveError);
		}

	});
	return ProfileView;
});