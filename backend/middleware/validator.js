const Joi = require('joi');

const registerValidation = (data) => {
    const schema = Joi.object({
        fullName: Joi.string().min(3).required(),
        email: Joi.string().email().required(),
        // Phone Validation: Must be 10 digits, starts with 6-9
        phone: Joi.string()
            .length(10)
            .pattern(/^[6-9]\d{9}$/)
            .required()
            .messages({
                'string.pattern.base': 'Phone number must be a valid 10-digit Indian number.',
                'string.length': 'Phone number must be exactly 10 digits.'
            }),
        password: Joi.string()
            .min(8)
            .pattern(new RegExp('^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$'))
            .required(),
        accountType: Joi.string().valid('customer', 'retailer').required(),
        businessName: Joi.string().when('accountType', {
            is: 'retailer',
            then: Joi.required(),
            otherwise: Joi.optional()
        })
    });

    return schema.validate(data);
};

module.exports = { registerValidation };