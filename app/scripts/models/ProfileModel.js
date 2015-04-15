define([
'parse'
], function(Parse){
	var ProfileModel = Parse.Object.extend("Driver", {

		defaults: {

			displayName: null, 
			profilePicture: null, 
			about: null

		},

		isPhoneValid: function(phone) {
			
			var phoneNumberPattern = /^\(?([0-9]{3})\)?([ .-]?)([0-9]{3})([ .-]?)([0-9]{4})$/;
   			return phoneNumberPattern.test(phone);

		},

		isBirthdateValid: function(personalBirthdate){

			//validates (MM/DD/YYYY), with a year between 1900 and 2099.

			var birthDatePattern = /^(0[1-9]|1[0-2])\/(0[1-9]|1\d|2\d|3[01])\/(19|20)\d{2}$/;
			return birthDatePattern.test(personalBirthdate);

		},

		isEmailValid: function(email) {
			
			return true;

		},

		validate: function(attributes){

			

		}
 
	});
	return ProfileModel;
});