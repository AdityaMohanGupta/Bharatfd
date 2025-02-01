const translate = require('google-translate-api-x');
const mongoose = require('mongoose');
const express = require('express');
const app = express();
const FAQ = require('./models/FAQ');
const redis = require('ioredis');
require('dotenv').config();
const path = require("path");


app.use(express.json());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));



//create a Redis
const redisClient = new redis(process.env.REDIS_URL, {
    tls: {}
});

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

mongoose.connect(process.env.Mongoo)
.then(()=>{
    console.log("DB connected successfully")
})
.catch((err)=>{
    console.log("DB error"); 
    console.log(err)
})



//translation with redis
async function translateText(text, targetLang) {
    try {
        //first check redis cache for already present translation
        const cachedTranslation = await redisClient.get(`${text}-${targetLang}`);
        if (cachedTranslation) {
            console.log(`Cache hit: Translated (${targetLang}):`, cachedTranslation);
            return cachedTranslation;//return cached translation if found
        }

        //if not found in cache,proceed with google translate
        const res = await translate(text, { to: targetLang });
        if (res.text) {
            //cache the translation
            await redisClient.setex(`${text}-${targetLang}`, 86400, res.text);//cache for 1 day(86400 sec)
            console.log(`Translated (${targetLang}):`, res.text);
            return res.text;
        }
        throw new Error('Translation failed');
    } catch (error) {
        console.error('Translation error:', error.message || error);
        //fallback to english
        try {
            const res = await translate(text, { to: 'en' });
            console.log('Fallback to English:', res.text);
            return res.text;
        } catch (fallbackError) {
            console.error('Fallback translation failed:', fallbackError.message || fallbackError);
            throw new Error('Translation failed even after fallback');
        }
    }
}

//add new faqs with translation
app.post('/faqs', async (req, res) => {
    try {
        const {question,answer} = req.body;
        if (!question||!answer) {
            return res.status(400).json({error: "Question and Answer are required"});
        }
        //translate to Hindi and Bengali
        const question_hi = await translateText(question, 'hi');
        const answer_hi = await translateText(answer, 'hi');
        const question_bn = await translateText(question, 'bn');
        const answer_bn = await translateText(answer, 'bn');
        const faq = new FAQ({
            question,
            answer,
            translations: {
                hi: {question: question_hi,answer: answer_hi},
                bn: {question: question_bn,answer: answer_bn}
            }
        });
        await faq.save();
        res.redirect("/");
        // res.status(201).json({message: "FAQ saved successfully", faq});
    } catch (error) {
        console.error("Error saving FAQ:", error);
        res.status(500).json({error: "Internal Server Error"});
    }
});

app.get('/faqs', (req, res) => {
    res.render('faq');
});


//FAQs based on language
app.get('/lan', async (req, res) => {
    const lang = req.query.lang || 'en'; //default language is english
    try {
        const faqs = await FAQ.find();//fetch FAQs from the database
        let faqData;
        if (lang === 'hi') {
            faqData = faqs.map(faq => ({
                question: faq.translations.hi.question,
                answer: faq.translations.hi.answer
            }));
        } else if (lang === 'bn') {
            faqData = faqs.map(faq => ({
                question: faq.translations.bn.question,
                answer: faq.translations.bn.answer
            }));
        } else {
            faqData = faqs.map(faq => ({
                question: faq.question,
                answer: faq.answer
            }));
        }
        res.render('lang', { faqs: faqData });
    } catch (error) {
        console.error('Error fetching FAQs:', error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});


//admin Panel - view all FAQs
app.get("/admin", async (req, res) => {
    try {
        const faqs = await FAQ.find();
        res.render("admin", { faqs });
    } catch (error) {
        res.status(500).send("Error fetching FAQs");
    }
});

//add new FAQ
app.post("/admin/add", async (req, res) => {
    const { question, answer } = req.body;
    if (!question || !answer) return res.status(400).send("Both fields are required");
    const question_hi = await translateText(question, "hi");
    const answer_hi = await translateText(answer, "hi");
    const question_bn = await translateText(question, "bn");
    const answer_bn = await translateText(answer, "bn");
    const newFAQ = new FAQ({
        question,
        answer,
        translations: {
            hi: { question: question_hi, answer: answer_hi },
            bn: { question: question_bn, answer: answer_bn }
        }
    });
    await newFAQ.save();
    res.redirect("/admin");
});

//delete FAQ
app.post("/admin/delete/:id", async (req, res) => {
    await FAQ.findByIdAndDelete(req.params.id);
    res.redirect("/admin");
});

//edit FAQ
app.post("/admin/edit/:id", async (req, res) => {
    const { question, answer } = req.body;
    const question_hi = await translateText(question, "hi");
    const answer_hi = await translateText(answer, "hi");
    const question_bn = await translateText(question, "bn");
    const answer_bn = await translateText(answer, "bn");

    await FAQ.findByIdAndUpdate(req.params.id, {
        question,
        answer,
        translations: {
            hi: { question: question_hi, answer: answer_hi },
            bn: { question: question_bn, answer: answer_bn }
        }
    });

    res.redirect("/admin");
});

//check karne ke ke liye
// translateText('नमस्ते, कैसे हो?', 'bn')
//     .then(result => console.log('Translation:', result))
//     .catch(err => console.error('Error:', err));


app.get('/', (req, res) => {
    res.render('index');
});

const port=process.env.PORT || 8080;
app.listen(port , ()=>{
    console.log("server running at port 8080")
})