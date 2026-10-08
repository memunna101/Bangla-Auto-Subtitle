const { handleUpload } = require("@vercel/blob/client");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({
      error: "POST only"
    });
    return;
  }

  try {
    const body = req.body;

    const jsonResponse = await handleUpload({
      body,
      request: req,

      onBeforeGenerateToken: async (pathname) => {
        return {
          allowedContentTypes: [
            "video/mp4",
            "video/webm",
            "video/x-matroska",
            "video/quicktime",
            "video/x-msvideo",
            "video/mpeg",
            "video/ogg",
            "video/*"
          ],

          addRandomSuffix: true,

          tokenPayload: JSON.stringify({
            pathname
          })
        };
      },

      onUploadCompleted: async ({ blob }) => {
        console.log("Video upload completed:", blob.url);
      }
    });

    res.status(200).json(jsonResponse);

  } catch (error) {
    console.error(error);

    res.status(400).json({
      error: error.message || "Blob upload error"
    });
  }
};
