define([
'views/BaseView',
'text!templates/HostBankAccountTemplate.html'
], function(BaseView, HostBankAccountTemplate){
	var HostView = BaseView.extend({

		className: "view-host-bank-account",

		template: _.template(HostBankAccountTemplate),

		debug: true,

		theme: "account",

		redirect: "",
		
		events: {
			"submit form" : "save"
		},

		initialize: function(data) {
			var self = this;

			var queryArray = self.splitURLParams( data.queryString);

			if( queryArray['redirect'] != undefined){
				self.redirect = queryArray['redirect'];
			}
		},

		debugAutofillFields: function() {
			
			if( Parse.User.current().get('host').get('status') == 'creation' ) {
				this._in('accountHolder').val('Daniel Costa');
				this._in('accountNumber').val('1039531801');
				this._in('accountRouting').val('324377516');
			}

		},

		isRoutingNumberValid: function(n) {

			n = n && n.match(/\d/g) ? n.match(/\d/g).join('') : 0;
			
			var c = 0, isValid = false;

			if (n && n.length == 9){//don't waste energy totalling if its not 9 digits
			
				for (var i = 0; i < n.length; i += 3) {
					c += parseInt(n.charAt(i), 10) * 3 +  parseInt(n.charAt(i + 1), 10) * 7 +  parseInt(n.charAt(i + 2), 10);
				}
			
				isValid = c != 0 && c % 10 == 0;
			
			}

			return isValid;
		},

		save: function(event) {

			event.preventDefault();

			var self = this;
			var err = false

			self.buttonLoader('Saving');
			self.cleanForm();

			var holder = this._in('accountHolder').val();
			var number = this._in('accountNumber').val().trim().replace(/\s+/g, '');
			var routing = this._in('accountRouting').val().trim().replace(/\s+/g, '');

			if( holder == '' ) {
				this.fieldError('accountHolder', 'Oops, you missed one!');
				err = true;
			}

			if( number == '' ) {
				this.fieldError('accountNumber', 'Oops, you missed one!');
				err = true;
			}

			if( !this.isRoutingNumberValid(routing) ) {
				this.fieldError('accountRouting', 'Oops, you missed one! Please enter a valid 9 digit routing number.');
				err = true;
			}

			if( err ) {
				self.buttonLoader();
				return;
			}

			
			Parse.Cloud.run('updateHostBankAccount', {
				accountHolder: holder,
				accountNumber: number,
				accountRouting: routing,
				host: Parse.User.current().get('host').id
			}).then(function(){
				Parse.User.current().get('host').fetch().then(function() {
					self.buttonLoader();

					if(self.redirect != ""){
						Parse.history.navigate(self.redirect, true);
					}
					else{
						Parse.history.navigate("my-account", true);
					}

					
				});
			}, function(error){
				self.buttonLoader();
				self._error(error.message);
			});

		}

	});
	return HostView;
});