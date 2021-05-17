const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const packageSchema = new Schema({
    trackingId: String,
    shipmentId: String,
    username: String,
    weight: Number,
    dimensions: {
        length: Number,
        width: Number,
        height: Number
    },
    purpose: String,
    state: {
        type: String,
        default: 'Processing'
    },
    geometry: {
        type: {
            type: String,
            enum: ['Point'],
            required: true
        },
        coordinates: {
            type: [Number],
            required: true
        }
    },
    location: String
})

module.exports = mongoose.model("Package", packageSchema);