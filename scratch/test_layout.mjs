const routes = [
  '/',
  '/about',
  '/academics',
  '/admissions',
  '/admissions/fees',
  '/admissions/procedure',
  '/alumni',
  '/contact',
  '/downloads',
  '/events',
  '/facilities',
  '/faculty',
  '/gallery',
  '/notices',
  '/principals-message',
  '/privacy-policy',
  '/results',
  '/vision-mission',
];

async function checkAll() {
  console.log('--- AUDITING RENDERED HTML ACROSS ROUTES ---');
  let allPass = true;

  for (const route of routes) {
    try {
      const res = await fetch(`http://localhost:3000${route}`);
      if (!res.ok) {
        console.error(`FAIL: ${route} returned status ${res.status}`);
        allPass = false;
        continue;
      }
      const text = await res.text();
      const hasSiteContainer = text.includes('site-container');
      const hasHeaderContainer = text.includes('site-container py-3.5') || text.includes('site-container flex');
      
      if (!hasSiteContainer) {
        console.error(`FAIL: ${route} missing .site-container!`);
        allPass = false;
      } else {
        console.log(`PASS: ${route.padEnd(25)} (Status 200, .site-container verified)`);
      }
    } catch (e) {
      console.error(`ERROR: ${route}:`, e.message);
      allPass = false;
    }
  }

  if (allPass) {
    console.log('\nSUCCESS: All 18 public routes verified with .site-container architecture!');
  }
}

checkAll();
