export async function healthProbe(url: string, key: string) {
  const out: Record<string, unknown> = { origin: location.origin, url };
  
  try {
    const a = await fetch(`${url}/auth/v1/health`, { headers: { apikey: key } });
    out.auth = { status: a.status, text: await a.text() };
  } catch (e) { 
    out.auth = { error: String(e) }; 
  }
  
  try {
    const r = await fetch(`${url}/rest/v1/`, { headers: { apikey: key } });
    out.rest = { status: r.status };
  } catch (e) { 
    out.rest = { error: String(e) }; 
  }
  
  console.info('[healthProbe]', out);
  return out;
}