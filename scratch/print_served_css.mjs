async function check() {
  const cssText = await (await fetch('http://localhost:3000/_next/static/chunks/%5Broot-of-the-server%5D__1f_tlh1_aci4a._.css')).text();
  const idx = cssText.indexOf('site-container');
  console.log('site-container snippet in served CSS:');
  console.log(cssText.substring(Math.max(0, idx - 40), idx + 300));
}
check().catch(console.error);
