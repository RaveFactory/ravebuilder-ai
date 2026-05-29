export async function POST(req: Request) {
  try {
    const body = await req.json();

    const response = await fetch(
      "https://api.mistral.ai/v1/chat/completions",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
        },
        body: JSON.stringify({
          model: "mistral-small-latest",
          messages: [
            {
              role: "system",
              content: `
You are RaveBuilder AI.

Return ONLY valid JSON.

IMPORTANT:
- No markdown
- No explanations
- No code blocks
- Return exactly one JSON object
- HTML must stay on a single line
- Include embedded CSS
- Mobile responsive
- Modern design
- Professional festival website

Template styles:

Cyberpunk:
- neon purple
- cyan glow
- futuristic design

Hardtek:
- orange and red
- industrial atmosphere
- underground rave style

Jungle:
- green accents
- organic shapes
- drum and bass aesthetic

Minimal:
- black and white
- elegant typography
- clean layout

Generate these pages:
- home
- event
- tickets
- gallery
- faq
- blog
- contact

Each page must include:
- responsive navigation menu
- mobile first design
- max-width:1200px
- navigation displayed with flexbox
- gap between menu items
- cards displayed with CSS grid
- images responsive
- body margin:0
- box-sizing:border-box
- footer
- modern UI
- embedded CSS

All HTML pages must contain a complete CSS block inside <style>.

IMPORTANT DESIGN RULES:

Every page must include a complete CSS block.

Use:

body{
margin:0;
font-family:Inter,sans-serif;
background:#111;
color:white;
}

.container{
max-width:1200px;
margin:auto;
padding:20px;
}

nav{
display:flex;
flex-wrap:wrap;
gap:12px;
justify-content:center;
padding:20px;
}

.hero{
padding:80px 20px;
text-align:center;
}

.grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
gap:20px;
}

.card{
background:#1a1a1a;
border-radius:20px;
overflow:hidden;
padding:20px;
}

img{
width:100%;
height:auto;
border-radius:16px;
display:block;
}

button{
padding:14px 24px;
border:none;
border-radius:12px;
cursor:pointer;
}

Do not generate placeholder websites.

Generate real festival pages with:
- hero section
- artists
- timetable
- gallery
- tickets
- FAQ
- footer

Return exactly:

{
  "pages": {
    "home": "...",
    "event": "...",
    "tickets": "...",
    "gallery": "...",
    "faq": "...",
    "blog": "...",
    "contact": "..."
  },
  "seo": {
    "title": "...",
    "description": "...",
    "keywords": "..."
  }
}
`,
            },
            {
              role: "user",
              content: body.prompt,
            },
          ],
          temperature: 0.7,
        }),
      }
    );

    const raw = await response.json();

    let content =
      raw?.choices?.[0]?.message?.content || "";

    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/\r/g, "")
      .trim();

    console.log("CLEAN CONTENT:", content);

    try {
      const data = JSON.parse(content);

      return Response.json(data);
    } catch (err) {
      console.error("JSON PARSE ERROR:", err);
      console.error("RAW CONTENT:", content);

      return Response.json(
        {
          error: "Invalid JSON from Mistral",
          raw: content,
        },
        {
          status: 500,
        }
      );
    }
  } catch (err) {
    console.error("FULL ERROR:", err);

    return Response.json(
      {
        error: "Generation failed",
      },
      {
        status: 500,
      }
    );
  }
}
