// Dutchie Plus payload verification (recorded pre-cutover step) — probes the
// REAL API to answer every open question the fixtures were built on.
//
// SECURITY: reads keys from .env.local directly and NEVER prints them (only
// presence + length). Read-only GraphQL queries; nothing is mutated.
//
// Usage:  node scripts/dutchie-probe.mjs [step]
//   step "schema"    — introspect the query root (field names, args, types)
//   step "retailers" — what the key can see (retailer ids/names)
//   step "menu"      — sample products with the fields our contract needs
//   default: schema + retailers

import { readFile } from 'node:fs/promises'

const STORE = process.env.PROBE_STORE ?? 'DOWNTOWN_LOS_ANGELES'

const env = Object.fromEntries(
  (await readFile(new URL('../.env.local', import.meta.url), 'utf8'))
    .split('\n')
    .filter((l) => l.includes('=') && !l.trim().startsWith('#'))
    .map((l) => [l.slice(0, l.indexOf('=')).trim(), l.slice(l.indexOf('=') + 1).trim()])
)

const ENDPOINT = env.DUTCHIE_PLUS_ENDPOINT || 'https://plus.dutchie.com/plus/2021-07/graphql'
const KEY = env[`DUTCHIE_PLUS_KEY_${STORE}`]
if (!KEY) {
  console.error(`✗ DUTCHIE_PLUS_KEY_${STORE} is empty in .env.local`)
  process.exit(1)
}
console.log(`endpoint: ${ENDPOINT}`)
console.log(`key ${STORE}: present (${KEY.length} chars)\n`)

async function gql(query, variables = {}, auth = `Bearer ${KEY}`) {
  const res = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json', authorization: auth },
    body: JSON.stringify({ query, variables }),
  })
  const text = await res.text()
  let json
  try { json = JSON.parse(text) } catch { json = null }
  return { status: res.status, json, text: json ? null : text.slice(0, 300) }
}

const step = process.argv[2] ?? 'default'

if (step === 'schema' || step === 'default') {
  const q = `{ __schema { queryType { fields { name args { name type { kind name ofType { kind name } } } type { kind name ofType { kind name } } } } } }`
  let r = await gql(q)
  if (r.status === 401 || r.status === 403) {
    console.log(`Bearer auth → ${r.status}; retrying with raw key header…`)
    r = await gql(q, {}, KEY)
  }
  if (!r.json?.data) {
    console.log('schema probe failed:', r.status, JSON.stringify(r.json?.errors ?? r.text)?.slice(0, 500))
  } else {
    const t = (x) => (x?.name ?? (x?.ofType ? `${x.kind}<${t(x.ofType)}>` : x?.kind))
    for (const f of r.json.data.__schema.queryType.fields) {
      const args = f.args.map((a) => `${a.name}: ${t(a.type)}`).join(', ')
      console.log(`  ${f.name}(${args}) → ${t(f.type)}`)
    }
  }
}

if (step === 'retailers' || step === 'default') {
  for (const [label, auth] of [['Bearer', `Bearer ${KEY}`], ['raw', KEY], ['key header', null]]) {
    const q = `{ retailers { id name address } }`
    const r = auth
      ? await gql(q, {}, auth)
      : await (async () => {
          const res = await fetch(ENDPOINT, {
            method: 'POST',
            headers: { 'content-type': 'application/json', 'x-dutchie-key': KEY },
            body: JSON.stringify({ query: q }),
          })
          return { status: res.status, json: await res.json().catch(() => null) }
        })()
    const out = JSON.stringify(r.json?.data ?? r.json?.errors ?? r.text)?.slice(0, 500)
    console.log(`\nretailers [${label}] →`, r.status, out)
    if (r.json?.data?.retailers) break
  }
}

if (step === 'menu') {
  const retailerId = process.env.PROBE_RETAILER_ID
  if (!retailerId) { console.error('set PROBE_RETAILER_ID'); process.exit(1) }
  const r = await gql(
    `query ($id: ID!) { menu(retailerId: $id) { products {
        id slug name brand { name imageUrl } category subcategory strainType
        potencyThc { formatted range unit } potencyCbd { formatted range unit }
        effects image images description
        variants { id option priceMed priceRec specialPriceMed specialPriceRec quantity }
      } } }`,
    { id: retailerId }
  )
  console.log('menu →', r.status)
  const products = r.json?.data?.menu?.products
  if (!products) {
    console.log(JSON.stringify(r.json?.errors ?? r.text)?.slice(0, 900))
  } else {
    console.log(`products: ${products.length}`)
    console.log(JSON.stringify(products.slice(0, 2), null, 1).slice(0, 2500))
  }
}
