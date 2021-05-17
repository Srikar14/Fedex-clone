const Joi = require('joi');

module.exports.shipmentSchema = Joi.object({
    sender: Joi.object({
        Name: Joi.string().required(),
        Phone: Joi.number().required(),
        Address: Joi.string().required(),
        PostalCode: Joi.number().required(),
        State: Joi.string().required(),
        City: Joi.string().required(),
        Country: Joi.string().required(),
        Email: Joi.string().required()
    }).required(),
    recipient: Joi.object({
        Name: Joi.string().required(),
        Phone: Joi.number().required(),
        Address: Joi.string().required(),
        PostalCode: Joi.number().required(),
        State: Joi.string().required(),
        City: Joi.string().required(),
        Country: Joi.string().required(),
        Email: Joi.string().required()
    }).required()
})

module.exports.packageSchema = Joi.object({
    weight: Joi.number().required(),
    dimensions: Joi.object({
        length: Joi.number().required().min(0).max(20),
        width: Joi.number().required().min(0).max(20),
        height: Joi.number().required().min(0).max(20),
    }).required(),
})

