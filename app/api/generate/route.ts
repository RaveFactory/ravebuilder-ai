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
response_format: {
  type: "json_object"
},
max_tokens: 8000,
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

    Generate complete HTML pages.

Return ONLY valid JSON.

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

CRITICAL CONTENT RULES:

Each page must contain completely different content.

Never duplicate:
- sections
- cards
- images
- titles
- artists
- schedules
- paragraphs
- festival descriptions

HOME page:
hero section + festival presentation

EVENT page:
festival details + schedule

TICKETS page:
ticket prices + VIP offers

GALLERY page:
photo gallery only

FAQ page:
questions and answers only

BLOG page:
news articles only

CONTACT page:
contact form + social media

Every page must have unique images.

Never repeat content from another page.

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

IMAGE RULES:

Use ONLY these image search keywords:

concert crowd
festival crowd
hardtek rave
techno festival
dj performing
festival stage
laser show
electronic music crowd
underground rave
hardcore festival

Examples:

https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f
https://images.unsplash.com/photo-1501386761578-eac5c94b800a
https://images.unsplash.com/photo-1514525253161-7a46d19cd819
https://images.unsplash.com/photo-1506157786151-b8491531f063

Forbidden keywords:

student
students
education
school
classroom
teacher
office
business
meeting
university
college

CRITICAL IMAGE VALIDATION:

Before returning HTML, verify every image URL.

If an image is not obviously:

- festival crowd
- concert crowd
- rave
- dj
- stage
- electronic music event
- laser show

DO NOT USE IT.

Fitness images are forbidden.
Sport images are forbidden.
People at work are forbidden.
Office images are forbidden.
Business images are forbidden.

If unsure, use:

https://images.unsplash.com/photo-1501386761578-eac5c94b800a

https://images.unsplash.com/photo-1514525253161-7a46d19cd819

https://images.unsplash.com/photo-1506157786151-b8491531f063

https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f

Reuse these images if necessary.

Never use any image related to education.

Each page must include:
NAVIGATION RULES:

Menu links must use:

data-page="home"
data-page="event"
data-page="tickets"
data-page="gallery"
data-page="faq"
data-page="blog"
data-page="contact"

Do NOT use:

href="home.html"
href="event.html"
href="tickets.html"

Use only data-page attributes.
Every HTML page must contain:

<meta name="viewport" content="width=device-width, initial-scale=1.0">

All HTML pages must contain a complete CSS block inside <style> tags.

MOBILE CSS RULES:

html,body{
margin:0;
padding:0;
width:100%;
overflow-x:hidden;
}

*{
box-sizing:border-box;
}

.container{
width:100%;
max-width:1200px;
margin:auto;
padding:15px;
}

img{
max-width:100%;
height:auto;
display:block;
}

.grid{
display:grid;
grid-template-columns:1fr;
gap:20px;
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

CARD RULES:

Every card must contain:
- image
- title
- description

Never generate:
- empty card
- placeholder card
- duplicate card
- card with only a title
- card with only an image

If content is missing, do not create the card.

Use only CSS Grid or Flexbox.

Images are mandatory in artist cards and gallery cards.

Use only valid Unsplash image URLs.

IMAGE QUALITY RULES:

Every image must be related to:
- festival crowd
- concert crowd
- hardtek rave
- techno festival
- DJ performing
- festival stage
- laser show
- underground rave

Never use:
- students
- school
- classroom
- office
- business
- university
- education
- meeting

If an image is not festival related, choose another image.
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

MANDATORY CSS:

nav{
display:flex;
flex-wrap:wrap;
justify-content:center;
gap:12px;
}

h1{
font-size:clamp(32px,8vw,64px);
}

h2{
font-size:clamp(24px,6vw,42px);
}

h3{
font-size:clamp(18px,5vw,32px);
}

body{
overflow-x:hidden;
}

*{
max-width:100%;
box-sizing:border-box;
}

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
          temperature: 0.3,
        }),
      }
    );

    const raw = await response.json();

    let content =
      raw?.choices?.[0]?.message?.content || "";
    
    console.log("RAW MISTRAL:");
    console.log(content);

    content = content
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .replace(/\r/g, "")
      .trim();

    console.log("CLEAN CONTENT:", content);

    try {
      const data = JSON.parse(content);

const pages = data.pages || {};

Object.keys(pages).forEach((key) => {
  pages[key] = pages[key]

    // images et mots interdits
    .replace(/woman.*fitness/gi, "")
    .replace(/fitness/gi, "")
    .replace(/school/gi, "")
    .replace(/student/gi, "")
    .replace(/classroom/gi, "")

    // liens Instagram vides
    .replace(/<a[^>]*>Instagram<\/a>/gi, "")
    .replace(/Instagram/gi, "")
    .replace(/Consulter Instagram/gi, "")

    // réseaux sociaux vides
    .replace(/RESTEZ CONNECTÉS/gi, "")
    .replace(/Restez connectés/gi, "")

    // iframes générées par erreur
    .replace(/<iframe[\s\S]*?<\/iframe>/gi, "")

    // sections vides
    .replace(/<section>\s*<\/section>/gi, "")
    .replace(/<div>\s*<\/div>/gi, "");
});
Object.keys(pages).forEach((key) => {
  pages[key] = pages[key]

    // supprime les liens html vers des pages inexistantes
    .replace(/<nav[\s\S]*?<\/nav>/gi, "")   
    .replace(/href="home\.html"/gi, 'data-page="home"')
    .replace(/href="event\.html"/gi, 'data-page="event"')
    .replace(/href="tickets\.html"/gi, 'data-page="tickets"')
    .replace(/href="gallery\.html"/gi, 'data-page="gallery"')
    .replace(/href="faq\.html"/gi, 'data-page="faq"')
    .replace(/href="blog\.html"/gi, 'data-page="blog"')
    .replace(/href="contact\.html"/gi, 'data-page="contact"');
});

data.pages = pages;

      return Response.json(data);
    } catch (err) {
      console.error("JSON PARSE ERROR:", err);
      console.error("RAW CONTENT:", content);

      return Response.json(
{
  error: "Mistral returned invalid JSON",
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
