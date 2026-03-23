import pkg from "pg";
const { Pool } = pkg;

// 🔵 LOCAL
const localDb = new Pool({
  host: "localhost",
  port: 5432,
  user: "postgres",
  password: "postgres",
  database: "mangadrops",
});

// 🟢 SUPABASE
const remoteDb = new Pool({
  connectionString: "postgresql://postgres.wcwxjqfsnvpyndmpbngr:3826dbpass5651@aws-1-us-east-1.pooler.supabase.com:6543/postgres",
  ssl: { rejectUnauthorized: false }
});

async function migrate() {
  try {
    console.log("🔄 Buscando séries do local...");
    const series = await localDb.query("SELECT * FROM series");

    console.log("📚 Inserindo séries no Supabase...");
    for (const s of series.rows) {
      await remoteDb.query(`
        INSERT INTO series (
          id, prefix, title, total_volumes, thumb, subtitle,
          author, genre, brand, format, edition_label, cover_price
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12
        )
        ON CONFLICT (id) DO NOTHING
      `, [
        s.id, s.prefix, s.title, s.total_volumes, s.thumb, s.subtitle,
        s.author, s.genre, s.brand, s.format, s.edition_label, s.cover_price
      ]);
    }

    console.log("🔄 Buscando volumes do local...");
    const volumes = await localDb.query("SELECT * FROM volumes");

    console.log("📦 Inserindo volumes no Supabase...");
    for (const v of volumes.rows) {
      await remoteDb.query(`
        INSERT INTO volumes (
          id, prefix, title, series_id, number, description,
          tiktok, amazon, mercado_livre, added_at,
          amazon_price, mercado_livre_price, price_updated_at
        ) VALUES (
          $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13
        )
        ON CONFLICT (id) DO NOTHING
      `, [
        v.id, v.prefix, v.title, v.series_id, v.number, v.description,
        v.tiktok, v.amazon, v.mercado_livre, v.added_at,
        v.amazon_price, v.mercado_livre_price, v.price_updated_at
      ]);
    }

    console.log("✅ Migração concluída!");
  } catch (err) {
    console.error("❌ Erro:", err);
  } finally {
    await localDb.end();
    await remoteDb.end();
  }
}

migrate();