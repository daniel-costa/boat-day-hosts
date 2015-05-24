define([
'parse'
], function(Parse){
	var HostModel = Parse.Object.extend("Host", {

		defaults: {

			status: 'creation',
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
			city: null,
			zipCode: null,
			state: null,
			country: "USA",

			businessName: null,
			businessEin: null,

			firstname: null, 
			lastname: null, 
			birthdate: null,
			SSN: null,

			certBSC: null,
			certCCL: null,
			certMCL: null,
			certFL: null,
			certSL: null,
			certFAC: null

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

			var isDeposit = attributes.paymentMethod == "deposit";
			var isVenmo = attributes.paymentMethod == "venmo";
			var isPaypal = attributes.paymentMethod == "paypal";

			// Global fields

			if( !attributes.phone ) {
				_return.fields.phone = 'Oops, you missed one!';
			}
			
			if( !attributes.street ) {
				_return.fields.street = 'Oops, you missed one!';
			}

			if( !attributes.city ) {
				_return.fields.city = 'Oops, you missed one!';
			}

			if( !/^\d{5}$/.test(attributes.zipCode) ) {
				_return.fields.zipCode = 'Oops, you missed one! Please enter your 5 digit zip code.';
			}

			if( !attributes.street ) {
				_return.fields.street = 'Oops, you missed one!';
			}

			if( !this.isPhoneValid(attributes.phone) ) {
				_return.fields.phone = 'Oops, you missed one! Enter your phone number, area code and all.';
			}

			if( !attributes.firstname ) {
				_return.fields.firstname = 'Oops, you missed one!';
			}
			 
			if( !attributes.lastname ) {
				_return.fields.lastname = 'Oops, you missed one!';
			}

			if( !/^\d{4}$/.test(attributes.SSN) ) {
				_return.fields.SSN = 'Soc. Sec. # (last 4 digits) is required.';
			}

			if( attributes.businessEin && !this.isBusinessEIN(attributes.businessEin) ) {
				_return.fields.businessEin = 'The EIN number must be in a valid 9 digit format.';
			}	

			// Payment
			if( isDeposit && !attributes.accountHolder ) {
				_return.fields.accountHolder = 'Oops, you missed one!';
			}

			if( isDeposit && !attributes.accountNumber ) {
				_return.fields.accountNumber = 'Oops, you missed one!';
			}

			if( isDeposit && !this.isRoutingNumberValid(attributes.accountRouting) ) {
				_return.fields.accountRouting = 'Oops, you missed one! Please enter a valid 9 digit routing number.';
			}

			if( isPaypal && !this.isEmailValid(attributes.paypalEmail) ) {
				_return.fields.paypalEmail = "The email you entered was not recognized by Paypal, please try again.";
			}

			if( isVenmo && !attributes.venmoEmail  && !attributes.venmoPhone ) {
				_return.fields.venmoEmail = "A venmo email or phone number is required.";
				_return.fields.venmoPhone = "A venmo email or phone number is required.";
			}
			
			if( isVenmo && attributes.venmoEmail && !this.isEmailValid(attributes.venmoEmail) ) {
				_return.fields.venmoEmail = "The email you entered was not recongized by Venmo, please try again.";
			} 

			if( isVenmo && attributes.venmoPhone && !this.isPhoneValid(attributes.venmoPhone) ) {
				_return.fields.venmoPhone = "The phone number you entered was not recognized by Venmo, please try again.";
			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}

		}
 
	});
	return HostModel;
});