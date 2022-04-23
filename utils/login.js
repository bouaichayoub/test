function emailIsValid(email) {
	return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}
let validateEmail = false;

$('#login').on('change', (function (e) {
    e.preventDefault();
    if (e.target.value !== "" && emailIsValid(e.target.value) === false) {
        $('#email-error-message').html("Le format de votre adresse email est incorrect. Merci de fournir une adresse au format valide comme par exemple : nom@mail.com");
    } else {
        $("#email-error-message").html("");
    }
}));

$(".c-input__pictoBtn").click(function() {
//  $(this).toggleClass("icon-eye-slash icon-eye");
 var input = $("#password");
    if (input.attr("type") == "password") {
      document.getElementById('password').setAttribute('type', 'text')
      $("#picto_icon_1").toggleClass("c-input__pictoShow c-input__pictoHide");
      $("#picto_icon_2").toggleClass("c-input__pictoHide c-input__pictoShow");
    } else if (input.attr("type") == "text"){
      document.getElementById('password').setAttribute('type', 'password')
      $("#picto_icon_1").toggleClass("c-input__pictoHide c-input__pictoShow");
      $("#picto_icon_2").toggleClass("c-input__pictoShow c-input__pictoHide");
    }
});
$( "form" ).on("submit", function (event) {
    event.preventDefault();
    const mail = $("#email").val();
    const password = $("#password").val();
    let validateEmail = false;
    let validatePassword = true;

    if (mail.length === 0 || mail === null) {
      $('#email-error-message').html("Pour vous connecter, renseignez votre email de connexion et votre mot de passe.");
      validateEmail = false;
    } else if (emailIsValid(mail) === false) {
      $('#email-error-message').html("Le format de votre adresse email est incorrect. Merci de fournir une adresse au format valide comme par exemple : nom@mail.com");
      validateEmail = false;
    } else {
      $("#email-error-message").html("");
      validateEmail = true;
    }

    if (password.length === 0 || password === null) {
      $('#error-message').html("Pour vous connecter, renseignez votre email de connexion et votre mot de passe.");
      validatePassword = false;
    } else {
      $("#error-message").html("");
      validatePassword = true;
    }
    if (validatePassword && validateEmail) {
        grecaptcha.enterprise.ready(function () {
          grecaptcha.enterprise.execute($("#creds").attr("s_id"), {
              action: "LOGIN"
            })
            .then(function (tokenCaptcha) {
              $(".c-spinner").show();
              $.ajax({
                url: "/okta",
                type: 'POST',
                data: { username : mail, password: password },
                success: function(res) {
                  //window.location.href = '/'
                  $(".c-spinner").hide();
                }
              });
              /*const authClient = new OktaAuth({
                    clientId: $("#creds").attr("clientId"),
                    redirectUri: $("#creds").attr("redirectUri"),
                    issuer: $("#creds").attr("issuer"),
                    responseType: 'code',
                    pkce: false
                });

                const authClient2 = new OktaAuth({
                    clientId: $("#creds").attr("clientId2").trim(),
                    redirectUri: $("#creds").attr("redirectUri").trim(),
                    issuer: $("#creds").attr("issuer2").trim(),
                    authorizeUrl: $("#creds").attr("issuer2").trim() + "/oauth/v1/authorize",
                    responseType: 'code',
                    pkce: false
                });

                authClient.signInWithCredentials({username: mail, password})
                .then((transaction) => {
                  console.log(transaction);
                    if (transaction.status === 'SUCCESS') {
                        //console.log(transaction)
                        authClient2.token.getWithoutPrompt({
                            sessionToken: transaction.sessionToken,
                            scopes: ['openid', 'offline_access', 'profile', 'idb2c'],
                            state: JSON.stringify({mail})
                        })
                        .then(function(res) {
                          showError("HELLO");
                        })
                        .catch(function(err) {
                          console.log(err)
                          showError("Une erreur technique est survenue");
                        // handle OAuthError or AuthSdkError (AuthSdkError will be thrown if app is in OAuthCallback state)
                        });
                        $(".c-spinner").hide();
                    } else {
                      showError("Une erreur technique est survenue");
                    }
                }).catch((err) => {
                    showError("L'adresse email et/ou le mot de passe sont incorrects.");
                });*/

            });
        });

    }
    function showError (text) {
        var errorMessageDiv = $('#error-message');
        $("#submit").prop("disabled", false);
        errorMessageDiv.show("slow");
        $(".c-spinner").hide();
        errorMessageDiv.html(text);
    };

    $('#login').on('change', (function (e) {
		e.preventDefault();
		if (e.target.value !== "" && emailIsValid(e.target.value) === false) {
			$('#email-error-message').html("Le format de votre adresse email est incorrect. Merci de fournir une adresse au format valide comme par exemple : nom@mail.com");
		} else {
			$("#email-error-message").html("");
		}
	}));
});
