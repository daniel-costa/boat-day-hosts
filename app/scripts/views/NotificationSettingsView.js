define([
'views/BaseView',
'text!templates/NotificationSettingsTemplate.html'
], function(BaseView, NotificationSettingsTemplate){
	
	var NotificationSetttingsView = BaseView.extend({

		className: "view-host-bank-account",

		template: _.template(NotificationSettingsTemplate),

		debug: true,

		theme: "account",
		
		events: {
			"submit form" : "save"
		},


		render:function(){

			BaseView.prototype.render.call(this);
			
			return this;
		},


		save: function(event) {

			event.preventDefault();

			var self = this;
			var err = false;
			self.buttonLoader('Saving');

			var notificationType =  this.$el.find('[name="notificationType"]:checked').val();

			if(!notificationType){
				err = true;
				this.$el.find('.display-messages').html("<font color='red'>Please select one.</font>");
				self.buttonLoader();
				return; 
			}

			var data = {
				settings: {
					notificationType: notificationType
				}
			};

			var updateSuccess = function(){
				Parse.history.navigate('my-account', true);
			};

			var updateError = function(error){
				self.handleSaveErrors(error);
				console.log(error);
			};

			this.model.save(data).then(updateSuccess, updateError);
		}

	});
	return NotificationSetttingsView;
});