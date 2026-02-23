const registerValidation = (data) => {
  const schema = Joi.object({
    fullName: Joi.string().min(3).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(8).required(),
    accountType: Joi.string().valid("customer", "retailer").required(),
    // ADD THESE TWO LINES TO THE SCHEMA:
    stdCode: Joi.string().required(),
    phone: Joi.string()
      .pattern(/^[0-9]{7,12}$/)
      .required(),
    // Optional retailer fields
    businessName: Joi.string().allow(""),
    gstNumber: Joi.string().allow(""),
  });
  return schema.validate(data);
};
