const express = require("express")
const cors = require("cors")
const fs = require("fs")
const path = require("path")

const app = express()

app.use(cors())
app.use(express.json())

const base = process.cwd()

// caminhos principais

const catalogFile = path.join(
  base,
  "src/data/products/series.catalog.js"
)

const descriptionsDir = path.join(
  base,
  "src/data/products/descriptions"
)

const affiliatesDir = path.join(
  base,
  "src/data/products/affiliates"
)

const tiktokDir = path.join(
  base,
  "src/data/products/tiktok"
)


// ============================
// carregar catálogo
// ============================

async function loadCatalog(){

  const mod = await import("file://" + catalogFile)

  return mod.SERIES

}


// ============================
// carregar descrições
// ============================

async function loadDescriptions(prefix){

  try{

    const mod = await import(
      "file://" +
      path.join(descriptionsDir,`${prefix}.js`)
    )

    return mod[`${prefix}Descriptions`] || {}

  }catch{

    return {}

  }

}


// ============================
// carregar afiliados
// ============================

async function loadAffiliates(prefix){

  try{

    const mod = await import(
      "file://" +
      path.join(affiliatesDir,`${prefix}.js`)
    )

    return mod[`${prefix}Affiliate`] || {}

  }catch{

    return {}

  }

}


// ============================
// carregar tiktok
// ============================

async function loadTiktok(prefix){

  try{

    const mod = await import(
      "file://" +
      path.join(tiktokDir,`${prefix}.js`)
    )

    return mod[`${prefix}Tiktok`] || {}

  }catch{

    return {}

  }

}


// ============================
// listar séries
// ============================

app.get("/series", async (req,res)=>{

  try{

    const SERIES = await loadCatalog()

    res.json(Object.keys(SERIES))

  }catch(e){

    console.error(e)

    res.json([])

  }

})


// ============================
// série completa
// ============================

app.get("/series-full/:prefix", async (req,res)=>{

  const prefix = req.params.prefix

  try{

    const SERIES = await loadCatalog()

    const series = SERIES[prefix]

    if(!series){
      return res.status(404).send({
        error:"Série não encontrada"
      })
    }

    const descriptions = await loadDescriptions(prefix)

    const affiliates = await loadAffiliates(prefix)

    const tiktok = await loadTiktok(prefix)

    res.json({
      series,
      descriptions,
      affiliates,
      tiktok
    })

  }catch(e){

    console.error(e)

    res.status(500).send({
      error:"Erro ao carregar série"
    })

  }

})


// ============================
// salvar descrições
// ============================

app.post("/save-descriptions",(req,res)=>{

  const { prefix, code } = req.body

  const file = path.join(
    descriptionsDir,
    `${prefix}.js`
  )

  fs.writeFileSync(file,code)

  res.send({ok:true})

})


// ============================
// salvar afiliados
// ============================

app.post("/save-affiliates",(req,res)=>{

const {prefix,code} = req.body

const file = path.join(
base,
"src/data/products/affiliates",
`${prefix}.js`
)

fs.writeFileSync(file,code)

updateAffiliateManager(prefix)
updateIndex(prefix)

res.json({ok:true})

})

// ============================
// salvar catálogo
// ============================

app.post("/save-series",(req,res)=>{

  const { prefix, seriesCode } = req.body

  let content = fs.readFileSync(catalogFile,"utf8")

  const regex = new RegExp(
    `${prefix}:\\s*createSeries\\([\\s\\S]*?\\),`
  )

  if(regex.test(content)){

    content = content.replace(regex,seriesCode)

  }else{

    content = content.replace(
      "export const SERIES = {",
      `export const SERIES = {\n${seriesCode}`
    )

  }

  fs.writeFileSync(catalogFile,content)

  res.send({ok:true})

})

// ===============================
// Adicionar novo volume
// ===============================

app.post("/add-volume", (req,res)=>{

const { prefix } = req.body

if(!prefix){
return res.status(400).json({error:"prefix obrigatório"})
}

try{

const catalogPath = path.join(
base,
"src/data/products/series.catalog.js"
)

let catalog = fs.readFileSync(catalogPath,"utf8")

// encontrar end atual
const endRegex = new RegExp(`${prefix}: createSeries\\("[^"]+", \\{([\\s\\S]*?)end:\\s*(\\d+)`)
const match = catalog.match(endRegex)

if(!match){
return res.status(404).json({error:"serie não encontrada"})
}

const currentEnd = parseInt(match[2])
const newEnd = currentEnd + 1

catalog = catalog.replace(
`end: ${currentEnd}`,
`end: ${newEnd}`
)

// data de hoje
const today = new Date().toISOString().slice(0,10)

// procurar addedAtByVolume
if(catalog.includes("makeAddedAtByVolume")){

// converter função para objeto
const obj = []

for(let i=1;i<=currentEnd;i++){
obj.push(`  ${i}: "${today}"`)
}

obj.push(`  ${newEnd}: "${today}"`)

const block = `addedAtByVolume: {\n${obj.join(",\n")}\n}`

catalog = catalog.replace(
/addedAtByVolume:\s*makeAddedAtByVolume\([\s\S]*?\)/,
block
)

}
else{

catalog = catalog.replace(
/addedAtByVolume:\s*\{([\s\S]*?)\}/,
(match,content)=>{
return `addedAtByVolume: {\n${content.trim()},\n  ${newEnd}: "${today}"\n}`
}
)

}

fs.writeFileSync(catalogPath,catalog)


// -----------------------------
// descriptions
// -----------------------------

const descPath = path.join(
base,
`src/data/products/descriptions/${prefix}.js`
)

let desc = fs.readFileSync(descPath,"utf8")

desc = desc.replace(
/};\s*$/,
`  ${newEnd}: "",\n};`
)

fs.writeFileSync(descPath,desc)


// -----------------------------
// affiliates
// -----------------------------

const affPath = path.join(
base,
`src/data/products/affiliates/${prefix}.js`
)

let aff = fs.readFileSync(affPath,"utf8")

aff = aff.replace(
/};\s*$/,
`  ${newEnd}: { mercadoLivre:"", amazon:"" },\n};`
)

fs.writeFileSync(affPath,aff)


// -----------------------------
// tiktok
// -----------------------------

const tkPath = path.join(
base,
`src/data/products/tiktok/${prefix}.js`
)

let tk = fs.readFileSync(tkPath,"utf8")

tk = tk.replace(
/};\s*$/,
`  ${newEnd}: "",\n};`
)

fs.writeFileSync(tkPath,tk)


res.json({
success:true,
volume:newEnd
})

}catch(err){

console.error(err)

res.status(500).json({
error:"erro ao adicionar volume"
})

}

})

//endpoint tiktok

  app.post("/save-tiktok",(req,res)=>{

  const {prefix,code} = req.body

  try{

  const file = path.join(
  base,
  "src/data/products/tiktok",
  `${prefix}.js`
  )

  fs.writeFileSync(file,code)

  res.json({ok:true})

  }catch(err){

  console.error(err)
  res.status(500).json({error:"erro ao salvar tiktok"})

  }

  })

//atualizar affiliates.js (gerenciador)

  function updateAffiliateManager(prefix){

  const file = path.join(
  base,
  "src/data/products/affiliates.js"
  )

  let content = fs.readFileSync(file,"utf8")

  const importLine = `import { ${prefix}Affiliate } from "./affiliates/${prefix}.js"`
  const exportLine = `  ${prefix}Affiliate,`

  if(!content.includes(importLine)){

  content = content.replace(
  "// AFFILIATES (Apenas um gerenciador",
  `// AFFILIATES (Apenas um gerenciador\n${importLine}`
  )

  }

  if(!content.includes(exportLine)){

  content = content.replace(
  "export {",
  `export {\n${exportLine}`
  )

  }

  fs.writeFileSync(file,content)

  }

  //atualizar index

  function updateIndex(prefix){

  const file = path.join(
  base,
  "src/data/products/index.js"
  )

  let content = fs.readFileSync(file,"utf8")

  if(content.includes(`${prefix}: {`)) return

  const block = `
    ${prefix}: {
      affiliate: ${prefix}Affiliate,
      descriptions: ${prefix}Descriptions,
      tiktok: ${prefix}Tiktok,
      price: 47.9
    },
  `

  content = content.replace(
  "const SERIES_DATA = {",
  `const SERIES_DATA = {\n${block}`
  )

  fs.writeFileSync(file,content)

  }



// ================================================================================================================
// ============================
// teste servidor
// ============================

app.get("/",(req,res)=>{

  res.send("Admin server funcionando")

})


// ============================
// iniciar servidor
// ============================

app.listen(3001,()=>{

  console.log(
    "Admin server rodando em http://localhost:3001"
  )

})