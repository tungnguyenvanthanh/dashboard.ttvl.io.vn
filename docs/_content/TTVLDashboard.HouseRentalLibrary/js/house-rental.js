// House Rental Module - JavaScript Helpers

/**
 * Print a specific element by ID
 * @param {string} elementId - The ID of the element to print
 */
function printElement(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
        console.error('Element not found:', elementId);
        return;
    }

    // Create a new window for printing
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
        console.error('Could not open print window');
        return;
    }

    // Build the print document
    printWindow.document.write(`
        <!DOCTYPE html>
        <html>
        <head>
            <title>In hóa đơn</title>
            <meta charset="UTF-8">
            <style>
                /* Reset styles */
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }
                
                body {
                    font-family: 'Times New Roman', serif;
                    font-size: 14px;
                    line-height: 1.5;
                    color: #000;
                    background: #fff;
                }
                
                /* Print-specific styles */
                @media print {
                    body {
                        -webkit-print-color-adjust: exact;
                        print-color-adjust: exact;
                    }
                    
                    .no-print {
                        display: none !important;
                    }
                }
                
                /* A4 paper size simulation */
                @page {
                    size: A4;
                    margin: 10mm;
                }
                
                /* Table styles */
                table {
                    width: 100%;
                    border-collapse: collapse;
                }
                
                th, td {
                    padding: 8px;
                    text-align: left;
                    border: 1px solid #ddd;
                }
                
                th {
                    background-color: #f5f5f5;
                    font-weight: bold;
                }
                
                .text-right {
                    text-align: right;
                }
                
                .text-center {
                    text-align: center;
                }
                
                .font-weight-bold {
                    font-weight: bold;
                }
                
                .text-success {
                    color: #4caf50;
                }
                
                .text-error {
                    color: #f44336;
                }
                
                .text-warning {
                    color: #ff9800;
                }
            </style>
        </head>
        <body>
            ${element.innerHTML}
        </body>
        </html>
    `);

    printWindow.document.close();

    // Wait for content to load then print
    printWindow.onload = function() {
        printWindow.focus();
        printWindow.print();
        // Close window after printing (optional)
        // printWindow.close();
    };
}

/**
 * Export table to Excel format
 * @param {string} tableId - The ID of the table to export
 * @param {string} filename - The filename for the exported file
 */
function exportTableToExcel(tableId, filename) {
    const table = document.getElementById(tableId);
    if (!table) {
        console.error('Table not found:', tableId);
        return;
    }

    // Convert table to CSV
    let csv = [];
    const rows = table.querySelectorAll('tr');
    
    rows.forEach(row => {
        const cols = row.querySelectorAll('td, th');
        const rowData = [];
        cols.forEach(col => {
            // Clean the text and escape quotes
            let text = col.innerText.replace(/"/g, '""').trim();
            rowData.push(`"${text}"`);
        });
        csv.push(rowData.join(','));
    });

    // Create and download the file
    const csvContent = '\uFEFF' + csv.join('\n'); // BOM for UTF-8
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}.csv`;
    link.click();
    URL.revokeObjectURL(link.href);
}

/**
 * Copy text to clipboard
 * @param {string} text - The text to copy
 */
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        return true;
    } catch (err) {
        console.error('Failed to copy:', err);
        return false;
    }
}

/**
 * Download content as file
 * @param {string} content - The content to download
 * @param {string} filename - The filename
 * @param {string} contentType - The MIME type
 */
function downloadFile(content, filename, contentType) {
    const blob = new Blob([content], { type: contentType });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
    URL.revokeObjectURL(link.href);
}

// Export functions for Blazor interop
window.printElement = printElement;
window.exportTableToExcel = exportTableToExcel;
window.copyToClipboard = copyToClipboard;
window.downloadFile = downloadFile;
