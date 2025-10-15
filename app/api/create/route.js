export async function POST(req) {
  try {
    const body = await req.json();
    const { serverName, ram } = body || {};
    if (!serverName || typeof ram === 'undefined') {
      return Response.json({ error: 'Missing serverName or ram' }, { status: 400 });
    }

    // ambil token admin dari header
    const adminHeader = req.headers.get('x-admin-token') || '';
    if (!process.env.ADMIN_TOKEN) {
      return Response.json({ error: 'Server not configured (ADMIN_TOKEN missing)' }, { status: 500 });
    }
    if (adminHeader !== process.env.ADMIN_TOKEN) {
      return Response.json({ error: 'Unauthorized (invalid token)' }, { status: 401 });
    }

    // bersihkan nama server agar aman
    const safeName = serverName.toLowerCase().replace(/\s+/g, '').replace(/[^a-z0-9-_]/g, '').slice(0,24);
    const random = Math.random().toString(36).substring(7);
    const email = `${safeName}_${random}@generated.local`;
    const username = `${safeName}_${random}`;
    const password = Math.random().toString(36).slice(-10);

    const base = process.env.PTERO_DOMAIN;  // harus: https://zeroikdarkonly.jkt48-private.com
    const apiKey = process.env.PTERO_KEY;    // harus: ptlc_eXRQL3j6z7BCNDQLOeNMmB6ZvA1kCLtcH8pkzz0fIS5
    if (!base || !apiKey) {
      return Response.json({ error: 'Pterodactyl not configured properly' }, { status: 500 });
    }

    // create user di Pterodactyl
    const userRes = await fetch(`${base}/api/application/users`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        email,
        username,
        first_name: serverName,
        last_name: 'User',
        password,
        root_admin: false
      })
    });

    let userJson;
    try {
      userJson = await userRes.json();
    } catch (err) {
      console.error('⚠️ Gagal parse JSON user:', err);
      const text = await userRes.text();
      console.error('Respons mentah user:', text);
      return Response.json({ error: 'API user tidak merespon JSON valid' }, { status: userRes.status || 500 });
    }
    if (!userRes.ok) {
      return Response.json({
        error: userJson.errors?.[0]?.detail || 'Gagal membuat user'
      }, { status: userRes.status });
    }

    const userId = userJson.attributes.id;

    // buat server
    const memoryValue = parseInt(ram, 10);
    const serverRes = await fetch(`${base}/api/application/servers`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        name: serverName,
        user: userId,
        egg: parseInt(process.env.PTERO_EGG_ID || '1'),
        docker_image: 'ghcr.io/parkervcp/yolks:nodejs_18',
        startup: 'node index.js',
        environment: { CMD_RUN: 'node index.js' },
        limits: {
          memory: isNaN(memoryValue) ? 0 : memoryValue,
          swap: 0,
          disk: parseInt(process.env.PTERO_DISK || '10240'),
          io: 500,
          cpu: parseInt(process.env.PTERO_CPU || '100')
        },
        feature_limits: { databases: 1, allocations: 1, backups: 1 },
        deploy: {
          locations: [parseInt(process.env.PTERO_LOCATION_ID || '1')],
          dedicated_ip: false,
          port_range: []
        }
      })
    });

    let serverJson;
    try {
      serverJson = await serverRes.json();
    } catch (err) {
      console.error('⚠️ Gagal parse JSON server:', err);
      const text = await serverRes.text();
      console.error('Respons mentah server:', text);
      return Response.json({ error: 'API server tidak merespon JSON valid' }, { status: serverRes.status || 500 });
    }
    if (!serverRes.ok) {
      return Response.json({
        error: serverJson.errors?.[0]?.detail || 'Gagal membuat server'
      }, { status: serverRes.status });
    }

    return Response.json({
      success: true,
      email,
      username,
      password,
      server: serverJson.attributes
    });
  } catch (err) {
    console.error('💥 Fatal error route:', err);
    return Response.json({ error: 'Kesalahan internal server' }, { status: 500 });
  }
}
