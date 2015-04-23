define([
'jquery', 
'underscore', 
'parse',
'views/BaseView',
'text!templates/BoatdayTemplate.html'
], function($, _, Parse, BaseView, BoatdayTemplate){
	var BoatdayView = BaseView.extend({

		className:"view-event",

		template: _.template(BoatdayTemplate),

		events: {
			
			"submit form" : "save"
		}, 

		initialize: function() {

		},

		render: function() {

			BaseView.prototype.render.call(this);
			return this;

		},

		save: function() {

			event.preventDefault();
			var self = this;
			var baseStatus = this.model.get('status');

			var data = {

				status: 'complete',
				name: this._in('name').val()

			};

			var saveSuccess = function( boatday ) {
				
				if( baseStatus == 'creation' ) {

					var hostSaveSuccess = function() {
						Parse.history.navigate('boatday/'+boatday.id, true);
					};

					var hostSaveError = function(error) {
						console.log(error);
					}

					var host = Parse.User.current().get("host");
					host.relation('boatdays').add(boatday);
					host.save().then(hostSaveSuccess, hostSaveError);

				} else {
					
					Parse.history.navigate('dashboard', true);

				}

			};

			var saveError = function(error) {
				
				self._error(error);

			};
			
			this.model.save(data).then(saveSuccess, saveError);


		}
	});
	return BoatdayView;

});