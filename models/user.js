const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const UserSchema = new Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    shipments: [{ type: Schema.Types.ObjectId, ref: 'Shipment' }],
    packages: [{ type: Schema.Types.ObjectId, ref: 'Package' }]
});

UserSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', UserSchema);