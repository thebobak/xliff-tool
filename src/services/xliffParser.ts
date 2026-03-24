import { XliffDocument, XliffFile, TransUnit } from '../types/xliff';
import { xliffToHtml, xliffToPlainText } from './contentRenderer';

/**
 * Parse XLIFF 1.2 XML content into internal model
 */
export function parseXliff(xmlString: string): XliffDocument {
  const parser = new DOMParser();
  const doc = parser.parseFromString(xmlString, 'text/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    throw new Error(`Invalid XML: ${parserError.textContent}`);
  }

  const xliffElement = doc.documentElement;
  if (xliffElement.tagName !== 'xliff') {
    throw new Error('Not a valid XLIFF file: root element must be <xliff>');
  }

  const version = xliffElement.getAttribute('version') || '1.2';

  // Get all file elements
  const fileElements = xliffElement.querySelectorAll('file');
  const files: XliffFile[] = [];

  fileElements.forEach((fileEl) => {
    const original = fileEl.getAttribute('original') || '';
    const sourceLanguage = fileEl.getAttribute('source-language') || 'en';

    // Get all trans-unit elements within this file
    const transUnitElements = fileEl.querySelectorAll('trans-unit');
    const transUnits: TransUnit[] = [];

    transUnitElements.forEach((tuEl) => {
      const id = tuEl.getAttribute('id') || '';
      const sourceEl = tuEl.querySelector('source');
      const targetEl = tuEl.querySelector('target');

      if (sourceEl) {
        // Get the inner XML of <source> element
        const sourceInnerXml = getInnerXml(sourceEl);
        const sourceHtml = xliffToHtml(sourceInnerXml);

        const transUnit: TransUnit = {
          id: `${original}::${id}`,  // Combine file original + trans-unit id for uniqueness
          source: sourceInnerXml,
          sourceHtml,
          fileId: original,
          fileName: original,
        };

        // If there's already a target, capture it
        if (targetEl) {
          transUnit.target = getInnerXml(targetEl);
          transUnit.targetText = xliffToPlainText(transUnit.target);
        }

        transUnits.push(transUnit);
      }
    });

    files.push({
      original,
      sourceLanguage,
      transUnits,
    });
  });

  return {
    version,
    files,
    rawXml: xmlString,
  };
}

/**
 * Get the inner XML content of an element (preserving child elements)
 */
function getInnerXml(element: Element): string {
  const serializer = new XMLSerializer();
  let result = '';

  for (let i = 0; i < element.childNodes.length; i++) {
    const node = element.childNodes[i];
    if (node.nodeType === Node.TEXT_NODE) {
      result += node.textContent;
    } else {
      result += serializer.serializeToString(node);
    }
  }

  return result;
}

/**
 * Get total count of translation units
 */
export function getTotalTransUnits(document: XliffDocument): number {
  return document.files.reduce((sum, file) => sum + file.transUnits.length, 0);
}

/**
 * Get all translation units as a flat array
 */
export function getAllTransUnits(document: XliffDocument): TransUnit[] {
  return document.files.flatMap(file => file.transUnits);
}
