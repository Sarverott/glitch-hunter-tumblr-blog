// Tumblr NPF Post Generator
const generateNPFGlitchPost = (glitchData) => {
  return {
    content: [
      { type: "image", media: [{ url: glitchData.photoUrl }] },
      { type: "text", subtype: "heading1", text: glitchData.venue + " // Glitch Found" },
      { type: "text", text: "Reported OS: " + glitchData.osDetected },
      { type: "text", text: "Submitter credit: @" + glitchData.tumblrHandle }
    ],
    tags: ["glitchinthematrix", "publicdisplay", "windows10"]
  };
};
