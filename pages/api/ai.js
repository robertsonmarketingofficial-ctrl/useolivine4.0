const CALLUM = {
  name: 'Callum Robertson',
  email: 'robertsonmarketingofficial@gmail.com',
  phone: '0405 866 392'
}

function businessCtx(lead) {
  if (!lead) return ''
  return `Business: ${lead.name}
Address: ${lead.address || 'Unknown'}
Phone: ${lead.phone || 'Not listed'}
Website: ${lead.website || 'None'}
Website Status: ${lead.websiteSignal || 'Unknown'}
Rating: ${lead.rating ? `${lead.rating}/5 (${lead.reviewCount} reviews)` : 'Not rated'}
Category: ${lead.category || 'Local business'}`
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })
  const { type, lead, question, leads } = req.body
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return res.status(500).json({ error: 'Gemini API key not configured' })

  let prompt = ''

  if (type === 'research') {
    prompt = `You are a sharp sales research assistant for ${CALLUM.name}, a marketing consultant.
${businessCtx(lead)}
Question: ${question}
Answer concisely and practically. Actionable insights only. Max 200 words.`
  }

  if (type === 'auto_research') {
    prompt = `You are a sales intelligence assistant for ${CALLUM.name}.
${businessCtx(lead)}
Give a quick 3-point sales brief: 1) What opportunity exists here, 2) Best pitch angle, 3) One thing to say to open the conversation. Be specific to this business. Max 150 words total.`
  }

  if (type === 'emails') {
    prompt = `Write two outreach emails for ${CALLUM.name} (${CALLUM.email}, ${CALLUM.phone}).
${businessCtx(lead)}
Rules: Sound human not AI. Concise and confident. Reference something specific. Clear CTA. Include contact info at end.
EMAIL 1 - Website/Marketing pitch: Focus on their ${lead?.websiteSignal || 'online presence'} gap.
EMAIL 2 - General intro: Broader Robertson Marketing intro, angle relevant to their business type.
Format EXACTLY:
---EMAIL1---
Subject: [subject]
[body]
---EMAIL2---
Subject: [subject]
[body]
---END---`
  }

  if (type === 'lovable') {
    prompt = `Create a Lovable.dev website brief for this local business.
${businessCtx(lead)}
Include: business type + target customers, pages needed, design direction (colors/feel), key content per page, specific features (booking/gallery/testimonials), mobile-first requirement.
Make it specific to THIS business. Ready to paste into Lovable.dev.`
  }

  if (type === 'bulk_emails') {
    prompt = `Write a bulk outreach email template for ${CALLUM.name} (${CALLUM.email}, ${CALLUM.phone}).
Use [BUSINESS_NAME] placeholder. Sound personal not mass-email. Focus on local business online marketing. Under 150 words. Strong subject line.
Format:
---EMAIL---
Subject: [subject]
[body with [BUSINESS_NAME]]
---END---`
  }

  if (type === 'quote') {
    prompt = `Generate one short motivational quote for a young sales entrepreneur — either about sales, business, persistence, or success mindset. Make it punchy, real, and energising. 1-2 sentences max. No attribution needed. Just the quote.`
  }

  if (type === 'score_explanation') {
    prompt = `Explain this lead score briefly for ${CALLUM.name}.
${businessCtx(lead)}
Score: ${lead?.score}/99, Tier: ${lead?.tier}
In 3 short bullet points explain: what drove this score up, what the opportunity is, and what to say first. Keep it tight.`
  }

  if (!prompt) return res.status(400).json({ error: 'Invalid type' })

  try {
    const r = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 1500 }
        })
      }
    )
    const data = await r.json()
    if (data.error) return res.status(500).json({ error: data.error.message })
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
    return res.status(200).json({ result: text })
  } catch (err) {
    return res.status(500).json({ error: 'AI request failed' })
  }
}
