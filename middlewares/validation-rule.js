const { body } = require("express-validator");

const validationWebViewLogin = [
  body("password")
    .isLength({min: 1})
    .withMessage("Pour vous connecter, renseignez votre email de connexion et votre mot de passe."),
  body("email")
    .exists({ checkFalsy: true })
    .withMessage("Pour vous connecter, renseignez votre email de connexion et votre mot de passe.")
    .isEmail()
    .withMessage("Le format de votre adresse email est incorrect. Merci de fournir une adresse au format valide comme par exemple : nom@mail.com")
];

module.exports = validationWebViewLogin;