const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const shipmentSchema = new Schema({
    username: String,
    shipmentId: String,
    shipmentType: String,
    sender: {
        Name: String,
        Phone: Number,
        Address: String,
        PostalCode: Number,
        City: String,
        State: String,
        Country: String,
        Email: String,
    },
    recipient: {
        Name: String,
        Phone: Number,
        Address: String,
        PostalCode: Number,
        City: String,
        State: String,
        Country: String,
        Email: String,
    }
})

module.exports = mongoose.model('Shipment', shipmentSchema)