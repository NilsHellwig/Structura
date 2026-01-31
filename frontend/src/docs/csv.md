# CSV & HTML Formats

Beyond JSON and Regex, Structura supports generating tabular and stylized data through specialized prompting and formatting logic.

## CSV (Comma Separated Values)

The CSV mode is designed for data extraction, log generation, and spreadsheet preparation.

### How to use
1. Select the **CSV** format in the Header.
2. Define your columns (optional, or let the prompt handle it).
3. The model will be instructed to output *only* raw CSV data.

### Use Cases
- **Data Scraping**: "Extract all names and emails from this text into CSV."
- **Log generation**: "Create a simulated server log for 10 entries."
- **Batch Processing**: Preparing large datasets for Excel or Google Sheets.

## HTML Generation

Structura can also be used to generate structured HTML fragments or full documents.

### Rendering
While Structura primarily displays LLM responses as Markdown, HTML outputs are rendered safely within the chat. You can use this for:
- **Email Templates**: Designing HTML newsletters.
- **UI Mockups**: Generating Tailwind CSS or vanilla HTML/CSS components.
- **Reporting**: Creating stylized tables or summary cards.

### Constraints
When using HTML mode, Structura prepends system instructions to ensure the model focuses on clean, semantic HTML5 without conversational preamble.

---

*Note: For maximum reliability in data extraction, JSON Schema is still the recommended format, but CSV offers a lightweight alternative for simple table-based data.*
