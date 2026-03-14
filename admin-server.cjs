const express = require("express")
const fs = require("fs")
const path = require("path")

const app = express()

app.use(express.json())

// liberar CORS
app.use((req,res,next)=>{
res.setHeader("Access-Control-Allow-Origin","*")
res.setHeader("Access-Control-Allow-Headers","*")
res.setHeader("Access-Control-Allow-Methods","*")
next()
})

const base = __dirname

const catalogFile = path.join(
base,
"src/data/products/series.catalog.js"
)


// ============================
// salvar series
// ============================

app.post("/save-series",(req,res)=>{

const { prefix, seriesCode } = req.body

let content = fs.readFileSync(catalogFile,"utf8")

// ============================
// evitar duplicação
// ============================

if(content.includes(`${prefix}: {`)){

return res.status(400).send({
error:"Essa série já existe no catálogo"
})

}

// ============================
// adicionar import affiliate
// ============================

content = content.replace(
/import\s*{([\s\S]*?)}\s*from\s*"\.\/affiliates\.js";/,
(match, list)=>{

if(list.includes(`${prefix}Affiliate`)){
return match
}

const newList = list.trim().replace(/,\s*$/,"")

return `import {
  ${newList},
  ${prefix}Affiliate,
} from "./affiliates.js";`

}
)


// ============================
// adicionar import description
// ============================

const descImport = `import { ${prefix}Descriptions } from "./descriptions/${prefix}.js";`

if(!content.includes(descImport)){

content = content.replace(
/(import\s+{[^}]+}\s+from\s+"\.\/*descriptions\/[^"]+\.js";)(?![\s\S]*import\s+{[^}]+}\s+from\s+"\.\/*descriptions\/)/,
`$1\n${descImport}`
)

}


// ============================
// adicionar import tiktok
// ============================

const tiktokImport = `import { ${prefix}Tiktok } from "./tiktok/${prefix}.js";`

if(!content.includes(tiktokImport)){

content = content.replace(
/(import\s+{[^}]+}\s+from\s+"\.\/*tiktok\/[^"]+\.js";)(?![\s\S]*import\s+{[^}]+}\s+from\s+"\.\/*tiktok\/)/,
`$1\n${tiktokImport}`
)

}


// ============================
// inserir série
// ============================

content = content.replace(
"export const SERIES = {",
`export const SERIES = {\n${seriesCode}`
)

fs.writeFileSync(catalogFile,content)

console.log("Series catalog atualizado:", prefix)

res.send({ok:true})

})


// ============================
// salvar descrições
// ============================

app.post("/save-descriptions",(req,res)=>{

const { prefix, code } = req.body

const filePath = path.join(
base,
"src/data/products/descriptions",
`${prefix}.js`
)

fs.writeFileSync(filePath, code)

console.log("Descrições salvas:", prefix)

res.send({ ok:true })

})


// ============================
// salvar afiliados
// ============================

app.post("/save-affiliates",(req,res)=>{

const { code } = req.body

const filePath = path.join(
base,
"src/data/products/affiliates.js"
)

let content = fs.readFileSync(filePath,"utf8")

content += "\n" + code

fs.writeFileSync(filePath, content)

console.log("Affiliate adicionado")

res.send({ ok:true })

})


// ============================
// listar séries existentes
// ============================

app.get("/series",(req,res)=>{

const file = fs.readFileSync(catalogFile,"utf8")

const match = file.match(/\{([\s\S]*)\}/)

if(!match){
return res.json([])
}

const content = match[1]

const regex = /(\w+):\s*\{/g

let result
const series = []

while((result = regex.exec(content)) !== null){

series.push(result[1])

}

res.json(series)

})


// ============================
// abrir série específica
// ============================

app.get("/series/:prefix",(req,res)=>{

const prefix = req.params.prefix

const file = fs.readFileSync(catalogFile,"utf8")

const regex = new RegExp(`${prefix}:\\s*\\{([\\s\\S]*?)\\}`, "m")

const match = file.match(regex)

if(!match){
return res.status(404).send({error:"Série não encontrada"})
}

const block = match[1]

const get = field => {

const r = new RegExp(`${field}:\\s*"([^"]+)"`)
const m = block.match(r)
return m ? m[1] : ""

}

const getNum = field => {

const r = new RegExp(`${field}:\\s*(\\d+)`)
const m = block.match(r)
return m ? parseInt(m[1]) : 0

}

res.send({

prefix,
series: get("series"),
author: get("author"),
genre: get("genre"),
brand: get("brand"),
format: get("format"),
subtitle: get("subtitle"),
start: getNum("start"),
end: getNum("end")

})

})


// ============================
// teste servidor
// ============================

app.get("/",(req,res)=>{
res.send("Admin server funcionando")
})

app.listen(3001,()=>{

console.log("Admin server rodando em http://localhost:3001")

})


// ============================
// SÉRIE COMPLETA
// ============================
app.get("/series-full/:prefix",(req,res)=>{

const prefix = req.params.prefix

const file = fs.readFileSync(catalogFile,"utf8")

const regex = new RegExp(`${prefix}:\\s*\\{([\\s\\S]*?)\\}`, "m")
const match = file.match(regex)

if(!match){
return res.status(404).send({error:"Série não encontrada"})
}

const block = match[1]

// helpers

const get = field => {

const r = new RegExp(`${field}:\\s*"([^"]+)"`)
const m = block.match(r)

return m ? m[1] : ""

}

const getNum = field => {

const r = new RegExp(`${field}:\\s*(\\d+)`)
const m = block.match(r)

return m ? parseInt(m[1]) : 0

}

const series = {

series: get("series"),
prefix: prefix,
author: get("author"),
genre: get("genre"),
brand: get("brand"),
format: get("format"),
subtitle: get("subtitle"),
start: getNum("start"),
end: getNum("end")

}

let descriptions = {}
let affiliates = {}
let tiktok = {}


// ==========================
// DESCRIPTIONS
// ==========================

try{

const descFile = path.join(
base,
"src/data/products/descriptions",
`${prefix}.js`
)

if(fs.existsSync(descFile)){

const content = fs.readFileSync(descFile,"utf8")

const regex = /(\d+):\s*"([\s\S]*?)"/g

let result

while((result = regex.exec(content)) !== null){

descriptions[result[1]] = result[2]

}

}

}catch(e){}


// ==========================
// TIKTOK
// ==========================

try{

const tkFile = path.join(
base,
"src/data/products/tiktok",
`${prefix}.js`
)

if(fs.existsSync(tkFile)){

const content = fs.readFileSync(tkFile,"utf8")

const regex = /(\d+):\s*"([^"]+)"/g

let result

while((result = regex.exec(content)) !== null){

tiktok[result[1]] = result[2]

}

}

}catch(e){}


// ==========================
// AFFILIATES
// ==========================

try{

const affFile = path.join(
base,
"src/data/products/affiliates.js"
)

const content = fs.readFileSync(affFile,"utf8")

const regex = new RegExp(
`export\\s+const\\s+${prefix}Affiliate\\s*=\\s*\\{([\\s\\S]*?)\\}`,
"m"
)

const match = content.match(regex)

if(match){

const block = match[1]

const reg = /(\d+):\s*\{([^}]*)\}/g

let r

while((r = reg.exec(block)) !== null){

const num = r[1]

const inner = r[2]

const amazon = (inner.match(/amazon:\\s*"([^"]*)"/)||[])[1] || ""
const ml = (inner.match(/mercadoLivre:\\s*"([^"]*)"/)||[])[1] || ""

affiliates[num] = {
amazon,
mercadoLivre: ml
}

}

}

}catch(e){}

res.send({
series,
descriptions,
affiliates,
tiktok
})

})