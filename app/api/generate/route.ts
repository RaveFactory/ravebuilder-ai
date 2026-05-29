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

For festival websites use only images of:

- concert crowd
- festival stage
- DJ performing
- hardtek rave
- electronic music event
- laser show
- underground party

Never use images of:

- students
- school
- classroom
- office
- business meeting
- education

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

All HTML pages must contain a complete CSS block inside <MOBILE CSS RULES:

body{
margin:0;
overflow-x:hidden;
max-width:100%;
}

.container{
width:100%;
max-width:1200px;
margin:auto;
padding:20px;
overflow:hidden;
}

*{
box-sizing:border-box;
}

img{
max-width:100%;
height:auto;
display:block;
}

h1,h2,h3,p{
word-break:break-word;
overflow-wrap:break-word;
max-width:100%;
}

.grid{
display:grid;
grid-template-columns:repeat(auto-fit,minmax(280px,1fr));
gap:20px;
width:100%;
}

.card{
width:100%;
overflow:hidden;
}

MOBILE LAYOUT RULES:

Never generate HTML tables.

Do NOT use:
<table>
<tr>
<td>
<thead>
<tbody>

For timetable use:

<div class="schedule">
  <div class="schedule-item">
    <div class="date">...</div>
    <div class="time">...</div>
    <div class="artist">...</div>
  </div>
</div>

Every section must fit mobile screens.

Maximum card height: 500px.

Never generate empty cards.

Never duplicate content.

All cards must contain:
- image
- title
- text

Cards without content are forbidden.

Use only CSS Grid or Flexbox.

Images are mandatory in artist cards and gallery cards.

Use only valid Unsplash image URLs.

Generate realistic festival websites using:
- real city names
- real music genres
- realistic artist names
- realistic timetable
- realistic ticket prices
- realistic venues

Avoid generic marketing sections.

SEO fields are mandatory.

Never return empty values.

Example:

"title":"Hardtek Festival France 2026",
"description":"Festival hardtek underground à Paris",
"keywords":"hardtek, rave, techno, festival"

SEO fields are mandatory.

Never return empty values.

Example:

"title":"Hardtek Festival France 2026",
"description":"Festival hardtek underground à Paris",
"keywords":"hardtek, rave, techno, festival"

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
        status: 200,
      }
    );
  }
}
