import fs from 'fs';

const origFile = fs.readFileSync('app/page.school-backup.tsx', 'utf-8');
const currFile = fs.readFileSync('app/page.tsx', 'utf-8');

// Function to extract text literals inside tags or strings
function extractImportantPhrases(code) {
  const phrases = new Set();
  
  // Match text inside JSX elements >Text<
  const jsxTextMatches = code.matchAll(/>([^<>{}\n\r]+)</g);
  for (const m of jsxTextMatches) {
    const text = m[1].trim();
    if (text.length > 3 && !text.startsWith('//')) {
      phrases.add(text);
    }
  }

  // Match string literals
  const stringMatches = code.matchAll(/["']([^"'\n\r]{4,})["']/g);
  for (const m of stringMatches) {
    const text = m[1].trim();
    if (!text.includes('/') && !text.includes('px') && !text.includes('bg-') && !text.includes('text-')) {
      phrases.add(text);
    }
  }

  return phrases;
}

const origPhrases = extractImportantPhrases(origFile);
let missing = [];

for (const phrase of origPhrases) {
  // Normalize quotes and spaces
  const clean = phrase.replace(/&quot;/g, '"').replace(/\s+/g, ' ');
  if (!currFile.includes(phrase) && !currFile.includes(clean)) {
    // Check if it was a styling class or something internal
    missing.push(phrase);
  }
}

console.log('Original phrases count:', origPhrases.size);
console.log('Missing count:', missing.length);
if (missing.length > 0) {
  console.log('Missing items:', missing);
} else {
  console.log('ALL original content phrases are 100% preserved!');
}
