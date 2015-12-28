
			var basicHostMessage = "Hi " + notification.get('to').get('displayName') + ",\n\nYou have a new message in your BoatDay inbox, access the BoatDay Host Center - https://www.boatdayhosts.com - to read your messages.\n\nSee you on the water!\nThe BoatDay Team";
			var isHost = typeof notification.get('to').get('host') !== typeof undefined;
			var phoneNumber = !isHost ? null : notification.get('to').get('host').get('phone');

			switch( notification.get('action') ) {
				case "request-approved": 
					// To Guest
					var sendPush = true;
					var pushMessage = "Your seat request has been approved - [name of boatday]";
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "Your BoatDay is confirmed - [BoatDay Name]!";
					var emailMessage = "Hi [guest name], (line) Grab your bathing suit because youre going boating! (line) [Host Name] has confirmed your request for [#of seats] on [Name of BoatDay]. Review the details of your trip and use the chat wall [link to app chat wall] to coordinate any last-minute details with your Host. (line/graphic/image) Invite friends to join you! Share your personal invite link to give friends $[responsive #] off to join you onboard. Get a $[responsive #] credit for every friend that joins the fun.(invite friends button) [BooatDay Preview/summary view].";
					var sendText = false;
					var textMessage = null; 
					break;
				case "request-denied": 
					// To Guest
					var sendPush = true;
					var pushMessage = "Your seat request was denied - [name of boatday]";
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "Your BoatDay Request - [BoatDay Name]";
					var emailMessage = "Hi [Guest Name], (line) Your request for [# of seats] seats on [name of BoatDay] has been denied by the Host. (line) Still looking for a great [category of BoatDay] BoatDay nearby? Take a look at these other great trips available in the area. (line) To make it even better, book with the promo code [auto generated Promo Code] to get $[responsive #] off your day out!  [Preview of BoatDays matching criteria of rejected BoatDay] [View More BoatDays button]";
					var sendText = false;
					var textMessage = null;
					break;
				case "request-cancelled-host": 
					// To Guest
					var sendPush = true;
					var pushMessage = "Uh oh! You were removed by the Host from the BoatDay [name of BoatDay].";
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "BoatDay Cancellation - [Name of BoatDay]";
					var emailMessage = "Hi [name of Guest], (line) Looks like you were removed from the BoatDay [name of BoatDay] by the Host. Still looking for a great [category of BoatDay] BoatDay nearby? Take a look at these other great trips available in the area. (line) Wait! It gets better . . . book with the promo code [auto generated Promo Code] to get $[responsive #] off your day out!  [Preview of BoatDays matching criteria of rejected BoatDay] [View More BoatDays button] (line) If you think you were removed from this BoatDay by mistake contact [email link - support@boatdayapp.com] us and let us know.";
					var sendText = false;
					var textMessage = null;
					break;
				case "boatday-question": 
					// To Host
					var sendPush = false;
					var pushMessage =null;
					var sendEmail = false;
					var emailFrom = null;
					var emailSubject = null;
					var emailMessage = null;
					var sendText = true;
					var textMessage = "Good news! A Guest has asked a question about one of your BoatDays.  Click here to answer.";
					break;
				case "boatday-answer":
					// To Guest
					var sendPush = true;
					var pushMessage = "[Host name] has answered your question about [name of BoatDay].";
					var sendEmail = false;
					var emailFrom = null;
					var emailSubject = null;
					var emailMessage = null;
					var sendText = false;
					var textMessage = null;
					break;
				case "boatday-request": 
					// To Host
					var sendPush = false;
					var pushMessage = null;
					var sendEmail = false;
					var emailFrom = null;
					var emailSubject = null;
					var emailMessage = null;
					var sendText = true;
					var textMessage = "Great news! You have a new BoatDay request. Click [here] to view it in your BoatDay account.";
					break;
				case "boatday-rating":
					// To Host [should be once a day check and send - not 1 per review]
					var sendPush = false;
					var pushMessage = null;
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "You have a new BoatDay review";
					var emailMessage = "Hi [Name of Host], (line) You have [# of new reviews] new reviews for your BoatDay [name of BoatDay]. Click [here] to read your reviews in your BoatDay account [Thumbnail of BD].";
					var sendText = false;
					var textMessage = null;
					break;
				case "boatday-cancelled": 
					// To Guest
					var sendPush = true;
					var pushMessage = "Uh oh! Your BoatDay [name of BoatDay] was cancelled by the Host.";
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "BoatDay Cancellation - [Name of BoatDay]";
					var emailMessage = "Hi [name of Guest], (line) Looks like your BoatDay [name of BoatDay] was cancelled by the Host. Don't worry, there are still lots of great [category of BoatDay] BoatDays nearby, like one of these other fun trips. (line) But wait, it gets better! Book with the promo code [auto generated Promo Code] and get $[responsive #] off your day out!  [Preview of BoatDays matching criteria of rejected BoatDay] [View More BoatDays button].";
					var sendText = false;
					var textMessage = null;
					break;
				case "boatday-message": 
					// To Guest + Host
					var sendPush = true;
					var pushMessage = "You have a new chat message for [name of BoatDay]!";
					var sendEmail = false;
					var emailFrom = null;
					var emailSubject = null;
					var emailMessage = null;
					var sendText = true; 
					var textMessage = "You have a new Guest message in your BoatDay Account. Click here to view.";
					break;
				case "boatday-reschedule": 
					// To Guest
					var sendPush = true
					var pushMessage = "Your BoatDay [name of BoatDay] was rescheduled by the Host.";
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "Rescheduled BoatDay - [name of BoatDay]";
					var emailMessage = "Hi [name of guest], (line) Your BoatDay [name of BoatDay] has been rescheduled by the Host. [Graphic - Host pic + rescheule message] [Graphic rescheuled boatday info]. Click here to confirm or deny your seat(s) for the rescheduled trip [Two Buttons - Confirm Seat, Can't Make it]. [line]  Can't make it? Don't worry, there are still lots of great [category of BoatDay] BoatDays nearby, like one of these other fun trips. (line) But wait, it gets better! Book with the promo code [auto generated Promo Code] and get $[responsive #] off your day out!  [Preview of BoatDays matching criteria of BoatDay before rescheudling] [View More BoatDays button].";
					var sendText = false;
					var textMessage = null;
					break;
				case "boatday-rating": 
					// To Guest
					var sendPush = true;
					var pushMessage = "You just received a [#of stars] star Guest rating.";
					var sendEmail = false;
					var emailFrom = null;
					var emailSubject = null;
					var emailMessage = null;
					var sendText = false;
					var textMessage = null;
					break;
				case "boatday-review": 
					// To Host [DUPLICATE OF ABOVE line 322]
					var sendPush = false;
					var pushMessage = null;
					var sendEmail = false;
					var emailFrom = null;
					var emailSubject = null;
					var emailMessage = null;
					var sendText = false;
					var textMessage = null;
					break;
				case "boatday-payment": 
					// To Host [send once all payments done]
					var sendPush = false;
					var pushMessage = null;
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "BoatDay Payment Summary";
					var emailMessage = "Hi [Name of Host], (line) Here's the payment summary for your BoatDay [Name of BoatDay] (graphic showing BD thumbnail, date, time, # of Guests, payout # [with expand to view button to show per Guest/fees/etc] (line) Note: Please allow 2-3 days for payment to appear in your Bank Account. (line) It's that easy! Create another BoatDay and plan your next day out. [Create BoatDay Link to Host Profile]";
					var sendText = false;
					var textMessage = null;
					break;
				case "reschedule-approved": 
					// To Host
					var sendPush = false;
					var pushMessage = null;
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "Reschedule Accepted - [Name of BoatDay]!";
					var emailMessage = "Hi [Host Name], (line) [Guest Name] is confirmed for your rescheduled BoatDay [Name of BoatDay]. Don't forget, you can chat with all confirmed Guests from your BoatDay account [link to Chat wall for BD].  (graphic/preview of rescheduled BoatDay) (line) Have a great day out!";
					var sendText = false;
					var textMessage = null;
					break;
				case "reschedule-denied": 
					// To Host
					var sendPush = false;
					var pushMessage = null;
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "Reschedule Declined - [Name of BoatDay]!";
					var emailMessage = "Hi [Host Name], (line) [Guest Name] is unable to attend your rescheduled BoatDay [Name of BoatDay]. (graphic/preview of rescheduled BoatDay) (line) Got some extra space on-board? Find more great BoatDay Guests from the BoatDay community! Share your BoatDay on Facebook or invite your friends directly.  [Invite Friends Button] Have a great day out!";
					var sendText = false;
					var textMessage = null;
					break;
				case "auto-payment": 
					// To Guest [dont think we send them anything, leave it for stripe email]
					var sendPush = false
					var pushMessage = null;
					var sendEmail = false;
					var emailFrom = null;
					var emailSubject = null;
					var emailMessage = null;
					var sendText = false;
					var textMessage = null;
					break;
				case "certification-approved": 
					// To Host
					var sendPush = false;
					var pushMessage = null;
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "New BoatDay Message";
					var emailMessage = basicHostMessage;
					var sendText = false;
					var textMessage = null;
					break;
				case "certification-denied": 
					// To Host
					var sendPush = false;
					var pushMessage = null;
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "New BoatDay Message";
					var emailMessage = basicHostMessage;
					var sendText = false;
					var textMessage = null;
					break;
				case "host-approved": 
					// To Host
					var sendPush = false;
					var pushMessage = null;
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "Grab your Captain's hat, you're a BoatDay Host";
					var emailMessage = "Hi [Host Name], (line) Good news, your Host registration has been approved! /n You're now just one step away from Hosting BoatDays. Register your Boat, and once its approved by the BoatDay Team, you'll be all set to accept your first Guests on-board! /n Already added a boat? Create your first BoatDay while you wait for approval /n See you on the water! /n BoatDay Registration Team (two buttons - add boat, create boatday)";
					var sendText = false;
					var textMessage = null;
					break;
				case "host-denied": 
					// To Host
					var sendPush = false;
					var pushMessage = null;
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "Your BoatDay Host Registration";
					var emailMessage = "Hi [Host Name], /n We are unable to approve your Host registration at this time. /n We'll be sure to let you know if your status changes, and how to continue with the registration process at that time. /n Thanks for your interest in BoatDay, /n The BoatDay Registration Team.";
					var sendText = false;
					var textMessage = null;
					break;
				case "boat-approved": 
					// To Host
					var sendPush = false;
					var pushMessage = null;
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "Set sail on your approved boat";
					var emailMessage = "Hi [Host Name], (line) Get ready to set sail! /n Your Boat [name of boat] has been approved and you're all set to start Hosting BoatDays. /n Haven't created a BoatDay yet? Click below to plan your first BoatDay! [one button: create boatday) /n  Already created a BoatDay . . . it's now listed in the BoatDay app for Guest bookings. [BD Preview Card] See you on the water, /n The BoatDay Registration Team.";
					var sendText = false;
					var textMessage = null;
					break;
				case "boat-denied": 
					// To Host
					var sendPush = false;
					var pushMessage = null;
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "Your BoatDay Registration";
					var emailMessage = "Hi [host name], /n Your boat registration has been denied. Don't worry, a member of our Registration team will contact you to let you know the reason, and what is still needed to register your Boat for Hosting BoatDays. /n See you on the water soon, /n the BoatDay Registration Team.";
					var sendText = false;
					var textMessage = null;
					break;
				case "bd-message": 
					// To Guest + Host
					var sendPush = true;
					var pushMessage = "Hi [Guest Name]! Check your BoatDay notications for a new message from the BoatDay team." 
					var sendEmail = true;
					var emailFrom = "no-reply@boatdayapp.com";
					var emailSubject = "Message from the BoatDay Team"
					var emailMessage = "Hi [User Name], You have a new message from the BoatDay team: (line) notification.get('message') (line)"; 
					var sendText = false;
					var textMessage = null;
					break;
				default : 
					// To Guest + Host
					var sendPush = true;
					var pushMessage = "You have a new BoatDay notification!";
					var sendEmail = false;
					var emailFrom = null;
					var emailSubject = null;
					var emailMessage = null;
					var sendText = false;
					var textMessage = null;
					break;
			} 