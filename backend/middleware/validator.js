const Joi = require("joi");

const registerValidation = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),

    // FIX 2: Update regex to allow an optional '+' sign at the start
    phone: Joi.string()
      .pattern(/^\+?[0-9]{7,15}$/)
      .required(),

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
      otherwise: Joi.optional().allow(""),
    }),

    gstNumber: Joi.string()
      .length(15)
      .when("accountType", {
        is: "retailer",
        then: Joi.required(),
        otherwise: Joi.optional().allow(""),
      }),
  });

  return schema.validate(data);
};

module.exports = { registerValidation };
