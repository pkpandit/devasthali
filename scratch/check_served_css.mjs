import fs from 'fs';

async function main() {
  const html = await (await fetch('http://localhost:3000/')).text();
  console.log('HTML length:', html.length);
  
  // Find all style tags
  const styles = [...html.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)];
  console.log('Style tags count:', styles.length);
  for (let i = 0; i < styles.length; i++) {
    const s = styles[i][1];
    console.log(`Style tag ${i} length: ${s.length}`);
    if (s.includes('site-container')) {
      console.log('Found site-container in style tag', i);
      const idx = s.indexOf('site-container');
      console.log(s.substring(Math.max(0, idx - 20), idx + 200));
    }
  }

  // Find all script tags or CSS chunks
  const scripts = [...html.matchAll(/src="(\/_next\/[^"]+)"/g)];
  console.log('Script count:', scripts.length);
}

main().catch(console.error);
