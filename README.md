# BharatFD

BharatFD is a backend project for managing multilingual FAQs. This application allows users to submit Frequently Asked Questions (FAQs) in English, and automatically translates them into Hindi and Bengali. The project uses MongoDB for storing FAQ data, Redis for caching translations, and integrates the Google Translate API for real-time translations. This project offers a RESTful API to manage and retrieve FAQs in multiple languages.

---

## Table of Contents

- [Project Overview](#project-overview)
- [Installation Steps](#installation-steps)
  - [Prerequisites](##prerequisites)
  - [Install Dependencies](##install-dependencies)
  - [Configure Environment Variables](##configure-environment-variables)
  - [Run the Application](##run-the-application)
- [API Usage Examples](#api-usage-examples)
  - [Add FAQ](##add-faq)
  - [Fetch FAQs](##fetch-faqs)
- [Technologies Used](#technologies-used)

---

## Project Overview

The BharatFD backend allows users to:
- Add new FAQs with translations in Hindi and Bengali.
- Retrieve FAQs in English, Hindi, or Bengali, depending on the user's choice.
- Cache translations using Redis to improve performance.

---

## Installation Steps

### 1. Prerequisites
Before you begin, ensure you have the following installed:
- [Node.js](https://nodejs.org/) (v14 or higher)
- [MongoDB](https://www.mongodb.com/try/download/community) (locally or use MongoDB Atlas)
- [Redis](https://redis.io/download) (locally or use a Redis cloud service such as [Redis Labs](https://redislabs.com/))
- [Google Translate API](https://cloud.google.com/translate) (to enable translations)

### 2. Install Dependencies

Run the following command to install all required dependencies:

```bash
npm install
```

### 3. Configure Environment Variables

Create a .env file in the root directory of the project and add the following variables:

```bash
MONGO_URI=mongodb://localhost:27017/faqDB  # MongoDB URI (or MongoDB Atlas URI)
REDIS_URL=rediss://<your-redis-url>  # Redis URL (For example: rediss://your-redis-server:6379)
GOOGLE_API_KEY=<your-google-api-key>  # Google Translate API key
```

### 4. Run the Application

Start the server by running:

```bash
npm start
```

The application will run on http://localhost:8080.

---


## API Usage Examples

### 1. Add FAQ

To add a new FAQ, make a POST request to /faqs with the question and answer fields in the body.

Request Example:

```bash
POST /faqs
Content-Type: application/json

{
  "question": "What is BharatFD?",
  "answer": "BharatFD is a platform to manage FAQs in multiple languages."
}
```

Response Example:

```bash
{
  "message": "FAQ saved successfully",
  "faq": {
    "_id": "60c72b2f8d2fbd1aebcd1e9d",
    "question": "What is BharatFD?",
    "answer": "BharatFD is a platform to manage FAQs in multiple languages.",
    "translations": {
      "hi": {
        "question": "BharatFD क्या है?",
        "answer": "BharatFD एक मंच है जहां बहुभाषी FAQs का प्रबंधन किया जाता है।"
      },
      "bn": {
        "question": "BharatFD কী?",
        "answer": "BharatFD একটি প্ল্যাটফর্ম যা বহু ভাষায় FAQs পরিচালনা করে।"
      }
    }
  }
}
```

### 2. Fetch FAQs

To fetch FAQs, make a GET request to /lan with the optional lang query parameter for the desired language (e.g., lang=hi for Hindi, lang=bn for Bengali).

Request Example:

```bash
GET /lan?lang=hi
```

Response Example (in Hindi):

```bash
[
  {
    "question": "BharatFD क्या है?",
    "answer": "BharatFD एक मंच है जहां बहुभाषी FAQs का प्रबंधन किया जाता है।"
  }
]
```

---


## Technologies Used

- **Node.js** - JavaScript runtime used for building the backend API.
- **Express.js** - Web framework used for routing and handling HTTP requests.
- **MongoDB** - NoSQL database for storing FAQ data.
- **Redis** - In-memory data store for caching translations to improve performance.
- **Google Translate API** - Service used for translating FAQs into multiple languages.
- **dotenv** - Module for loading environment variables from a .env file.
- **ioredis** - Redis client for Node.js to connect to Redis.
- **google-translate-api-x** - Google Translate API client for translation services.



