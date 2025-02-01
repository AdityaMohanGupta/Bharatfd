const mongoose = require('mongoose');

const FAQSchema = new mongoose.Schema({
    question: { type: String, required: true },
    answer: { type: String, required: true },
    translations: {
        hi: { question: String, answer: String },  // Hindi translation
        bn: { question: String, answer: String }   // Bengali translation
    }
});

const FAQ = mongoose.model('FAQ', FAQSchema);
module.exports = FAQ;
