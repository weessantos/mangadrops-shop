const API = "http://localhost:3000/api"

const seriesList = document.getElementById("series-list")
const volumesDiv = document.getElementById("volumes")
let currentSeriesTitle = ""

// =======================
// ➕ BOTÃO NOVA SÉRIE
// =======================
const createSeriesBtn = document.createElement("button")
createSeriesBtn.innerText = "+ Nova Série"
createSeriesBtn.style.marginBottom = "10px"

createSeriesBtn.onclick = openCreateSeries

seriesList.parentNode.insertBefore(createSeriesBtn, seriesList)

// =======================
// 🎨 TOAST BONITO
// =======================
function showToast(msg, type = "success") {
  const toast = document.createElement("div")

  toast.className = `toast ${type}`
  toast.innerText = msg
  toast.style.position = "fixed"
  toast.style.bottom = "20px"
  toast.style.right = "20px"
  toast.style.padding = "12px 16px"
  toast.style.borderRadius = "8px"
  toast.style.color = "white"
  toast.style.fontWeight = "bold"
  toast.style.zIndex = "9999"
  toast.style.boxShadow = "0 0 10px rgba(0,0,0,0.3)"

  if (type === "error") {
    toast.style.background = "#ef4444"
  } else {
    toast.style.background = "#22c55e"
  }

  document.body.appendChild(toast)

  setTimeout(() => {
    toast.style.opacity = "0"
    setTimeout(() => toast.remove(), 300)
  }, 2000)
}

// =======================
// ⏳ LOADING
// =======================
function showLoading() {
  volumesDiv.innerHTML = ""

  for (let i = 0; i < 5; i++) {
    const sk = document.createElement("div")
    sk.className = "skeleton"
    volumesDiv.appendChild(sk)
  }
}

// =======================
// 🐞 DEBUG VISUAL
// =======================
function showDebug(msg) {
  let debug = document.getElementById("debug-box")

  if (!debug) {
    debug = document.createElement("div")
    debug.id = "debug-box"
    setTimeout(() => {
      debug.remove()
    }, 3000)

    Object.assign(debug.style, {
      position: "fixed",
      top: "20px",
      right: "20px",
      width: "300px",
      maxHeight: "300px",
      overflowY: "auto",
      background: "#020617",
      border: "1px solid #1e293b",
      padding: "10px",
      fontSize: "12px",
      zIndex: "9999"
    })

    document.body.appendChild(debug)
  }

  // 🔥 LIMITE DE LINHAS
  if (debug.childElementCount > 8) {
    debug.innerHTML = "" // limpa tudo
  }

  const line = document.createElement("div")
  line.innerText = msg
  line.style.marginBottom = "5px"
  line.style.color = "#38bdf8"

  debug.appendChild(line)
}

// =======================
// 🔥 CARREGAR SÉRIES
// =======================
async function loadSeries() {
  const res = await fetch(`${API}/series`)
  const data = await res.json()

  seriesList.innerHTML = ""

  data.forEach(s => {
    const div = document.createElement("div")
    div.className = "series-item"
    div.textContent = s.title

    div.onclick = () => loadVolumes(s.prefix)

    seriesList.appendChild(div)
  })
}

// =======================
// 🆕 CRIAR NOVA SÉRIE (FORM SIMPLES)
// =======================
async function openCreateSeries() {
  const title = prompt("Nome da série")
  const prefix = prompt("Prefix (ex: OP, JJK)")
  const subtitle = prompt("Subtitle (opcional)") || ""
  const author = prompt("Autor")
  const genre = prompt("Gênero")
  const brand = prompt("Editora")
  const format = prompt("Formato")
  const edition_label = prompt("Edition Label (opcional)") || ""
  const cover_price = prompt("Preço de capa")
  const total_volumes = prompt("Total de volumes")

  if (!title || !prefix || !author) {
    showToast("Preencha os campos obrigatórios", "error")
    return
  }

  await createSeriesRequest({
    title,
    prefix,
    subtitle,
    author,
    genre,
    brand,
    format,
    edition_label,
    cover_price: Number(cover_price),
    total_volumes: Number(total_volumes)
  })
}

// =======================
// 🔥 CARREGAR VOLUMES
// =======================
async function loadVolumes(prefix) {
  showLoading()
  showDebug(`Carregando série: ${prefix}`)

  const res = await fetch(`${API}/series/${prefix}`)
  const data = await res.json()
  currentSeriesTitle = data.title

  volumesDiv.innerHTML = `
    <h1>${data.title}</h1>

    <button onclick="openCreateVolume('${prefix}')">
      + Novo Volume
    </button>

    <button onclick="deleteSeries('${prefix}')"
      style="margin-left:10px;background:#ef4444;">
      🗑 Deletar Série
    </button>
  `

  data.volumes.forEach(v => {
    const div = document.createElement("div")
    div.className = "card"

    div.innerHTML = `
      <h3>${v.title}</h3>

      <label>Descrição</label>
      <textarea id="desc-${v.id}">${v.description || ""}</textarea>

      <label>Amazon</label>
      <input id="amazon-${v.id}" value="${v.amazon || ""}">

      <label>Mercado Livre</label>
      <input id="ml-${v.id}" value="${v.mercado_livre || ""}">

      <label>TikTok</label>
      <input id="tiktok-${v.id}" value="${v.tiktok || ""}">

      <label>Data</label>
      <input type="date" id="date-${v.id}" value="${v.added_at || ""}">

      <button id="btn-${v.id}" onclick="saveVolume(${v.id})">
        💾 Salvar
      </button>

      <button onclick="deleteVolume(${v.id}, '${prefix}')"
        style="margin-left:10px;background:#ef4444;">
        🗑 Excluir
      </button>
    `

    volumesDiv.appendChild(div)
  })
}

// =======================
// 💾 ABRIR PARA CRIAÇÃO DE VOLUME
// =======================
async function openCreateVolume(prefix) {
  try {
    showDebug("Calculando próximo volume...")

    const res = await fetch(`${API}/series/${prefix}`)
    const data = await res.json()

    const volumes = data.volumes || []

    // 🔢 pega último número
    let next = 1

    if (volumes.length > 0) {
      const last = volumes[volumes.length - 1]

      // tenta pegar do campo number (melhor)
      if (last.number) {
        next = last.number + 1
      } else {
        // fallback (caso não tenha number)
        next = volumes.length + 1
      }
    }

    const num = String(next).padStart(2, "0")

    const title = `${data.title} Vol. ${num}`

    showDebug(`Criando ${title}`)

    await createVolume(prefix, title)

  } catch (err) {
    console.error(err)
    showToast("Erro ao gerar volume", "error")
  }
}

// =======================
// 💾 CRIAR VOLUME
// =======================
async function createVolume(prefix, title) {
  try {
    showDebug(`Criando volume ${title}`)

    const res = await fetch(`${API}/volumes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        series_prefix: prefix,
        title,
        description: "",
        amazon: "",
        mercado_livre: "",
        tiktok: "",
        added_at: new Date().toISOString().split("T")[0]
      })
    })

    if (!res.ok) throw new Error("Erro ao criar volume")

    showToast("Volume criado com sucesso!")

    loadVolumes(prefix)

  } catch (err) {
    console.error(err)
    showToast(err.message, "error")
  }
}

// =======================
// 💾 CRIAR SÉRIE
// =======================
async function createSeriesRequest(data) {
  try {
    showDebug(`Criando série: ${data.title}`)

    const res = await fetch(`${API}/series`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(data)
    })

    if (!res.ok) throw new Error("Erro ao criar série")

    showToast("Série criada com sucesso! 🚀")

    loadSeries() // 🔄 recarrega lista

  } catch (err) {
    console.error(err)
    showToast(err.message, "error")
    showDebug(`❌ Erro ao criar série`)
  }
}

// =======================
// 💾 SALVAR VOLUME
// =======================
async function saveVolume(id) {

  const btn = document.getElementById(`btn-${id}`)

  const description = document.getElementById(`desc-${id}`).value
  const amazon = document.getElementById(`amazon-${id}`).value
  const mercado_livre = document.getElementById(`ml-${id}`).value
  const tiktok = document.getElementById(`tiktok-${id}`).value
  const added_at = document.getElementById(`date-${id}`).value

  try {
    // 🔄 estado carregando
    btn.innerText = "⏳ Salvando..."
    btn.disabled = true

    showDebug(`Enviando volume ${id}`)

    const res = await fetch(`${API}/volumes/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        description,
        amazon,
        mercado_livre,
        tiktok,
        added_at
      })
    })

    const data = await res.json()

    if (!res.ok) {
      throw new Error(data.error || "Erro desconhecido")
    }

    showDebug(`✅ Volume ${id} atualizado`)

    // ✅ sucesso
    btn.innerText = "✅ Salvo"
    showToast("Salvo com sucesso!")

    setTimeout(() => {
      btn.innerText = "💾 Salvar"
      btn.disabled = false
    }, 1500)

  } catch (err) {

    console.error(err)

    // ❌ erro
    btn.innerText = "❌ Erro"
    btn.disabled = false

    showToast(err.message, "error")
    showDebug(`❌ Erro: ${err.message}`)
  }
}

// =======================
// 💾 DELETAR VOLUME
// =======================
async function deleteVolume(id, prefix) {
  const confirmDelete = confirm("Tem certeza que deseja excluir?")

  if (!confirmDelete) return

  try {
    const res = await fetch(`${API}/volumes/${id}`, {
      method: "DELETE"
    })

    if (!res.ok) throw new Error("Erro ao deletar")

    showToast("Volume deletado!")

    loadVolumes(prefix)

  } catch (err) {
    console.error(err)
    showToast(err.message, "error")
  }

  // 🔥 atualizar total_volumes automaticamente
  const result = await pool.query(
    `
    SELECT prefix, COUNT(*) as total
    FROM volumes
    WHERE prefix = $1
    GROUP BY prefix
    `,
    [prefix]
  )

  const newTotal = result.rows[0]?.total || 0

  await pool.query(
    `
    UPDATE series
    SET total_volumes = $1
    WHERE prefix = $2
    `,
    [newTotal, prefix]
  )
}

// =======================
// 🗑 DELETAR SÉRIE
// =======================
async function deleteSeries(prefix) {
  const confirmDelete = confirm("Tem certeza que deseja deletar a série inteira?")

  if (!confirmDelete) return

  try {
    const res = await fetch(`${API}/series/${prefix}`, {
      method: "DELETE"
    })

    if (!res.ok) throw new Error("Erro ao deletar série")

    showToast("Série deletada!")

    volumesDiv.innerHTML = ""
    loadSeries()

  } catch (err) {
    console.error(err)
    showToast(err.message, "error")
  }
}

// iniciar
loadSeries()