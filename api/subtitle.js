module.exports = async (req, res) => {
  if (req.method !== "POST") {
    return res.status(405).json({
      error: "POST only"
    });
  }

  try {
    const { blobUrl, mimeType, fileName } = req.body || {};

    if (!blobUrl) {
      return res.status(400).json({
        error: "ভিডিও URL পাওয়া যায়নি।"
      });
    }

    /*
      এখনো Gemini processing এখানে করা হচ্ছে না।
      এই endpoint শুধু বড় ভিডিওর Blob URL গ্রহণ করবে।
    */

    return res.status(200).json({
      success: true,
      message: "ভিডিও পাওয়া গেছে। Processing server-এ পাঠানোর জন্য প্রস্তুত।",
      blobUrl,
      mimeType: mimeType || "video/mp4",
      fileName: fileName || "video"
    });

  } catch (error) {
    console.error("SUBTITLE ERROR:", error);

    return res.status(500).json({
      error: error.message || "Subtitle server error"
    });
  }
};
