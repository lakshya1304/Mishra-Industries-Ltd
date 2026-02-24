const Joi = require("joi");

const registerValidation = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),

    // FIX: Optimized for 10-digit Indian numbers sent by your frontend
    
    stdCode: Joi.string().pattern(/^\+[0-9]{1,4}$/).required(), 
    
    phone: Joi.string().pattern(/^[0-9]{7,15}$/).required(),

    password: Joi.string()
      .min(8)
      .pattern(
        new RegExp(
          "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$",
        ),
      )
      .required(),

    accountType: Joi.string().valid("customer", "retailer", "admin").required(),

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
  }).unknown(true); // Allows extra fields like stdCode if sent, without crashing

  return schema.validate(data);
};

module.exports = { registerValidation };
