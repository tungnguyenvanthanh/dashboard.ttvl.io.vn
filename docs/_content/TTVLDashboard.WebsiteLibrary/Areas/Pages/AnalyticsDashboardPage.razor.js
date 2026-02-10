// ========================================
// LOGGER INITIALIZATION
// ========================================
const log = window.TTVLLogger || {
    info: () => { },
    success: () => { },
    warn: () => { },
    error: () => { }
};

// ========================================
// CHART MANAGEMENT
// ========================================

/**
 * Object lưu trữ tất cả chart instances theo canvas element
 * Key: canvas element reference
 * Value: Chart.js instance
 */
const chartInstances = new Map();

/**
 * Hủy một chart cụ thể
 * @param {HTMLCanvasElement} canvas - Canvas element
 */
function destroyChart(canvas) {
    if (chartInstances.has(canvas)) {
        try {
            const chart = chartInstances.get(canvas);
            chart.destroy();
            chartInstances.delete(canvas);
            log.info(`Chart đã được hủy thành công`);
        } catch (error) {
            log.error(`Lỗi khi hủy chart:`, error);
        }
    }
}

/**
 * Hủy tất cả các chart instances
 */
export function destroyAllCharts() {
    log.info('Đang hủy tất cả charts...');
    
    chartInstances.forEach((chart, canvas) => {
        try {
            chart.destroy();
        } catch (error) {
            log.error(`Lỗi khi hủy chart:`, error);
        }
    });
    
    chartInstances.clear();
    log.success('Đã hủy tất cả charts');
}

// ========================================
// CHART CONFIGURATION HELPERS
// ========================================

/**
 * Cấu hình mặc định cho Line Chart
 * @returns {object} Configuration object cho Chart.js
 */
function getLineChartConfig(labels, data) {
    return {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Lượt xem',
                data: data,
                borderColor: 'rgb(75, 192, 192)',
                backgroundColor: 'rgba(75, 192, 192, 0.2)',
                borderWidth: 3,
                fill: true,
                tension: 0.4, // Smooth curve
                pointRadius: 5,
                pointHoverRadius: 7,
                pointBackgroundColor: 'rgb(75, 192, 192)',
                pointBorderColor: '#fff',
                pointBorderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'top',
                    labels: {
                        font: {
                            size: 14,
                            family: "'Roboto', sans-serif"
                        },
                        padding: 15
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14,
                        family: "'Roboto', sans-serif"
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: true
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            // Format số với dấu phẩy ngăn cách hàng nghìn
                            return value.toLocaleString('vi-VN');
                        },
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            },
            interaction: {
                intersect: false,
                mode: 'index'
            }
        }
    };
}

/**
 * Cấu hình mặc định cho Doughnut Chart
 * @returns {object} Configuration object cho Chart.js
 */
function getDoughnutChartConfig(labels, data) {
    return {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Lượt xem',
                data: data,
                backgroundColor: [
                    'rgba(54, 162, 235, 0.8)',   // Desktop - Blue
                    'rgba(255, 99, 132, 0.8)',   // Mobile - Red
                    'rgba(255, 206, 86, 0.8)'    // Tablet - Yellow
                ],
                borderColor: [
                    'rgba(54, 162, 235, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 206, 86, 1)'
                ],
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: true,
                    position: 'bottom',
                    labels: {
                        font: {
                            size: 13,
                            family: "'Roboto', sans-serif"
                        },
                        padding: 15,
                        generateLabels: function(chart) {
                            const data = chart.data;
                            if (data.labels.length && data.datasets.length) {
                                return data.labels.map((label, i) => {
                                    const value = data.datasets[0].data[i];
                                    const total = data.datasets[0].data.reduce((a, b) => a + b, 0);
                                    const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                                    
                                    return {
                                        text: `${label}: ${value.toLocaleString('vi-VN')} (${percentage}%)`,
                                        fillStyle: data.datasets[0].backgroundColor[i],
                                        hidden: false,
                                        index: i
                                    };
                                });
                            }
                            return [];
                        }
                    }
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14,
                        family: "'Roboto', sans-serif"
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed || 0;
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
                            return `${label}: ${value.toLocaleString('vi-VN')} (${percentage}%)`;
                        }
                    }
                }
            }
        }
    };
}

/**
 * Cấu hình mặc định cho Bar Chart
 * @returns {object} Configuration object cho Chart.js
 */
function getBarChartConfig(labels, data) {
    return {
        type: 'bar',
        data: {
            labels: labels,
            datasets: [{
                label: 'Lượt xem',
                data: data,
                backgroundColor: [
                    'rgba(153, 102, 255, 0.8)',  // Blog - Purple
                    'rgba(54, 162, 235, 0.8)',   // Website - Blue
                    'rgba(75, 192, 192, 0.8)'    // E-Commerce - Teal
                ],
                borderColor: [
                    'rgba(153, 102, 255, 1)',
                    'rgba(54, 162, 235, 1)',
                    'rgba(75, 192, 192, 1)'
                ],
                borderWidth: 2,
                borderRadius: 8,
                borderSkipped: false
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false
                },
                tooltip: {
                    enabled: true,
                    backgroundColor: 'rgba(0, 0, 0, 0.8)',
                    titleFont: {
                        size: 14,
                        family: "'Roboto', sans-serif"
                    },
                    bodyFont: {
                        size: 13
                    },
                    padding: 12,
                    cornerRadius: 8,
                    callbacks: {
                        label: function(context) {
                            const label = context.label || '';
                            const value = context.parsed.y || 0;
                            return `${label}: ${value.toLocaleString('vi-VN')} lượt xem`;
                        }
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toLocaleString('vi-VN');
                        },
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                x: {
                    ticks: {
                        font: {
                            size: 12
                        }
                    },
                    grid: {
                        display: false
                    }
                }
            }
        }
    };
}

// ========================================
// CHART RENDERING FUNCTIONS
// ========================================

/**
 * Render Line Chart (Daily Trends)
 * @param {HTMLCanvasElement} canvasElement - Canvas element từ Blazor ElementReference
 * @param {string[]} labels - Mảng các labels cho trục X
 * @param {number[]} data - Mảng dữ liệu cho chart
 */
export function renderLineChart(canvasElement, labels, data) {
    log.info(`Đang render Line Chart`);
    
    try {
        // Hủy chart cũ nếu tồn tại
        destroyChart(canvasElement);
        
        // Lấy context 2D
        const ctx = canvasElement.getContext('2d');
        
        // Tạo chart mới
        const config = getLineChartConfig(labels, data);
        const chart = new Chart(ctx, config);
        
        // Lưu vào Map
        chartInstances.set(canvasElement, chart);
        
        log.success(`Line Chart đã được render thành công`);
        log.info(`Data points: ${data.length}, Labels: ${labels.join(', ')}`);
    } catch (error) {
        log.error(`Lỗi khi render Line Chart:`, error);
    }
}

/**
 * Render Doughnut Chart (Device Breakdown)
 * @param {HTMLCanvasElement} canvasElement - Canvas element từ Blazor ElementReference
 * @param {string[]} labels - Mảng các labels cho chart
 * @param {number[]} data - Mảng dữ liệu cho chart
 */
export function renderDoughnutChart(canvasElement, labels, data) {
    log.info(`Đang render Doughnut Chart`);
    
    try {
        // Hủy chart cũ nếu tồn tại
        destroyChart(canvasElement);
        
        // Lấy context 2D
        const ctx = canvasElement.getContext('2d');
        
        // Tạo chart mới
        const config = getDoughnutChartConfig(labels, data);
        const chart = new Chart(ctx, config);
        
        // Lưu vào Map
        chartInstances.set(canvasElement, chart);
        
        log.success(`Doughnut Chart đã được render thành công`);
        
        // Log chi tiết dữ liệu
        const total = data.reduce((a, b) => a + b, 0);
        labels.forEach((label, i) => {
            const value = data[i];
            const percentage = total > 0 ? ((value / total) * 100).toFixed(1) : 0;
            log.info(`  - ${label}: ${value.toLocaleString('vi-VN')} (${percentage}%)`);
        });
    } catch (error) {
        log.error(`Lỗi khi render Doughnut Chart:`, error);
    }
}

/**
 * Render Bar Chart (Module Comparison)
 * @param {HTMLCanvasElement} canvasElement - Canvas element từ Blazor ElementReference
 * @param {string[]} labels - Mảng các labels cho trục X
 * @param {number[]} data - Mảng dữ liệu cho chart
 */
export function renderBarChart(canvasElement, labels, data) {
    log.info(`Đang render Bar Chart`);
    
    try {
        // Hủy chart cũ nếu tồn tại
        destroyChart(canvasElement);
        
        // Lấy context 2D
        const ctx = canvasElement.getContext('2d');
        
        // Tạo chart mới
        const config = getBarChartConfig(labels, data);
        const chart = new Chart(ctx, config);
        
        // Lưu vào Map
        chartInstances.set(canvasElement, chart);
        
        log.success(`Bar Chart đã được render thành công`);
        
        // Log chi tiết dữ liệu
        labels.forEach((label, i) => {
            log.info(`  - ${label}: ${data[i].toLocaleString('vi-VN')} lượt xem`);
        });
    } catch (error) {
        log.error(`Lỗi khi render Bar Chart:`, error);
    }
}

// ========================================
// MODULE EXPORTS
// ========================================
export const AnalyticsDashboard = (function () {
    return {
        renderLineChart,
        renderDoughnutChart,
        renderBarChart,
        destroyAllCharts
    }
})();

// Log module loaded
log.success('AnalyticsDashboard module đã được load thành công');