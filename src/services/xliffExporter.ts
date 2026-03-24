import { XliffDocument } from '../types/xliff';

/**
 * Export XLIFF document with translations inserted as <target> elements
 */
export function exportXliff(
  document: XliffDocument,
  translations: Map<string, string>
): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(document.rawXml, 'text/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error('Failed to parse original XML for export');
  }

  // Iterate through all file elements
  const fileElements = doc.querySelectorAll('file');

  fileElements.forEach((fileEl) => {
    const fileOriginal = fileEl.getAttribute('original') || '';

    // Get all trans-unit elements within this file
    const transUnitElements = fileEl.querySelectorAll('trans-unit');

    transUnitElements.forEach((tuEl) => {
      const tuId = tuEl.getAttribute('id') || '';
      const compositeId = `${fileOriginal}::${tuId}`;

      const translationText = translations.get(compositeId);

      if (translationText && translationText.trim()) {
        const sourceEl = tuEl.querySelector('source');

        if (sourceEl) {
          // Remove existing target if present
          const existingTarget = tuEl.querySelector('target');
          if (existingTarget) {
            existingTarget.remove();
          }

          // Create new target element with translated content
          // Mirror the structure of source - wrap text in appropriate <g> elements
          const targetEl = createTargetElement(doc, sourceEl, translationText);

          // Insert target after source
          sourceEl.after(targetEl);
        }
      }
    });
  });

  // Serialize back to XML string
  const serializer = new XMLSerializer();
  let xmlString = serializer.serializeToString(doc);

  // Add XML declaration if not present
  if (!xmlString.startsWith('<?xml')) {
    xmlString = '<?xml version="1.0" encoding="UTF-8"?>\n' + xmlString;
  }

  return formatXml(xmlString);
}

/**
 * Create a <target> element mirroring the structure of <source>
 */
function createTargetElement(
  doc: Document,
  sourceEl: Element,
  translationText: string
): Element {
  const targetEl = doc.createElementNS(sourceEl.namespaceURI, 'target');

  // Get the structure template from source
  const sourceStructure = analyzeSourceStructure(sourceEl);

  if (sourceStructure.hasComplexStructure) {
    // If source has complex nested <g> elements, try to mirror the outermost structure
    // but replace the text content
    const clone = sourceEl.cloneNode(true) as Element;
    replaceTextContent(clone, translationText);

    // Move children from clone to target
    while (clone.firstChild) {
      targetEl.appendChild(clone.firstChild);
    }
  } else {
    // Simple case - just set text content
    targetEl.textContent = translationText;
  }

  return targetEl;
}

interface SourceStructure {
  hasComplexStructure: boolean;
  hasGElements: boolean;
}

function analyzeSourceStructure(sourceEl: Element): SourceStructure {
  const gElements = sourceEl.querySelectorAll('g');
  return {
    hasComplexStructure: gElements.length > 0,
    hasGElements: gElements.length > 0,
  };
}

/**
 * Replace all text content in an element tree with new text
 * Preserves structure but updates the text
 */
function replaceTextContent(element: Element, newText: string): void {
  // Find all text nodes and replace with the new text (distributed)
  const textNodes: Text[] = [];
  const walker = document.createTreeWalker(
    element,
    NodeFilter.SHOW_TEXT,
    null
  );

  let node: Text | null;
  while ((node = walker.nextNode() as Text | null)) {
    if (node.textContent?.trim()) {
      textNodes.push(node);
    }
  }

  if (textNodes.length === 0) {
    // No text nodes, append the text directly
    element.textContent = newText;
  } else if (textNodes.length === 1) {
    // Single text node - replace it
    textNodes[0].textContent = newText;
  } else {
    // Multiple text nodes - put all text in the first one, clear others
    textNodes[0].textContent = newText;
    for (let i = 1; i < textNodes.length; i++) {
      textNodes[i].textContent = '';
    }
  }
}

/**
 * Basic XML formatting for readability
 */
function formatXml(xml: string): string {
  // This is a simple formatter - for production use a proper library
  let formatted = '';
  let indent = 0;
  const tab = '  ';

  // Split by tags while preserving content
  const parts = xml.split(/(<[^>]+>)/);

  for (const part of parts) {
    if (!part.trim()) continue;

    if (part.startsWith('</')) {
      // Closing tag - decrease indent first
      indent = Math.max(0, indent - 1);
      formatted += tab.repeat(indent) + part + '\n';
    } else if (part.startsWith('<?') || part.startsWith('<!')) {
      // Declaration or comment
      formatted += part + '\n';
    } else if (part.startsWith('<') && part.endsWith('/>')) {
      // Self-closing tag
      formatted += tab.repeat(indent) + part + '\n';
    } else if (part.startsWith('<')) {
      // Opening tag
      formatted += tab.repeat(indent) + part;
      // Check if next part is content (not a tag)
      indent++;
    } else {
      // Content between tags
      formatted += part;
      // If we added content, don't add newline (will be added by closing tag)
    }
  }

  // Simplified: just return the original for now, proper formatting is complex
  return xml;
}
