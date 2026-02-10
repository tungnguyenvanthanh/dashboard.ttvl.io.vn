/**
 * Analytics Charts Helper
 * Sử dụng Chart.js để tạo các biểu đồ cho Analytics Dashboard
 */

window.AnalyticsCharts = {
    /**
     * Tạo line chart cho daily trends
     * @param {string} canvasId - ID của canvas element
     * @param {string[]} labels - Danh sách labels (dates)
     * @param {number[]} data - Danh sách data points (views)
     */
    createLineChart: function (canvasId, labels, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas ${canvasId} not found`);
            return;
        }

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if exists
        if (canvas.chart) {
            canvas.chart.destroy();
        }

        // Create new chart
        canvas.chart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Lượt xem',
                    data: data,
                    borderColor: 'rgb(75, 192, 192)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4,
                    fill: true,
                    pointRadius: 4,
                    pointHoverRadius: 6
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
                        mode: 'index',
                        intersect: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });

        console.log(`Line chart created for ${canvasId}`);
    },

    /**
     * Tạo doughnut chart cho device breakdown
     * @param {string} canvasId - ID của canvas element
     * @param {string[]} labels - Danh sách labels (Desktop, Mobile, Tablet)
     * @param {number[]} data - Danh sách data (views per device)
     */
    createDoughnutChart: function (canvasId, labels, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas ${canvasId} not found`);
            return;
        }

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if exists
        if (canvas.chart) {
            canvas.chart.destroy();
        }

        // Create new chart
        canvas.chart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',   // Desktop - Red
                        'rgba(54, 162, 235, 0.8)',   // Mobile - Blue
                        'rgba(255, 206, 86, 0.8)'    // Tablet - Yellow
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
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
                        position: 'bottom',
                        labels: {
                            padding: 15,
                            font: {
                                size: 12
                            }
                        }
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.parsed || 0;
                                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                                const percentage = ((value / total) * 100).toFixed(1);
                                return `${label}: ${value.toLocaleString()} (${percentage}%)`;
                            }
                        }
                    }
                }
            }
        });

        console.log(`Doughnut chart created for ${canvasId}`);
    },

    /**
     * Tạo bar chart cho module comparison
     * @param {string} canvasId - ID của canvas element
     * @param {string[]} labels - Danh sách labels (Blog, Website, ECommerce)
     * @param {number[]} data - Danh sách data (views per module)
     */
    createBarChart: function (canvasId, labels, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) {
            console.warn(`Canvas ${canvasId} not found`);
            return;
        }

        const ctx = canvas.getContext('2d');

        // Destroy existing chart if exists
        if (canvas.chart) {
            canvas.chart.destroy();
        }

        // Create new chart
        canvas.chart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Lượt xem',
                    data: data,
                    backgroundColor: [
                        'rgba(255, 99, 132, 0.8)',
                        'rgba(54, 162, 235, 0.8)',
                        'rgba(255, 206, 86, 0.8)'
                    ],
                    borderColor: [
                        'rgba(255, 99, 132, 1)',
                        'rgba(54, 162, 235, 1)',
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
                        display: false
                    }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        ticks: {
                            callback: function(value) {
                                return value.toLocaleString();
                            }
                        }
                    }
                }
            }
        });

        console.log(`Bar chart created for ${canvasId}`);
    },

    /**
     * Destroy tất cả charts (cleanup)
     */
    destroyAllCharts: function() {
        const canvasElements = document.querySelectorAll('canvas');
        canvasElements.forEach(canvas => {
            if (canvas.chart) {
                canvas.chart.destroy();
                console.log(`Chart destroyed for ${canvas.id}`);
            }
        });
    }
};
