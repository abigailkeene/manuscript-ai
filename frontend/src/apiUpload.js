// src/apiUpload.js
// Gemini API helper function

// ⚠️ Never expose API keys in production frontend apps.
// For learning/demo only!
const GEMINI_API_KEY = "AIzaSyD-UtYR5Q7wc-pFFphw_7xu4J2r1MSJSSk";

export const callGemini = async (prompt) => {
  const models = ["gemini-1.5-flash-latest", "gemini-1.5-pro-latest"]; // try flash first, then pro

  for (const model of models) {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ parts: [{ text: prompt }] }],
            }),
          }
        );

        const data = await res.json();
        console.log(`Model ${model}, attempt ${attempt}:`, data);

        if (!data.error) {
          return (
            data?.candidates?.[0]?.content?.parts?.[0]?.text ||
            "⚠️ No response from Gemini"
          );
        }

        if (data.error.status === "UNAVAILABLE") {
          console.warn("Model overloaded, retrying...");
          await new Promise((r) => setTimeout(r, 2000));
          continue;
        }

        throw new Error(data.error.message);
      } catch (err) {
        console.error(`Error with model ${model}:`, err.message);
        if (attempt === 3) break; // give up after 3 tries for this model
      }
    }
  }

  throw new Error("Both flash and pro models failed after retries.");
};
