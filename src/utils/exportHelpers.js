/**
 * Converts an array of objects to a CSV string
 * @param {Array} data - Array of objects to convert
 * @param {Array} headers - Array of header objects with title and key properties
 * @returns {string} - CSV string
 */
export const convertToCSV = (data, headers) => {
  if (!data || !data.length) return '';

  // Create header row
  const headerRow = headers.map(header => `"${header.title}"`).join(',');

  // Create data rows
  const rows = data
    .map(item => {
      return headers
        .map(header => {
          // Get the value for this cell
          const value = item[header.key];

          // Handle different types of values
          if (value === null || value === undefined) return '""';
          if (typeof value === 'string') return `"${value.replace(/"/g, '""')}"`;
          if (typeof value === 'boolean') return value ? '"Yes"' : '"No"';
          if (value instanceof Date) return `"${value.toISOString()}"`;
          return `"${value}"`;
        })
        .join(',');
    })
    .join('\n');

  return `${headerRow}\n${rows}`;
};

/**
 * Downloads a CSV file with the provided data
 * @param {Array} data - Array of objects to convert to CSV
 * @param {Array} headers - Array of header objects with title and key properties
 * @param {string} filename - Name of the file to download
 */
export const downloadCSV = (data, headers, filename) => {
  const csv = convertToCSV(data, headers);

  // Create a blob with the CSV data
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });

  // Create a download link
  const link = document.createElement('a');

  // Create a URL for the blob
  const url = URL.createObjectURL(blob);

  // Set the link's properties
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  // Add the link to the DOM
  document.body.appendChild(link);

  // Click the link to download the file
  link.click();

  // Clean up
  document.body.removeChild(link);
};
