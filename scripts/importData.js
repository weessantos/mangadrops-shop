import pool from "../src/db/database.js"
import { SERIES } from "../src/data/products/series.catalog.js"

// 🔥 loader dinâmico
async function loadModule(path) {
  try {
    const mod = await import(path)
    return mod.default || mod[Object.keys(mod)[0]] || {}
  } catch {
    return {}
  }
}

async function run() {

  console.log("🚀 SYNC INICIADO\n")

  for (const [prefix, series] of Object.entries(SERIES)) {

    console.log(`\n📦 Sync: ${prefix} - ${series.series}`)

    const start = series.start || 1
    const end = series.end || 0
    const total = end - start + 1

    if (!total || total <= 0) {
      console.log(`❌ ${prefix} sem volumes válidos`)
      continue
    }

    // 🔥 UPSERT SERIES
    const seriesResult = await pool.query(
      `
      INSERT INTO series 
      (prefix, title, total_volumes, thumb, subtitle, author, genre, brand, format, edition_label, cover_price)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      ON CONFLICT (prefix)
      DO UPDATE SET
        title = EXCLUDED.title,
        total_volumes = EXCLUDED.total_volumes,
        thumb = EXCLUDED.thumb,
        subtitle = EXCLUDED.subtitle,
        author = EXCLUDED.author,
        genre = EXCLUDED.genre,
        brand = EXCLUDED.brand,
        format = EXCLUDED.format,
        edition_label = EXCLUDED.edition_label,
        cover_price = EXCLUDED.cover_price
      RETURNING id
      `,
      [
        prefix,
        series.series,
        total,
        series.thumb,
        series.subtitle,
        series.author,
        series.genre,
        series.brand || null,
        series.format || null,
        series.editionLabel || series.format || null,
        series.coverPrice || null
      ]
    )

    const seriesId = seriesResult.rows[0].id

    // 🔥 carregar dados externos
    const descriptions = await loadModule(`../src/data/products/descriptions/${prefix}.js`)
    const affiliates = await loadModule(`../src/data/products/affiliates/${prefix}.js`)
    const tiktoks = await loadModule(`../src/data/products/tiktok/${prefix}.js`)

    const addedAtMap = series.addedAtByVolume || {}

    // 🔥 remove volumes extras
    await pool.query(
      `DELETE FROM volumes WHERE prefix = $1 AND number > $2`,
      [prefix, end]
    )

    // 📚 loop volumes
    for (let i = start; i <= end; i++) {

      const description = descriptions[i] || null
      const affiliate = affiliates[i] || {}
      const tiktok = tiktoks[i] || null
      const addedAt = addedAtMap[i] || null

      const volumeTitle = `${series.series} Vol. ${String(i).padStart(2, "0")}`

      await pool.query(
        `
        INSERT INTO volumes 
        (series_id, prefix, title, number, description, tiktok, amazon, mercado_livre, added_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
        ON CONFLICT (prefix, number)
        DO UPDATE SET
          title = EXCLUDED.title,
          description = EXCLUDED.description,
          tiktok = EXCLUDED.tiktok,
          amazon = EXCLUDED.amazon,
          mercado_livre = EXCLUDED.mercado_livre,
          added_at = COALESCE(EXCLUDED.added_at, volumes.added_at)
        `,
        [
          seriesId,
          prefix,
          volumeTitle,
          i,
          description,
          tiktok,
          affiliate.amazon || null,
          affiliate.mercadoLivre || null,
          addedAt
        ]
      )
    }

    console.log(`✅ ${prefix} sincronizado (${total} volumes)`)
  }

  console.log("\n🎉 SYNC FINALIZADO")
  process.exit()
}

run()