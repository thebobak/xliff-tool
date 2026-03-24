/**
 * Converts XLIFF <g ctype="x-html-*"> elements to standard HTML elements
 */

const CTYPE_TO_HTML: Record<string, string> = {
  'x-html-P': 'p',
  'x-html-DIV': 'div',
  'x-html-SPAN': 'span',
  'x-html-STRONG': 'strong',
  'x-html-B': 'b',
  'x-html-EM': 'em',
  'x-html-I': 'i',
  'x-html-U': 'u',
  'x-html-BR': 'br',
  'x-html-UL': 'ul',
  'x-html-OL': 'ol',
  'x-html-LI': 'li',
  'x-html-A': 'a',
  'x-html-H1': 'h1',
  'x-html-H2': 'h2',
  'x-html-H3': 'h3',
  'x-html-H4': 'h4',
  'x-html-H5': 'h5',
  'x-html-H6': 'h6',
  'x-html-BLOCKQUOTE': 'blockquote',
  'x-html-PRE': 'pre',
  'x-html-CODE': 'code',
};

/**
 * Convert XLIFF source content to displayable HTML
 */
export function xliffToHtml(xmlString: string): string {
  const parser = new DOMParser();
  // Wrap in a root element to handle multiple top-level nodes
  const doc = parser.parseFromString(`<root>${xmlString}</root>`, 'text/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    // If parsing fails, return escaped text
    return escapeHtml(xmlString);
  }

  const root = doc.documentElement;
  return processNode(root);
}

function processNode(node: Node): string {
  if (node.nodeType === Node.TEXT_NODE) {
    return escapeHtml(node.textContent || '');
  }

  if (node.nodeType !== Node.ELEMENT_NODE) {
    return '';
  }

  const element = node as Element;
  const tagName = element.tagName.toLowerCase();

  // Handle <g> elements with ctype
  if (tagName === 'g') {
    const ctype = element.getAttribute('ctype');
    const htmlTag = ctype ? CTYPE_TO_HTML[ctype] : null;

    if (htmlTag) {
      const attrs = extractHtmlAttributes(element);
      const attrsStr = attrs.length > 0 ? ' ' + attrs.join(' ') : '';

      // Self-closing tags
      if (htmlTag === 'br') {
        return `<${htmlTag}${attrsStr} />`;
      }

      const children = Array.from(element.childNodes)
        .map(child => processNode(child))
        .join('');

      return `<${htmlTag}${attrsStr}>${children}</${htmlTag}>`;
    }

    // Unknown ctype, just process children
    return Array.from(element.childNodes)
      .map(child => processNode(child))
      .join('');
  }

  // Handle <source> element - process its contents
  if (tagName === 'source') {
    return Array.from(element.childNodes)
      .map(child => processNode(child))
      .join('');
  }

  // Handle root element - process children
  if (tagName === 'root') {
    return Array.from(element.childNodes)
      .map(child => processNode(child))
      .join('');
  }

  // For other elements, just process children
  return Array.from(element.childNodes)
    .map(child => processNode(child))
    .join('');
}

function extractHtmlAttributes(element: Element): string[] {
  const attrs: string[] = [];

  // Extract xhtml:style attribute
  const style = element.getAttributeNS('http://www.w3.org/1999/xhtml', 'style')
    || element.getAttribute('xhtml:style');
  if (style) {
    attrs.push(`style="${escapeAttr(style)}"`);
  }

  // Extract xhtml:href for links
  const href = element.getAttributeNS('http://www.w3.org/1999/xhtml', 'href')
    || element.getAttribute('xhtml:href');
  if (href) {
    attrs.push(`href="${escapeAttr(href)}"`);
    attrs.push('target="_blank"');
    attrs.push('rel="noopener noreferrer"');
  }

  return attrs;
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function escapeAttr(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

/**
 * Extract plain text from XLIFF source content (strips all markup)
 */
export function xliffToPlainText(xmlString: string): string {
  const parser = new DOMParser();
  const doc = parser.parseFromString(`<root>${xmlString}</root>`, 'text/xml');

  const parserError = doc.querySelector('parsererror');
  if (parserError) {
    return xmlString;
  }

  return doc.documentElement.textContent || '';
}
