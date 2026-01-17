# Structura

Structura ist eine Webanwendung die es einem ermöglichen soll, nutzerfreundlich structured outputs für llms zu generieren.

Output formate:

- Freitext (Default) - LLM generiert einen Fließtext ähnlich wie bei ChatGPT
- JSON - LLM generiert mit Rücksicht auf ein vorgegebenes JSON Schema eine JSON Antwort
- Freitext mit Stellen innerhalb derer Text vom LLM eingefügt werden kann (z.B. für Templates)
- Regex - LLM generiert eine Antwort die einem vorgegebenen regulären Ausdruck entspricht

Das UI hat folgenden Workflow:

## Login / Registrierung

Nutzer kann sich registrieren oder einloggen, es gibt nur username und passwort, kein email verifikation etc.

## Auswahl eines LLM-Backends

Nutzer kann zwischen OpenAI, vLLM und ollama wählen. Je nach Auswahl ändert sich das UI leicht (z.B. API Key Eingabe bei OpenAI, Modell-Auswahl bei ollama etc.)

## Hauptseite

- Linke Seitenleiste: Hier sieht der Nutzer vergangene Unterhaltungen. Wie bei ChatGPT soll eine 1 satz summary die Unterhaltung beschreiben. Nutzer kann Unterhaltungen löschen oder umbenennen. Oben in der Seitenleiste gibt es einen Logout-Button.

### Oben im UI
  - Auswahl des LLM-Backends (OpenAI, vLLM, ollama)
  - Auswahl des Output-Formats (Freitext, JSON, Freitext mit Einfügungen, Regex). Beachten, dass nicht jedes LLM-Backend alle Formate unterstützt.
  - Auswahl des LLMs (automatisch via API ermitteln welche LLMs für das gewählte Backend verfügbar sind)
  - Button um Popup zu öffnen um LLM-Parameter zu setzen (z.B. Temperatur, max tokens etc. - je nach Backend unterschiedlich, am besten ermitteln welche Parameter das jeweilige Backend unterstützt)

### Mitte / Ende 

Scrollbarer Chatverlauf der aktuellen Unterhaltung. Jede Nachricht zeigt an ob sie vom Nutzer oder vom LLM stammt. LLM Nachrichten zeigen zusätzlich an welches Backend und Modell verwendet wurde und in welchem Format die Antwort generiert wurde (z.B. JSON, Regex etc.).

### Format-Editor

Hier kann das Output-Format definiert werden. Bei Freitext gibt es nichts zu konfigurieren. 

Bei JSON kann ein JSON Schema eingegeben werden. Hier soll ein nutzerfreundlicher Editor erstellt werden der es auch ohne Programmierkenntnisse ermöglicht ein JSON Schema zu erstellen durch eine nutzefreundliche Baumstruktur. Bei JSON gibt es einen Button um das Schema in die Prompt einzufügen als Hilfestellung für das LLM. Außerdem kann das aktuelle Schema gespeichert werden (z.B. für spätere Unterhaltungen, kommt in Datenbank), das Schema kann beannt werden. Bereits gespeicherte Schemata können geladen, umbenannt und gelöscht werden.

Bei Freitext mit Einfügungen kann mit `[GEN]` gezeigt werden, wo das LLM Text generieren soll. Z.B. `Hallo, mein Name ist [GEN] und ich bin ein [GEN].` Hier gibt es auch einen Button um die aktuelle Vorlage zu speichern (mit Namen) und später wieder zu laden, umbenennen und löschen (ähnlich wie bei JSON Schema).

Bei Regex kann ein regulärer Ausdruck eingegeben werden. Auch hier gibt es die Möglichkeit den Regex zu speichern (mit Namen) und später wieder zu laden, umbenennen und löschen. Der Editor soll das Regex farbig hervorheben und immer anzeigen ob der Regex valide ist oder nicht. Lookbehind und Lookahead sollen verboten sein und als nicht valide angezeigt werden.

Egal ob JSON oder Regex, generierung soll nur möglich sein wenn ein valides Format definiert ist. Bei allen Formaten außer Freitext kann ein Button genutzt werden um das aktuell definierte Format in die Prompt einzufügen als Hilfestellung für das LLM. Die Beschreibung ist dann innerhalb des Prompt-Editors sichtbar und kann vom Nutzer angepasst werden. Sie wird immer am Ende der Prompt angehängt.

### Prompt-Editor

Hier steht ein Textfeld zur Verfügung in dem der Nutzer seine Prompt eingeben kann. Es gibt einen Button um die aktuell definierte Formatierung (JSON Schema, Vorlage mit Einfügungen oder Regex) in die Prompt einzufügen als Hilfestellung für das LLM.

Alle Informationen sollen für jede abgeschickte Prompt gespeichert werden im Backend.

## Backend Informationen

Nutze eine eine einfache SQLite Datenbank um Nutzer, Unterhaltungen und Prompts inkl der dafür verwendeten Parameter und welches Backend für eine Prompt zuvor verwendet wurde etc. zu speichern. Integriere CORS und Swagger UI.

## Frontend Information

Nutze Komponenten, gutes Typescript Typing und sauberen Code. 

## UI Design

Das UI soll modern und minimalistisch sein, ähnlich wie OpenAI, minimalistisch weiß grau und nutze Phosphor Icons für Icons im UI. Für die Farben nutze ein helles Farbschema mit Pastellfarben. Es soll responsiv sein und einen Darkmode geben. Für die Backends, stelle gerne Icons zur Verfügung (z.B. OpenAI Logo für OpenAI Backend etc.). 

