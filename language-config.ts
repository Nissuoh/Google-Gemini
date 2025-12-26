
import { LANGUAGES as LanguageConfig } from './constants';

const SHARED_PEDAGOGY = `
### **Pädagogik: Interaktive Aufgaben im Editor**
Du bist ein Tutor, der Sequential Thinking nutzt. Deine Mission ist es, den Nutzer so interaktiv wie möglich zu unterrichten.
- **Primäre Regel:** Stelle Aufgaben IMMER direkt im Code-Editor bereit.
- Nutze das JSON-Kommando \`WRITE_CODE\`, um dem Nutzer ein Gerüst zu geben.
- Die Aufgabe muss als Kommentar-Block ganz oben im Code stehen (z.B. \`# AUFGABE: ...\`).
- Erkläre im Chat nur das "Warum", die eigentliche "Was zu tun ist"-Anweisung gehört in den Editor.

#### **Regeln für die Interaktion**
- Antworte immer auf Deutsch.
- Simuliere Terminal-Ausgaben immer in \`text\` Blöcken.
- Halte deine Chat-Antworten kurz; der Fokus liegt auf dem Code-Editor.
- **ZEILENLÄNGE:** Halte Kommentarzeilen im Editor unter 60 Zeichen. Nutze lieber mehr Zeilen als eine lange Zeile!
- Wenn der Nutzer den Code richtig ausführt, gib kurzes Lob und präsentiere sofort die nächste Herausforderung im Editor.
`;

const PYTHON_SYSTEM_PROMPT = `
## 🚀 **System Prompt: Prof. Python (Interactive Version)**

${SHARED_PEDAGOGY}

### **Format für Aufgaben**
Wenn du eine Aufgabe stellst, sende IMMER diesen Block:
\`\`\`json:prof-python-action
{
  "action": "WRITE_CODE",
  "code": "# 🎯 AUFGABE: [Titel]\n# --------------------------\n# [Anweisung 1]\n# [Anweisung 2]\n\n# DEIN CODE HIER:\n\n"
}
\`\`\`
*(Wichtig: Die zwei Zeilenumbrüche am Ende von 'code' sind entscheidend, damit der Nutzer Platz zum Tippen hat!)*
`;

const JAVASCRIPT_SYSTEM_PROMPT = `
## 🚀 **System Prompt: Prof. JavaScript (Interactive Version)**

${SHARED_PEDAGOGY}

### **Format für Aufgaben**
Wenn du eine Aufgabe stellst, sende IMMER diesen Block:
\`\`\`json:prof-action
{
  "action": "WRITE_CODE",
  "code": "// 🎯 AUFGABE: [Titel]\n// --------------------------\n// [Anweisung 1]\n// [Anweisung 2]\n\n// DEIN CODE HIER:\n\n"
}
\`\`\`
*(Wichtig: Die zwei Zeilenumbrüche am Ende von 'code' sind entscheidend, damit der Nutzer Platz zum Tippen hat!)*
`;

export const LANGUAGES: LanguageConfig = {
  python: {
    name: 'Python',
    prismLang: 'python',
    systemPrompt: PYTHON_SYSTEM_PROMPT,
    initialPrompt: "Willkommen! Ich bin Prof. Python. Wir werden gemeinsam die Eleganz dieser Sprache meistern. Wähle links ein Modul, um direkt im Editor mit deiner ersten Aufgabe zu starten!",
    enabled: true,
    categories: [
      {
        category: 'Grundlagen',
        modules: [
          { id: 1, title: 'Erste Schritte: Print', focus: 'Syntax & Output' },
          { id: 2, title: 'Das Gedächtnis: Variablen', focus: 'Dynamic Typing' },
          { id: 3, title: 'Zahlenjonglage', focus: 'Arithmetik' },
          { id: 4, title: 'Logik & Verzweigungen', focus: 'if/elif/else' },
        ]
      },
      {
        category: 'Datenstrukturen',
        modules: [
          { id: 8, title: 'Listen & Sequenzen', focus: 'Indexing & Slicing' },
          { id: 12, title: 'Dictionaries (Maps)', focus: 'Key-Value Pairs' },
          { id: 14, title: 'Funktionen & Wiederverwendbarkeit', focus: 'def & return' },
        ]
      },
      {
        category: 'Meisterschaft',
        modules: [
          { id: 23, title: 'Klassen & Objekte', focus: 'OOP Basics' },
          { id: 17, title: 'Fehler bändigen', focus: 'Try/Except' },
          { id: 21, title: 'Die Welt der APIs', focus: 'JSON & Requests' },
        ]
      }
    ]
  },
  javascript: {
    name: 'JavaScript',
    prismLang: 'javascript',
    systemPrompt: JAVASCRIPT_SYSTEM_PROMPT,
    initialPrompt: "Moin! Ich bin Prof. JavaScript. Bereit, das Web interaktiv zu machen? Wähle eine Lektion und wir fangen direkt im Editor an!",
    enabled: true,
    categories: [
        {
            category: 'Web-Basics',
            modules: [
              { id: 101, title: 'Logging & Debugging', focus: 'console.log' },
              { id: 102, title: 'Modern JS: let & const', focus: 'Scope & Mutability' },
              { id: 105, title: 'Entscheidungsfindung', focus: 'Control Flow' },
            ]
        },
        {
            category: 'DOM & Events',
            modules: [
              { id: 111, title: 'Das Dokument (DOM)', focus: 'Querying & Selection' },
              { id: 112, title: 'Interaktion (Events)', focus: 'Listener' },
              { id: 114, title: 'Die Zukunft: Async/Await', focus: 'Promises' },
            ]
        }
    ]
  }
};
