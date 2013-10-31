var db = require('mongoose'),
    Schema = db.Schema,
    ObjectId = Schema.ObjectId;

var venueSchema = new Schema({
    geo: { type: [Number], index: '2dsphere'},
    city: String,
    name: String,
    address: String
});

