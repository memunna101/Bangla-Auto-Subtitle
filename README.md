# Bangla Auto Subtitle Player

এটি একটি prototype: ভিডিও upload → backend → Gemini → Bengali SRT → browser video player.

## Deploy করার আগে
1. `npm install`
2. Vercel-এ project import করুন।
3. Environment Variable যোগ করুন:
   `GEMINI_API_KEY`
4. Deploy করুন।

API key কখনো `index.html`-এ বসাবেন না।

Gemini Files API ব্যবহার করা হয়েছে যাতে ছোট inline request-এর সীমাবদ্ধতায় আটকে না যায়।
