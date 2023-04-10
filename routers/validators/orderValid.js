const {check} = require('express-validator');

module.exports = [
    check('total')
    .exists().withMessage(`Please fill the order's total field`)
    .notEmpty().withMessage(`Order's total fields must not be empty!`)
    .isNumeric().withMessage(`Order's total must be a number`),

    check('products')
    .exists().withMessage(`Please fill the order's products field`)
    .notEmpty().withMessage(`Order's products fields must not be empty!`),
]