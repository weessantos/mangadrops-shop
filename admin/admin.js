// ===============================
// Estado central do CMS
// ===============================

const state = {
  series: {
    title: "",
    slug: "",
    prefix: "",
    totalVolumes: 0
  },

  volumes: [],

  affiliates: {},

  tiktok: {}
}

// ===============================
// Navegação entre abas
// ===============================

const tabs = document.querySelectorAll("[data-tab]")
const sections = document.querySelectorAll(".tab")

tabs.forEach(btn => {

  btn.addEventListener("click", () => {

    const tab = btn.dataset.tab

    sections.forEach(sec => sec.style.display = "none")

    document.getElementById("tab-" + tab).style.display = "block"

  })

})


// ===============================
// Gerar volumes automaticamente
// ===============================

function generateVolumes(){

  const title = document.getElementById("series-title").value
  const slug = document.getElementById("series-slug").value
  const prefix = document.getElementById("series-prefix").value
  const total = parseInt(document.getElementById("series-total").value)

  state.series.title = title
  state.series.slug = slug
  state.series.prefix = prefix
  state.series.totalVolumes = total

  state.volumes = []
  state.affiliates = {}
  state.tiktok = {}

  for(let i=1;i<=total;i++){

    const num = String(i).padStart(2,"0")
    const id = `${prefix}-${num}`

    state.volumes.push({
      id: id,
      number: i,
      title: `${title} Vol. ${num}`,
      description: ""
    })

    state.affiliates[id] = {
      amazon:"",
      mercadoLivre:""
    }

    state.tiktok[id] = {
      title:"",
      summary:"",
      caption:""
    }

  }

  renderVolumes()
  renderAffiliates()
  renderTiktok()

}


// ===============================
// Renderizar tabela de volumes
// ===============================

function renderVolumes(){

  const container = document.getElementById("tab-volumes")

  let html = `
  <h2>Volumes</h2>
  <table>
  <tr>
  <th>ID</th>
  <th>Título</th>
  <th>Descrição</th>
  </tr>
  `

  state.volumes.forEach((v,index)=>{

    html += `
    <tr>
      <td>${v.id}</td>

      <td>
        <input value="${v.title}"
        onchange="updateVolumeTitle(${index},this.value)">
      </td>

      <td>
        <textarea
        onchange="updateVolumeDesc(${index},this.value)">${v.description}</textarea>
      </td>

    </tr>
    `

  })

  html += "</table>"

  container.innerHTML = html

}


// ===============================
// Atualizar volume
// ===============================

function updateVolumeTitle(i,value){

  state.volumes[i].title = value

}

function updateVolumeDesc(i,value){

  state.volumes[i].description = value

}

// ===============================
// Carregar séries existentes
// ===============================

async function loadProjectSeries(){

const res = await fetch("http://localhost:3001/series")
const list = await res.json()

const sidebar = document.querySelector(".sidebar")

const title = document.createElement("h3")
title.innerText = "Séries existentes"

sidebar.appendChild(title)

list.forEach(prefix => {

const btn = document.createElement("button")

btn.innerText = prefix

btn.onclick = () => openSeries(prefix)

sidebar.appendChild(btn)

})

}

// ===============================
// Abrir série existente
// ===============================

async function openSeries(prefix){

const res = await fetch(`http://localhost:3001/series-full/${prefix}`)

const data = await res.json()

const s = data.series

document.getElementById("series-title").value = s.series
document.getElementById("series-prefix").value = s.prefix
document.getElementById("series-total").value = s.end

document.getElementById("series-author").value = s.author
document.getElementById("series-genre").value = s.genre
document.getElementById("series-brand").value = s.brand
document.getElementById("series-format").value = s.format
document.getElementById("series-subtitle").value = s.subtitle

state.series.title = s.series
state.series.prefix = s.prefix
state.series.totalVolumes = s.end

generateVolumes()

Object.entries(data.tiktok || {}).forEach(([num,url])=>{

const id = `${prefix}-${String(num).padStart(2,"0")}`

if(state.tiktok[id]){

state.tiktok[id].title = url

}

})

renderTiktok()

// carregar descrições existentes

Object.entries(data.descriptions || {}).forEach(([num,desc])=>{

const volume = state.volumes.find(v => v.number == num)

if(volume){
volume.description = desc
}

})

// carregar afiliados existentes

Object.entries(data.affiliates || {}).forEach(([num,links])=>{

const id = `${prefix}-${String(num).padStart(2,"0")}`

if(state.affiliates[id]){

state.affiliates[id].amazon = links.amazon || ""
state.affiliates[id].mercadoLivre = links.mercadoLivre || ""

}

})

renderVolumes()
renderAffiliates()

}

// ===============================
// Gerar o séries
// ===============================

async function saveSeriesCatalogToProject(){

const prefix = state.series.prefix
const title = state.series.title
const total = state.series.totalVolumes

const brand = document.getElementById("series-brand").value
const author = document.getElementById("series-author").value
const genre = document.getElementById("series-genre").value
const subtitle = document.getElementById("series-subtitle").value
const format = document.getElementById("series-format").value
const thumb = document.getElementById("series-thumb").value
const imageExt = document.getElementById("series-imageExt").value

const today = new Date().toISOString().slice(0,10)

let seriesCode = `
${prefix}: createSeries("${prefix}", {
  series: "${title}",
  end: ${total},
  brand: "${brand}",
  author: "${author}",
  genre: "${genre}",
  subtitle: "${subtitle}",
  format: "${format}",

  addedAtByVolume: makeAddedAtByVolume(1, ${total}, "${today}"),
}),
`

await fetch("http://localhost:3001/save-series",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
prefix,
seriesCode
})

})

alert("Series catalog atualizado!")

}


// ===============================
// Render afiliados
// ===============================

function renderAffiliates(){

  const container = document.getElementById("tab-affiliates")

  let html = `
  <h2>Afiliados</h2>

  <table>
  <tr>
  <th>ID</th>
  <th>Amazon</th>
  <th>Mercado Livre</th>
  </tr>
  `

  state.volumes.forEach(v=>{

    html += `
    <tr>

    <td>${v.id}</td>

    <td>
      <input
      value="${state.affiliates[v.id].amazon}"
      onchange="updateAmazon('${v.id}',this.value)">
    </td>

    <td>
      <input
      value="${state.affiliates[v.id].mercadoLivre}"
      onchange="updateML('${v.id}',this.value)">
    </td>

    </tr>
    `

  })

  html += "</table>"

  html += `
  <button class="action" onclick="saveAffiliatesToProject()">
  Salvar afiliados no projeto
  </button>
  `

  container.innerHTML = html

}

function updateAmazon(id,val){

  state.affiliates[id].amazon = val

}

function updateML(id,val){

  state.affiliates[id].mercadoLivre = val

}


// ===============================
// Render TikTok
// ===============================

function renderTiktok(){

  const container = document.getElementById("tab-tiktok")

  let html = "<h2>TikTok</h2>"

  state.volumes.forEach(v=>{

    html += `

    <div class="tiktok-card">

    <h3>${v.id}</h3>

    <label>Título</label>
    <input
    value="${state.tiktok[v.id].title}"
    onchange="updateTikTokTitle('${v.id}',this.value)">

    <label>Resumo</label>
    <textarea
    onchange="updateTikTokSummary('${v.id}',this.value)">
    ${state.tiktok[v.id].summary}
    </textarea>

    <label>Legenda</label>
    <textarea
    onchange="updateTikTokCaption('${v.id}',this.value)">
    ${state.tiktok[v.id].caption}
    </textarea>

    </div>

    `

  })

  html += `
  <button class="action" onclick="saveTiktokToProject()">
  Salvar TikTok no projeto
  </button>
  `

  container.innerHTML = html

}


function updateTikTokTitle(id,val){

  state.tiktok[id].title = val

}

function updateTikTokSummary(id,val){

  state.tiktok[id].summary = val

}

function updateTikTokCaption(id,val){

  state.tiktok[id].caption = val

}

async function saveTiktokToProject(){

const prefix = state.series.prefix

if(!prefix){
alert("Defina o prefixo da série")
return
}

let code = `export const ${prefix}Tiktok = {\n`

state.volumes.forEach(v => {

code += `  ${v.number}: "",\n`

})

code += `};\n`

console.log("TIKTOK GERADO:")
console.log(code)

await fetch("http://localhost:3001/save-tiktok",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
prefix,
code
})

})

alert("Arquivo TikTok criado no projeto!")

}


// ===============================
// Exportar catálogo
// ===============================

function exportSeriesCatalog(){

  const s = state.series

  const code = `
{
slug: "${s.slug}",
title: "${s.title}",
prefix: "${s.prefix}",
volumes: ${s.totalVolumes}
}
`

  document.getElementById("export-series").textContent = code

}


// ===============================
// Export afiliados
// ===============================

function exportAffiliates(){

  let code = "{\n"

  Object.keys(state.affiliates).forEach(id=>{

    const a = state.affiliates[id]

    code += `
"${id}": {
  amazon: "${a.amazon}",
  mercadoLivre: "${a.mercadoLivre}"
},
`

  })

  code += "}"

  document.getElementById("export-affiliates").textContent = code

}


// ===============================
// Import descrições
// ===============================
function importDescriptions(){

const raw = document.getElementById("descriptions-import").value

if(!raw){
alert("Cole o bloco de descrições")
return
}

// pega tudo dentro das chaves
const match = raw.match(/\{([\s\S]*)\}/)

if(!match){
alert("Formato inválido")
return
}

const content = match[1]

// regex que captura número + texto entre aspas
const regex = /(\d+)\s*:\s*"([\s\S]*?)"/g

let result
let count = 0

while((result = regex.exec(content)) !== null){

const number = parseInt(result[1])
const text = result[2]

const volume = state.volumes.find(v => v.number === number)

if(volume){
volume.description = text
count++
}

}

renderVolumes()

alert(count + " descrições importadas")

}


// ===============================
// Export descrições
// ===============================

function exportDescriptions(){

  const prefix = state.series.prefix

  const varName = prefix + "Descriptions"

  let code = `export const ${varName} = {\n`

  state.volumes.forEach(v => {

    const desc = v.description.replaceAll('"','\\"')

    code += `  ${v.number}: "${desc}",\n`

  })

  code += "};"

  document.getElementById("export-descriptions").textContent = code

}


// ===============================
// Salvar rascunho
// ===============================

function saveDraft(){

  localStorage.setItem(
    "mangadrops-admin",
    JSON.stringify(state)
  )

  alert("Rascunho salvo")

}


// ===============================
// Carregar rascunho
// ===============================

function loadDraft(){

  const data = localStorage.getItem("mangadrops-admin")

  if(!data) return

  const saved = JSON.parse(data)

  Object.assign(state,saved)

  renderVolumes()
  renderAffiliates()
  renderTiktok()

}


// ===============================
// Limpar rascunho
// ===============================

function clearDraft(){

  localStorage.removeItem("mangadrops-admin")

}

// ===============================
// Salvar descrições NO PROJETO
// ===============================


async function saveDescriptionsToProject(){

const prefix = state.series.prefix

if(!prefix){
alert("Defina o prefixo da série")
return
}

// montar código do arquivo
let code = `export const ${prefix}Descriptions = {\n`

state.volumes.forEach(v => {

const desc = (v.description || "").replaceAll('"','\\"')

code += `  ${v.number}: "${desc}",\n`

})

code += "};"

// DEBUG (importante)
console.log("CODIGO GERADO:")
console.log(code)

// enviar para servidor
await fetch("http://localhost:3001/save-descriptions",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
prefix,
code
})

})

alert("Descrições salvas no projeto!")

}

// add volume
async function addVolume(){

const prefix = state.series.prefix

if(!prefix){
alert("Abra uma série primeiro")
return
}

const res = await fetch("http://localhost:3001/add-volume",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({prefix})

})

const data = await res.json()

alert("Novo lançamento criado: Vol " + data.volume)

openSeries(prefix)

}



// ===============================
// Salvar afiliados NO PROJETO
// ===============================

async function saveAffiliatesToProject(){

const prefix = state.series.prefix
const title = state.series.title

if(!prefix){
alert("Defina o prefixo da série")
return
}

if(!title){
alert("Defina o nome da obra")
return
}

// montar bloco de afiliados
let code = `\n// =======================\n`
code += `// ${title.toUpperCase()}\n`
code += `// =======================\n`
code += `export const ${prefix}Affiliate = {\n`

state.volumes.forEach(v => {

const a = state.affiliates[v.id] || {}

code += `  ${v.number}: { mercadoLivre: "${a.mercadoLivre || ""}", amazon: "${a.amazon || ""}" },\n`

})

code += `};\n`

console.log("AFFILIATES GERADO:")
console.log(code)

// enviar para servidor
await fetch("http://localhost:3001/save-affiliates",{

method:"POST",

headers:{
"Content-Type":"application/json"
},

body:JSON.stringify({
code
})

})

alert("Afiliados salvos no projeto!")

}

// ===============================
// Inicializar CMS
// ===============================

window.addEventListener("DOMContentLoaded", () => {

loadProjectSeries()

})