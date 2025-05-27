const askOpenAI = async (message) => {
  try {
    const res = await fetch("/api/ask-openai", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });

    if (!res.ok) {
      throw new Error(`HTTP ${res.status}`);
    }

    const data = await res.json();
    return data.reply;
  } catch (err) {
    console.error("askOpenAI error:", err);
    return "Sorry, something went wrong while contacting the AI.";
  }
};

export default askOpenAI;
