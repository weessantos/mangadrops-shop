import express from "express"
import pool from "../db/database.js"

const router = express.Router()

// 📦 GET /series/full → todas séries + volumes (USO INTERNO)
router.get("/full", async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        s.id,
        s.prefix,
        s.title,
        s.thumb,
        s.subtitle,
        s.author,
        s.genre,
        s.brand,
        s.format,
        s.edition_label,
        s.cover_price,

        COALESCE(
          json_agg(
            json_build_object(
              'id', v.id,
              'number', v.number,
              'amazon', v.amazon,
              'mercadoLivre', v.mercado_livre,
              'description', v.description,
              'tiktok', v.tiktok,

              -- 💰 PREÇOS
              'amazon_price', v.amazon_price,
              'mercado_livre_price', v.mercado_livre_price,
              'price_updated_at', v.price_updated_at,

              -- 💰 BEST PRICE
              'best_price',
                CASE
                  WHEN v.amazon_price IS NOT NULL AND v.mercado_livre_price IS NOT NULL
                    THEN LEAST(v.amazon_price, v.mercado_livre_price)
                  ELSE COALESCE(v.amazon_price, v.mercado_livre_price)
                END,

              -- 🏷️ BEST STORE
              'best_store',
                CASE
                  WHEN v.amazon_price IS NOT NULL
                   AND (v.amazon_price <= v.mercado_livre_price OR v.mercado_livre_price IS NULL)
                    THEN 'amazon'
                  ELSE 'mercado_livre'
                END,

              -- 🔥 DISCOUNT
              'discount',
                CASE
                  WHEN s.cover_price > 0 THEN
                    ROUND(
                      (
                        (
                          s.cover_price -
                          (
                            CASE
                              WHEN v.amazon_price IS NOT NULL AND v.mercado_livre_price IS NOT NULL
                                THEN LEAST(v.amazon_price, v.mercado_livre_price)
                              ELSE COALESCE(v.amazon_price, v.mercado_livre_price)
                            END
                          )
                        )
                        / s.cover_price
                      ) * 100
                    )
                  ELSE 0
                END,

              'addedAt', v.added_at
            )
            ORDER BY v.number
          ) FILTER (WHERE v.id IS NOT NULL),
          '[]'
        ) AS volumes

      FROM series s
      LEFT JOIN volumes v ON s.prefix = v.prefix

      GROUP BY s.id, s.prefix, s.title
      ORDER BY s.title
    `)

    res.json(result.rows)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro ao buscar séries completas" })
  }
})

// 📦 GET /series → lista leve
router.get("/", async (req, res) => {
  const result = await pool.query(`
    SELECT 
      id,
      prefix,
      title,
      thumb,
      total_volumes
    FROM series
    ORDER BY title
  `)

  res.json(result.rows)
})

// 📦 GET /series/:prefix → série + volumes
router.get("/:prefix", async (req, res) => {
  const { prefix } = req.params

  const result = await pool.query(
    `
    SELECT 
      s.*,
      COALESCE(
        json_agg(
          json_build_object(
            'id', v.id,
            'number', v.number,
            'title', v.title,
            'description', v.description,
            'tiktok', v.tiktok,
            'amazon', v.amazon,
            'mercadoLivre', v.mercado_livre,
            'added_at', v.added_at
          )
          ORDER BY v.number
        ) FILTER (WHERE v.id IS NOT NULL),
        '[]'
      ) AS volumes
    FROM series s
    LEFT JOIN volumes v ON s.prefix = v.prefix
    WHERE s.prefix = $1
    GROUP BY s.id
    `,
    [prefix]
  )

  res.json(result.rows[0] || null)
})

// ✏️ PUT /series/:prefix → editar série
router.put("/:prefix", async (req, res) => {
  const { prefix } = req.params
  const {
    title,
    subtitle,
    author,
    genre,
    brand,
    format,
    edition_label,
    cover_price
  } = req.body

  await pool.query(
    `
    UPDATE series
    SET 
      title = $1,
      subtitle = $2,
      author = $3,
      genre = $4,
      brand = $5,
      format = $6,
      edition_label = $7,
      cover_price = $8
    WHERE prefix = $9
    `,
    [
      title,
      subtitle,
      author,
      genre,
      brand,
      format,
      edition_label,
      cover_price,
      prefix
    ]
  )

  res.json({ success: true })
})

// ✏️ POST /series → criar série + volumes
router.post("/", async (req, res) => {
  const {
    title,
    prefix,
    subtitle,
    author,
    genre,
    brand,
    format,
    edition_label,
    cover_price,
    total_volumes
  } = req.body

  try {
    const thumb = `/assets/${prefix.toLowerCase()}-series.webp`
    const safeTotalVolumes = parseInt(total_volumes)

    if (isNaN(safeTotalVolumes)) {
      throw new Error("total_volumes inválido")
    }

    await pool.query(
      `
      INSERT INTO series (
        title,
        prefix,
        subtitle,
        author,
        genre,
        brand,
        format,
        edition_label,
        cover_price,
        total_volumes,
        thumb
      )
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
      `,
      [
        title,
        prefix,
        subtitle,
        author,
        genre,
        brand,
        format,
        edition_label,
        Number(cover_price),
        Number(safeTotalVolumes),
        thumb
      ]
    )

    for (let i = 1; i <= safeTotalVolumes; i++) {
      const num = String(i).padStart(2, "0")
      const volumeTitle = `${title} Vol. ${num}`

      await pool.query(
        `
        INSERT INTO volumes (
          prefix,
          number,
          title,
          description,
          amazon,
          mercado_livre,
          tiktok,
          added_at
        )
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
        `,
        [
          prefix,
          i,
          volumeTitle,
          "",
          "",
          "",
          "",
          new Date().toISOString().split("T")[0]
        ]
      )
    }

    res.json({ success: true })

  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro ao criar série + volumes" })
  }
})

// 🗑 DELETE /series/:prefix
router.delete("/:prefix", async (req, res) => {
  const { prefix } = req.params

  try {
    await pool.query(`DELETE FROM volumes WHERE prefix = $1`, [prefix])
    await pool.query(`DELETE FROM series WHERE prefix = $1`, [prefix])

    res.json({ success: true })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: "Erro ao deletar série" })
  }
})

export default router