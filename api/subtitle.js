const { GoogleGenAI } = require("@google/genai");
const formidable = require("formidable");
const fs = require("fs");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).send("POST only");
    return;
  }

  const form = formidable({
    maxFileSize: 100 * 1024 * 1024
  });

  let fields, files;

  try {
    [fields, files] = await form.parse(req);
  } catch (e) {
    res.status(400).send("ভিডিও upload হয়নি: " + e.message);
    return;
  }

  const item = Array.isArray(files.video)
    ? files.video[0]
    : files.video;

  if (!item) {
    res.status(400).send("ভিডিও পাওয়া যায়নি।");
    return;
  }

  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    res.status(500).send(
      "GEMINI_API_KEY server environment-এ সেট করা হয়নি।"
    );
    return;
  }

  try {
    const ai = new GoogleGenAI({
      apiKey: apiKey
    });

    let uploaded = await ai.files.upload({
      file: item.filepath,
      config: {
        mimeType: item.mimetype || "video/mp4"
      }
    });

    while (uploaded.state === "PROCESSING") {
      await new Promise(resolve => setTimeout(resolve, 2000));

      uploaded = await ai.files.get({
        name: uploaded.name
      });
    }

    if (uploaded.state === "FAILED") {
      throw new Error(
        "Gemini ভিডিও processing করতে পারেনি।"
      );
    }

    const prompt = `
Analyze the speech/audio in this video.

Create accurate Bengali subtitles for ALL spoken dialogue.

Translate English, Hindi, or any other spoken language
into natural Bengali.

If the speech is already Bengali, keep it natural Bengali.

Do not invent dialogue.

Synchronize every subtitle closely with the speech.

Return ONLY valid SRT format.

Example:

1
00:00:00,000 --> 00:00:02,000
বাংলা লেখা

2
00:00:02,000 --> 00:00:05,000
পরবর্তী বাংলা লেখা

Keep each subtitle short, normally 1-2 lines.
Include timestamps throughout the entire spoken portion.
`;

    const response = await ai.models.generateContent({
      model: "gemini-3.8-flash",

      contents: [
        {
          role: "user",

          parts: [
            {
              text: prompt
            },
            {
              fileData: {
                fileUri: uploaded.uri,
                mimeType: uploaded.mimeType
              }
            }
          ]
        }
      ]
    });

    let srt = response.text || "";

    srt = srt
      .replace(/```srt/gi, "")
      .replace(/```/g, "")
      .trim();

    if (!srt) {
      throw new Error(
        "Gemini কোনো subtitle ফেরত দেয়নি।"
      );
    }

    res.status(200).json({
      srt: srt
    });

  } catch (e) {

    console.error(e);

    res.status(500).send(
      e.message || "Gemini error"
    );

  } finally {

    try {
      fs.unlinkSync(item.filepath);
    } catch (_) {}

  }
};

module.exports.config = {
  api: {
    bodyParser: false
  }
};
