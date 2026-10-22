async function check() {
  const css = await (await fetch('http://localhost:3000/_next/static/chunks/%5Broot-of-the-server%5D__1f_tlh1_aci4a._.css')).text();
  console.log('CSS length:', css.length);
  const matches = [...css.matchAll(/.{0,60}1280px.{0,60}/g)];
  console.log('Matches for 1280px:', matches.length);
  for (const m of matches) {
    console.log('MATCH:', m[0]);
  }
  
  const siteMatches = [...css.matchAll(/.{0,40}\.site-container[\s\S]{0,180}/g)];
  console.log('Matches for site-container:', siteMatches.length);
  for (const m of siteMatches) {
    console.log('SITE CONTAINER RULE:\n', m[0]);
  }
}
check().catch(console.error);
