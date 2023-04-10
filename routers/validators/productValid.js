const {check} = require('express-validator');

module.exports = [
    check('name')
    .exists().withMessage(`Please fill the product's name field`)
    .notEmpty().withMessage(`Product's name fields must not be empty!`),

    check('price')
    .exists().withMessage(`Please fill the product's price field`)
    .notEmpty().withMessage(`Product's price fields must not be empty!`)
    .isNumeric().withMessage(`Product's price must be a number`),

    check('desc')
    .exists().withMessage(`Please fill the product's description field`)
    .notEmpty().withMessage(`Product's description fields must not be empty!`),
]