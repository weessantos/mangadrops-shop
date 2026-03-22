import express from "express"
import pool from "../db/database.js"

const router = express.Router()

// =======================
// 📚 GET volumes por série
// =======================
router.get("/:prefix", async (req, res) => {
  try {
    const { prefix } = req.params

    const result = await pool.query(
      `
      SELECT *
      FROM volumes
      WHERE prefix = $1
      ORDER BY number
      `,
      [prefix]
    )

    res.json(result.rows)

  } catch (err) {
    console.error("❌ ERRO GET:", err)
    res.status(500).json({ error: err.message })
  }
})

// =======================
// 🔥 POST criar volume
// =======================
router.post("/", async (req, res) => {
  try {
    const {
      series_prefix,
      title,
      description,
      amazon,
      mercado_livre,
      tiktok,
      added_at
    } = req.body

    // 🔢 pega o próximo número automaticamente
    const last = await pool.query(
      `
      SELECT MAX(number) as max
      FROM volumes
      WHERE prefix = $1
      `,
      [series_prefix]
    )

    const nextNumber = (last.rows[0].max || 0) + 1
    const series = await pool.query(
      `SELECT id FROM series WHERE prefix = $1`,
      [series_prefix]
    )

    if (!series.rows.length) {
      return res.status(400).json({ error: "Série não encontrada" })
    }

    const series_id = series.rows[0].id    
    const result = await pool.query(
      `
      INSERT INTO volumes
      (prefix, series_id, number, title, description, amazon, mercado_livre, tiktok, added_at)
      VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
      RETURNING *
      `,
      [
        series_prefix,
        series_id,      // 🔥 AGORA VAI VIR CORRETO
        nextNumber,
        title,
        description || null,
        amazon || null,
        mercado_livre || null,
        tiktok || null,
        added_at || null
      ]
    )

    res.json(result.rows[0])

  } catch (err) {
    console.error("❌ ERRO POST:", err)
    res.status(500).json({ error: err.message })
  }
})

// =======================
// ✏️ PUT editar volume
// =======================
router.put("/:id", async (req, res) => {
  try {
    console.log("🔥 UPDATE VOLUME:", req.params.id)

    const result = await pool.query(
      `
      UPDATE volumes
      SET
        description = $1,
        tiktok = $2,
        amazon = $3,
        mercado_livre = $4,
        added_at = $5
      WHERE id = $6
      RETURNING *
      `,
      [
        req.body.description || null,
        req.body.tiktok || null,
        req.body.amazon || null,
        req.body.mercado_livre || null,
        req.body.added_at || null,
        req.params.id
      ]
    )

    res.json(result.rows[0])

  } catch (err) {
    console.error("❌ ERRO PUT:", err)
    res.status(500).json({ error: err.message })
  }
})

// =======================
// 🗑 DELETE volume
// =======================
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params

    await pool.query(
      `DELETE FROM volumes WHERE id = $1`,
      [id]
    )

    res.json({ success: true })

  } catch (err) {
    console.error("❌ ERRO DELETE:", err)
    res.status(500).json({ error: err.message })
  }
})

export default router