const Joi = require("joi");

const registerValidation = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    // UPDATED: Supports '+' followed by 1-4 digit country code and 10 digit number
    phone: Joi.string()
      .trim()
      .pattern(/^\+\d{1,4}\d{10}$/)
      .required()
      .messages({
        "string.pattern.base":
          "Phone number must be in valid international format (e.g., +919876543210).",
        "any.required": "Phone number is a required field.",
      }),
    password: Joi.string()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        ),
      )
      .required(),
    accountType: Joi.string().valid("customer", "retailer").required(),
    businessName: Joi.string().when("accountType", {
      is: "retailer",
      then: Joi.required(),
      otherwise: Joi.optional(),
    }),
    gstNumber: Joi.string()
      .length(15)
      .pattern(/^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/)
      .when("accountType", { is: "retailer", then: Joi.required() }),
  });

  return schema.validate(data);
};

module.exports = { registerValidation };
