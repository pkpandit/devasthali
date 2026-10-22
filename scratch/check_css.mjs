async function run() {
  const html = await fetch('http://localhost:3000').then(r => r.text());
  const cssMatches = html.match(/href="(\/_next\/static\/[^\"]+\.css)"/g) || [];
  console.log('CSS links in HTML:', cssMatches);
  for (const m of cssMatches) {
    const relativeUrl = m.replace('href="', '').replace('"', '');
    const url = 'http://localhost:3000' + relativeUrl;
    const css = await fetch(url).then(r => r.text());
    console.log('Found .site-container in', relativeUrl, ':', css.includes('site-container'));
    if (css.includes('site-container')) {
      const idx = css.indexOf('site-container');
      console.log('Snippet:', css.substring(idx - 20, idx + 250));
    }
  }
}
run();
