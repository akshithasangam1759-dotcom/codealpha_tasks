const Groq = require('groq-sdk');

const groq = new Groq({ apiKey: process.env.GROK_API_KEY });

const chat = async (req, res) => {
  const { message, history = [] } = req.body;

  try {
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: `You are Vibey 🎵, a fun and friendly music AI bestie on BuzzBee. 
                    Help users discover music, talk about artists, suggest songs based 
                    on mood. Keep it casual, fun, and use music emojis!`
        },
        ...history,
        { role: 'user', content: message }
      ],
      model: 'llama-3.3-70b-versatile',
    });

    res.json({ reply: completion.choices[0].message.content });

  } catch (error) {
    console.error('Groq error:', error.message);
    res.status(500).json({ error: "Vibey is having a moment 😅" });
  }
};

module.exports = { chat };