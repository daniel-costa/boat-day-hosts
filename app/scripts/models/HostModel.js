define([
'parse'
], function(Parse){
	var HostModel = Parse.Object.extend("Host", {

		defaults: {

			type: null,
			phone: null,
			paymentMethod: null,
			accountHolder: null,
			accountNumber: null,
			accountRouting: null,
			paypalEmail: null,
			venmoEmail: null,
			venmoPhone: null,

			street: null,
			apartmentNumber: null, 
			city: null,
			zipCode: null,
			state: null,
			country: "USA",

			businessName: null,
			businessEin: null,
			businessContact: null,

			personalFirstname: null, 
			personalLastname: null, 
			personalBirthdate: null,
			personalSSN: null

		},

		isPhoneValid: function(phone) {
			
			var phoneNumberPattern = /^\(?([0-9]{3})\)?([ .-]?)([0-9]{3})([ .-]?)([0-9]{4})$/;
   			return phoneNumberPattern.test(phone);

		},

		isEmailValid: function(email) {

			var emailPattern = /^([\w-]+(?:\.[\w-]+)*)@((?:[\w-]+\.)*\w[\w-]{0,66})\.([a-z]{2,6}(?:\.[a-z]{2})?)$/i;
    		return emailPattern.test(email);

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

		isBusinessEIN: function(ein) {

			var einPattern = /^[0-9]\d?-\d{7}$/;
			return einPattern.test(ein);
		},

		validate: function(attributes){

			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			var isBusiness = attributes.type == "business";
			var isDeposit = attributes.paymentMethod == "deposit";
			var isVenmo = attributes.paymentMethod == "venmo";
			var isPaypal = attributes.paymentMethod == "paypal";



			// Global fields

			if( !attributes.phone ) {
				_return.fields.phone = 'Oops, you missed one.';
			}
			
			if( !attributes.street ) {
				_return.fields.street = 'Oops, you missed one.';
			}

			if( !attributes.city ) {
				_return.fields.city = 'Oops, you missed one.';
			}

			if( !/^\d{5}$/.test(attributes.zipCode) ) {
				_return.fields.zipCode = 'Oops, you missed one or the format is not a 5 digits zipCode';
			}

			if( !attributes.street ) {
				_return.fields.street = 'Oops, you missed one.';
			}

			// Personal fields
			if( !this.isPhoneValid(attributes.phone) ) {
				_return.fields.phone = 'A valid 10 digit phone number is required';
			}

			if( !isBusiness && !attributes.personalFirstname ) {
				_return.fields.personalFirstname = 'Oops, you missed one.';
			}
			 
			if( !isBusiness && !attributes.personalLastname ) {
				_return.fields.personalLastname = 'Oops, you missed one.';
			}

			if( !isBusiness && !/^\d{4}$/.test(attributes.personalSSN) ) {
				_return.fields.personalSSN = 'Soc. Sec. # (last 4 digits) is required';
			}

			// Business fields

			if( isBusiness && !attributes.businessName ) {
				_return.fields.businessName = 'Oops, you missed one.';
			}

			if( isBusiness && !attributes.businessEin ) {
				_return.fields.businessName = 'Oops, you missed one.';
			}

			if( isBusiness && !attributes.businessContact ) {
				_return.fields.businessContact = 'Oops, you missed one.';
			}

			if( isBusiness && !this.isBusinessEIN(attributes.businessEin) ) {
				_return.fields.businessEin = 'The EIN number must be in a valid format';
			}	

			// Payment
			if( isDeposit && !attributes.accountHolder ) {
				_return.fields.accountHolder = 'Oops, you missed one.';
			}

			if( isDeposit && !attributes.accountNumber ) {
				_return.fields.accountNumber = 'Oops, you missed one.';
			}

			if( isDeposit && !this.isRoutingNumberValid(attributes.accountRouting) ) {
				_return.fields.accountRouting = 'The routing number must be in a valid format';
			}

			if( isPaypal && !this.isEmailValid(attributes.paypalEmail) ) {
				_return.fields.paypalEmail = "The Paypal email is invalid";
			}

			if( isVenmo && !attributes.venmoEmail  && !attributes.venmoPhone ) {
				_return.fields.venmoEmail = "A venmo email or phone number is required";
				_return.fields.venmoPhone = "A venmo email or phone number is required";
			}
			
			if( isVenmo && attributes.venmoEmail && !this.isEmailValid(attributes.venmoEmail) ) {
				_return.fields.venmoEmail = "The Venmo email is invalid";
			} 

			if( isVenmo && attributes.venmoPhone && !this.isPhoneValid(attributes.venmoPhone) ) {
				_return.fields.venmoPhone = "The Venmo phone number is invalid. Give us a 10 digits phone number.";
			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}

		}
 
	});
	return HostModel;
});