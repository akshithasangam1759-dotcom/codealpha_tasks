const express = require('express');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const router = express.Router();
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

router.post('/chat', async (req, res) => {
  const { messages, system } = req.body;
  try {
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-2.0-flash',
      systemInstruction: system 
    });
    
    const allMapped = messages.slice(0, -1).map(m => ({
  role: m.role === 'assistant' ? 'model' : 'user',
  parts: [{ text: m.content }]
}));

// Gemini requires history to start with 'user'
const firstUserIdx = allMapped.findIndex(m => m.role === 'user');
const history = firstUserIdx >= 0 ? allMapped.slice(firstUserIdx) : [];
    
    const chat = model.startChat({ history });
    const lastMsg = messages[messages.length - 1].content;
    const result = await chat.sendMessage(lastMsg);
    
    res.json({ content: [{ text: result.response.text() }] });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'AI request failed' });
  }
});

module.exports = router;