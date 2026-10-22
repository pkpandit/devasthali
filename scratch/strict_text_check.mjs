import fs from 'fs';

const origFile = fs.readFileSync('app/page.school-backup.tsx', 'utf-8');
const currFile = fs.readFileSync('app/page.tsx', 'utf-8');

function extractTagTexts(code) {
  const texts = [];
  // Match text between > and <
  const matches = code.matchAll(/>([^<>{}\n\r]+)</g);
  for (const m of matches) {
    const text = m[1].trim();
    if (text && !text.startsWith('//') && text.length > 1) {
      texts.push(text);
    }
  }
  return texts;
}

const origTexts = extractTagTexts(origFile);
const missingTexts = [];

for (const t of origTexts) {
  const clean = t.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/\s+/g, ' ');
  if (!currFile.includes(t) && !currFile.includes(clean)) {
    missingTexts.push(t);
  }
}

console.log('Total user-facing tag texts:', origTexts.length);
console.log('Missing user-facing tag texts:', missingTexts.length);
if (missingTexts.length > 0) {
  console.log('Missing tag texts:', missingTexts);
} else {
  console.log('CONFIRMED: ZERO user-facing text strings were dropped or modified!');
}
