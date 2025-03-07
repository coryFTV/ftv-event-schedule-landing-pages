// Helper functions for the app

// Convert UTC time to Eastern Time
export function convertToEasternTime(utcTimeString) {
  if (!utcTimeString) {
    return { datePart: 'N/A', timePart: 'N/A' };
  }

  try {
    // Handle various date formats
    let utcDate;
    
    // Check if it's a timestamp number (milliseconds since epoch)
    if (!isNaN(Number(utcTimeString))) {
      utcDate = new Date(Number(utcTimeString));
    } else {
      // Try regular date parsing
      utcDate = new Date(utcTimeString);
    }

    // Check if date is valid
    if (isNaN(utcDate.getTime())) {
      console.error('Invalid date format:', utcTimeString);
      return { datePart: 'Invalid Date', timePart: 'Invalid Time' };
    }

    // Format date to match the Mar 7 format
    const dateOptions = {
      timeZone: 'America/New_York',
      month: 'short',
      day: 'numeric',
    };

    // Format time to match 01:00 PM format
    const timeOptions = {
      timeZone: 'America/New_York',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    };

    try {
      // Format date and time separately for better control
      const dateFormatter = new Intl.DateTimeFormat('en-US', dateOptions);
      const timeFormatter = new Intl.DateTimeFormat('en-US', timeOptions);
      
      let datePart = dateFormatter.format(utcDate);
      const timePart = timeFormatter.format(utcDate);
      
      // Remove any trailing period from month abbreviation (e.g., "Mar." -> "Mar")
      datePart = datePart.replace(/\./, '');
      
      return { datePart, timePart };
    } catch (formattingError) {
      console.error('Error formatting date:', formattingError);
      
      // Fallback formatting
      const dateStr = utcDate.toLocaleDateString('en-US', { 
        timeZone: 'America/New_York',
        month: 'short',
        day: 'numeric',
      }).replace(/\./, '');
      
      const timeStr = utcDate.toLocaleTimeString('en-US', { 
        timeZone: 'America/New_York',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });
      
      return { datePart: dateStr, timePart: timeStr };
    }
  } catch (error) {
    console.error('Error in convertToEasternTime:', error, 'for input:', utcTimeString);
    return { datePart: 'Error', timePart: 'Error' };
  }
}

// Function to properly encode special characters in sharedId (but NOT URLs)
export function encodeForURL(input) {
  if (!input) return '';
  return encodeURIComponent(input)
    .replace(/%20/g, '_') // Replace spaces with underscores
    .replace(/%27/g, '') // Remove apostrophes
    .replace(/%2C/g, '') // Remove commas
    .replace(/%3A/g, '') // Remove colons
    .replace(/%28/g, '') // Remove opening parenthesis
    .replace(/%29/g, '') // Remove closing parenthesis
    .replace(/\./g, '') // Remove periods **ONLY in sharedId**
    .replace(/%C3%B3/g, 'ó') // Ensure accented characters remain correct
    .replace(/%C3%AD/g, 'í')
    .replace(/%C3%A9/g, 'é')
    .replace(/%C3%A1/g, 'á');
}

// Function to fetch data from Google Sheets
export async function fetchGoogleSheetsData(sheetId, sheetName, range = 'A1:Z1000') {
  // For development/testing, we can use a proxy service or direct API calls
  // In production, you would use proper authentication and the Google Sheets API

  try {
    // Using the Google Sheets API with a published sheet
    const apiKey = process.env.REACT_APP_GOOGLE_API_KEY || 'YOUR_API_KEY';
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${sheetId}/values/${sheetName}!${range}?key=${apiKey}`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch Google Sheets data: ${response.status}`);
    }

    const data = await response.json();
    return data.values || [];
  } catch (error) {
    console.error('Error fetching Google Sheets data:', error);
    throw error;
  }
}

// Function to filter Google Sheets data similar to QUERY function
export function queryGoogleSheetsData(data, options = {}) {
  if (!data || !Array.isArray(data) || data.length === 0) {
    return [];
  }

  // Extract headers from the first row
  const headers = data[0];

  // Convert the rest of the data to objects with header keys
  let rows = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index] || '';
    });
    return obj;
  });

  // Apply date filtering if specified
  if (options.dateColumn && options.minDate) {
    const minDate = new Date(options.minDate);
    rows = rows.filter(row => {
      const rowDate = new Date(row[options.dateColumn]);
      return !isNaN(rowDate.getTime()) && rowDate >= minDate;
    });
  }

  // Apply additional filters
  if (options.filters && Array.isArray(options.filters)) {
    options.filters.forEach(filter => {
      if (filter.column && filter.value !== undefined) {
        rows = rows.filter(row => {
          if (filter.operator === 'equals') {
            return row[filter.column] === filter.value;
          } else if (filter.operator === 'contains') {
            return row[filter.column].includes(filter.value);
          } else if (filter.operator === 'greaterThan') {
            return row[filter.column] > filter.value;
          } else if (filter.operator === 'lessThan') {
            return row[filter.column] < filter.value;
          }
          return true;
        });
      }
    });
  }

  // Apply sorting
  if (options.sortBy) {
    rows.sort((a, b) => {
      const aValue = a[options.sortBy];
      const bValue = b[options.sortBy];

      if (options.sortDirection === 'desc') {
        return bValue.localeCompare(aValue);
      }
      return aValue.localeCompare(bValue);
    });
  }

  return rows;
}
