export async function loadSeriesData(prefix){

const descriptions = await import(`./descriptions/${prefix}.js`)
const tiktok = await import(`./tiktok/${prefix}.js`)
const affiliates = await import(`./affiliates/${prefix}.js`)

return {
  descriptions: descriptions[`${prefix}Descriptions`],
  tiktok: tiktok[`${prefix}Tiktok`],
  affiliates: affiliates[`${prefix}Affiliate`],
}

}