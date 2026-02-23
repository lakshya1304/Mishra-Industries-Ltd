const Joi = require("joi");

const registerValidation = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),

    // These must match exactly what your frontend sends
    stdCode: Joi.string().required(),
    phone: Joi.string()
      .pattern(/^[0-9]{7,12}$/)
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
