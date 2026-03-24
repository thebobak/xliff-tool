/**
 * File service abstraction layer for file I/O
 * Currently uses browser File API, can be extended for server-side operations
 */

/**
 * Read a file and return its text content
 */
export async function readFile(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result);
      } else {
        reject(new Error('Failed to read file as text'));
      }
    };

    reader.onerror = () => {
      reject(new Error('Error reading file'));
    };

    reader.readAsText(file);
  });
}

/**
 * Download a file to the user's computer
 */
export function downloadFile(content: string, filename: string, mimeType = 'application/xml'): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;

  // Trigger download
  document.body.appendChild(link);
  link.click();

  // Cleanup
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generate export filename based on original filename
 */
export function generateExportFilename(originalFilename: string | null): string {
  if (!originalFilename) {
    return 'translated.xlf';
  }

  // Remove extension and add _translated suffix
  const baseName = originalFilename.replace(/\.(xlf|xliff)$/i, '');
  return `${baseName}_translated.xlf`;
}
