define([
'underscore',
'parse'
], function(_, Parse){

	var ReportModel = Parse.Object.extend("Report", {

		defaults: {
			status: "creation",
			action: null,
			user: null,
			fromProfile: null,
			profile: null, 
			boatday: null,
			message: null
		},

		validate: function(attributes) {
			
			var _return = { 
				fields: {},
				type: 'model-validation'
			};

			if( attributes.message == '' ) {
				_return.fields.message = "Please indicate a reason for the report.";
			}

			if( _.size(_return.fields) > 0 ) {
				return _return;
			}
		}

	});

	return ReportModel;

});
