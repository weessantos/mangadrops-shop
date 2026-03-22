import { seriesCatalog } from "../src/data/products/series.catalog.js"

function run() {

  console.log("🔍 DEBUG CAMPOS EXTRA\n")

  for (const [key, series] of Object.entries(seriesCatalog)) {

    console.log("\n======================")
    console.log(`📦 ${key}`)
    console.log("======================")

    console.log("brand:", series.brand)
    console.log("format:", series.format)
    console.log("editionLabel:", series.editionLabel)
    console.log("coverPrice:", series.coverPrice)
  }
}

run()