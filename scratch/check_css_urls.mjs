async function check() {
  const html = await (await fetch('http://localhost:3000/')).text();
  const re = /"(\/_next\/[^"]+\.css[^"]*)"/g;
  let match;
  while ((match = re.exec(html)) !== null) {
    console.log('CSS URL:', match[1]);
    const cssText = await (await fetch('http://localhost:3000' + match[1])).text();
    console.log('Has 1280px?', cssText.includes('1280px'));
    console.log('Has site-container?', cssText.includes('site-container'));
  }
  // Check if any script contains site-container
  const scriptRe = /"(\/_next\/static\/chunks\/[^"]+\.js[^"]*)"/g;
  let sMatch;
  while ((sMatch = scriptRe.exec(html)) !== null) {
    const jsText = await (await fetch('http://localhost:3000' + sMatch[1])).text();
    if (jsText.includes('site-container')) {
      console.log('JS Chunk contains site-container:', sMatch[1]);
      if (jsText.includes('1280px')) {
        console.log('ALERT! JS Chunk contains 1280px:');
        const idx = jsText.indexOf('1280px');
        console.log(jsText.substring(Math.max(0, idx - 40), idx + 80));
      }
    }
  }
}
check().catch(console.error);
