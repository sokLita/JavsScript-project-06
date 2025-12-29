// detailed-analytics.js - Advanced Analytics & Forecasting Dashboard

document.addEventListener('DOMContentLoaded', function() {
    // Initialize all components
    initializeAnalyticsDashboard();
    setupCharts();
    setupEventListeners();
    loadPerformanceData();
    loadInsights();
    updateDashboardControls();
});

// Global variables
let charts = {
    salesChart: null,
    stockChart: null,
    categoryChart: null,
    turnoverChart: null,
    forecastChart: null
};

let performanceData = [];
let insightsData = [];
let currentTimeRange = 30;
let currentCategory = 'all';
let currentForecastModel = 'seasonal';
let currentForecastPeriod = 30;

// Sample data for demonstration
const sampleSalesData = [
    { date: '2024-02-01', sales: 820, orders: 15 },
    { date: '2024-02-02', sales: 932, orders: 17 },
    { date: '2024-02-03', sales: 901, orders: 16 },
    { date: '2024-02-04', sales: 934, orders: 18 },
    { date: '2024-02-05', sales: 1290, orders: 22 },
    { date: '2024-02-06', sales: 1330, orders: 24 },
    { date: '2024-02-07', sales: 1320, orders: 23 },
    { date: '2024-02-08', sales: 820, orders: 15 },
    { date: '2024-02-09', sales: 932, orders: 17 },
    { date: '2024-02-10', sales: 901, orders: 16 },
    { date: '2024-02-11', sales: 934, orders: 18 },
    { date: '2024-02-12', sales: 1290, orders: 22 },
    { date: '2024-02-13', sales: 1330, orders: 24 },
    { date: '2024-02-14', sales: 1320, orders: 23 },
    { date: '2024-02-15', sales: 1420, orders: 26 },
    { date: '2024-02-16', sales: 1532, orders: 28 },
    { date: '2024-02-17', sales: 1401, orders: 25 },
    { date: '2024-02-18', sales: 1534, orders: 27 },
    { date: '2024-02-19', sales: 1690, orders: 30 },
    { date: '2024-02-20', sales: 1730, orders: 32 },
    { date: '2024-02-21', sales: 1820, orders: 34 },
    { date: '2024-02-22', sales: 1920, orders: 36 },
    { date: '2024-02-23', sales: 1832, orders: 33 },
    { date: '2024-02-24', sales: 1901, orders: 35 },
    { date: '2024-02-25', sales: 1934, orders: 36 },
    { date: '2024-02-26', sales: 2090, orders: 38 },
    { date: '2024-02-27', sales: 2130, orders: 40 },
    { date: '2024-02-28', sales: 2220, orders: 42 },
    { date: '2024-02-29', sales: 2320, orders: 44 },
    { date: '2024-03-01', sales: 2420, orders: 46 }
];

const sampleStockData = [
    { date: '2024-02-01', electronics: 120, accessories: 85, office: 45, furniture: 25 },
    { date: '2024-02-08', electronics: 115, accessories: 78, office: 42, furniture: 24 },
    { date: '2024-02-15', electronics: 105, accessories: 72, office: 40, furniture: 23 },
    { date: '2024-02-22', electronics: 98, accessories: 65, office: 38, furniture: 22 },
    { date: '2024-02-29', electronics: 85, accessories: 58, office: 35, furniture: 20 }
];

const sampleCategoryData = [
    { category: 'Electronics', value: 42, color: '#4A90E2' },
    { category: 'Accessories', value: 28, color: '#50E3C2' },
    { category: 'Office Supplies', value: 18, color: '#F5A623' },
    { category: 'Furniture', value: 12, color: '#B8E986' }
];

const sampleTurnoverData = [
    { product: 'Laptop Dell', turnover: 4.2 },
    { product: 'Mouse Logitech', turnover: 8.5 },
    { product: 'Keyboard Mechanical', turnover: 6.3 },
    { product: 'Monitor 27"', turnover: 3.8 },
    { product: 'Webcam HD', turnover: 7.2 },
    { product: 'Desk Chair', turnover: 2.5 },
    { product: 'Office Desk', turnover: 1.8 },
    { product: 'Printer', turnover: 3.2 }
];

// Initialize analytics dashboard
function initializeAnalyticsDashboard() {
    // Load any saved settings from localStorage
    loadDashboardSettings();
    
    // Update KPI cards with real data if available
    updateKPICards();
}

// Load dashboard settings from localStorage
function loadDashboardSettings() {
    const savedTimeRange = localStorage.getItem('analyticsTimeRange');
    const savedCategory = localStorage.getItem('analyticsCategory');
    const savedForecastModel = localStorage.getItem('analyticsForecastModel');
    
    if (savedTimeRange) {
        currentTimeRange = parseInt(savedTimeRange);
        document.getElementById('timeRange').value = savedTimeRange;
    }
    
    if (savedCategory) {
        currentCategory = savedCategory;
        document.getElementById('categoryFilter').value = savedCategory;
    }
    
    if (savedForecastModel) {
        currentForecastModel = savedForecastModel;
        document.getElementById('forecastModel').value = savedForecastModel;
    }
}

// Save dashboard settings to localStorage
function saveDashboardSettings() {
    localStorage.setItem('analyticsTimeRange', currentTimeRange);
    localStorage.setItem('analyticsCategory', currentCategory);
    localStorage.setItem('analyticsForecastModel', currentForecastModel);
}

// Setup charts
function setupCharts() {
    // Initialize Sales Trend Chart
    const salesCtx = document.getElementById('salesChart').getContext('2d');
    charts.salesChart = new Chart(salesCtx, {
        type: 'line',
        data: {
            labels: sampleSalesData.map(d => d.date),
            datasets: [{
                label: 'Sales Revenue ($)',
                data: sampleSalesData.map(d => d.sales),
                borderColor: '#4A90E2',
                backgroundColor: 'rgba(74, 144, 226, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4
            }, {
                label: 'Number of Orders',
                data: sampleSalesData.map(d => d.orders),
                borderColor: '#50E3C2',
                backgroundColor: 'rgba(80, 227, 194, 0.1)',
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                yAxisID: 'y1'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            interaction: {
                mode: 'index',
                intersect: false,
            },
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM d'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Sales Revenue ($)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                },
                y1: {
                    beginAtZero: true,
                    position: 'right',
                    title: {
                        display: true,
                        text: 'Number of Orders'
                    },
                    grid: {
                        drawOnChartArea: false
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                tooltip: {
                    mode: 'index',
                    intersect: false
                }
            }
        }
    });

    // Initialize Stock Level Chart
    const stockCtx = document.getElementById('stockChart').getContext('2d');
    charts.stockChart = new Chart(stockCtx, {
        type: 'line',
        data: {
            labels: sampleStockData.map(d => d.date),
            datasets: [
                {
                    label: 'Electronics',
                    data: sampleStockData.map(d => d.electronics),
                    borderColor: '#4A90E2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Accessories',
                    data: sampleStockData.map(d => d.accessories),
                    borderColor: '#50E3C2',
                    backgroundColor: 'rgba(80, 227, 194, 0.1)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Office Supplies',
                    data: sampleStockData.map(d => d.office),
                    borderColor: '#F5A623',
                    backgroundColor: 'rgba(245, 166, 35, 0.1)',
                    borderWidth: 2,
                    fill: true
                },
                {
                    label: 'Furniture',
                    data: sampleStockData.map(d => d.furniture),
                    borderColor: '#B8E986',
                    backgroundColor: 'rgba(184, 233, 134, 0.1)',
                    borderWidth: 2,
                    fill: true
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'week',
                        displayFormats: {
                            week: 'MMM d'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Stock Level (Units)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                }
            }
        }
    });

    // Initialize Category Performance Chart
    const categoryCtx = document.getElementById('categoryChart').getContext('2d');
    charts.categoryChart = new Chart(categoryCtx, {
        type: 'doughnut',
        data: {
            labels: sampleCategoryData.map(d => d.category),
            datasets: [{
                data: sampleCategoryData.map(d => d.value),
                backgroundColor: sampleCategoryData.map(d => d.color),
                borderWidth: 1,
                borderColor: '#fff'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '70%',
            plugins: {
                legend: {
                    position: 'right',
                    labels: {
                        padding: 20,
                        usePointStyle: true,
                    }
                },
                tooltip: {
                    callbacks: {
                        label: function(context) {
                            return `${context.label}: ${context.parsed}%`;
                        }
                    }
                }
            }
        }
    });

    // Initialize Turnover Chart
    const turnoverCtx = document.getElementById('turnoverChart').getContext('2d');
    charts.turnoverChart = new Chart(turnoverCtx, {
        type: 'bar',
        data: {
            labels: sampleTurnoverData.map(d => d.product),
            datasets: [{
                label: 'Turnover Rate (x)',
                data: sampleTurnoverData.map(d => d.turnover),
                backgroundColor: '#4A90E2',
                borderColor: '#357ABD',
                borderWidth: 1,
                borderRadius: 4,
                maxBarThickness: 40
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Turnover Rate (x per year)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            plugins: {
                legend: {
                    display: false
                }
            }
        }
    });

    // Initialize Forecast Chart
    setupForecastChart();
}

// Setup forecast chart
function setupForecastChart() {
    const forecastCtx = document.getElementById('forecastChart').getContext('2d');
    
    // Generate forecast data
    const { historicalData, forecastData } = generateForecastData(currentForecastPeriod, currentForecastModel);
    
    charts.forecastChart = new Chart(forecastCtx, {
        type: 'line',
        data: {
            labels: [...historicalData.labels, ...forecastData.labels],
            datasets: [
                {
                    label: 'Historical Sales',
                    data: [...historicalData.values, ...Array(forecastData.values.length).fill(null)],
                    borderColor: '#4A90E2',
                    backgroundColor: 'rgba(74, 144, 226, 0.1)',
                    borderWidth: 2,
                    fill: false
                },
                {
                    label: 'Forecast',
                    data: [...Array(historicalData.values.length).fill(null), ...forecastData.values],
                    borderColor: '#50E3C2',
                    backgroundColor: 'rgba(80, 227, 194, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false
                },
                {
                    label: 'Confidence Interval (95%)',
                    data: [...Array(historicalData.values.length).fill(null), ...forecastData.confidenceUpper],
                    borderColor: 'rgba(80, 227, 194, 0.3)',
                    backgroundColor: 'rgba(80, 227, 194, 0.1)',
                    borderWidth: 1,
                    fill: '+1',
                    pointRadius: 0
                },
                {
                    label: '',
                    data: [...Array(historicalData.values.length).fill(null), ...forecastData.confidenceLower],
                    borderColor: 'rgba(80, 227, 194, 0.3)',
                    backgroundColor: 'rgba(80, 227, 194, 0.1)',
                    borderWidth: 1,
                    fill: false,
                    pointRadius: 0
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            scales: {
                x: {
                    type: 'time',
                    time: {
                        unit: 'day',
                        displayFormats: {
                            day: 'MMM d'
                        }
                    },
                    grid: {
                        display: false
                    }
                },
                y: {
                    beginAtZero: true,
                    title: {
                        display: true,
                        text: 'Sales Revenue ($)'
                    },
                    grid: {
                        color: 'rgba(0, 0, 0, 0.05)'
                    }
                }
            },
            plugins: {
                legend: {
                    position: 'top',
                },
                annotation: {
                    annotations: {
                        line1: {
                            type: 'line',
                            xMin: historicalData.labels[historicalData.labels.length - 1],
                            xMax: historicalData.labels[historicalData.labels.length - 1],
                            borderColor: 'rgba(0, 0, 0, 0.3)',
                            borderWidth: 2,
                            borderDash: [5, 5],
                            label: {
                                display: true,
                                content: 'Forecast Start',
                                position: 'top'
                            }
                        }
                    }
                }
            }
        }
    });
}

// Generate forecast data
function generateForecastData(period, model) {
    // Get last 30 days of historical data
    const historicalDays = 30;
    const historicalLabels = [];
    const historicalValues = [];
    
    for (let i = historicalDays; i > 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        historicalLabels.push(date.toISOString().split('T')[0]);
        
        // Generate realistic sales data with trend and seasonality
        const baseSales = 1000;
        const trend = 15 * i; // Increasing trend
        const seasonality = 200 * Math.sin(i * 0.2); // Weekly seasonality
        const noise = Math.random() * 100 - 50; // Random noise
        
        historicalValues.push(baseSales + trend + seasonality + noise);
    }
    
    // Generate forecast based on model
    const forecastLabels = [];
    const forecastValues = [];
    const confidenceUpper = [];
    const confidenceLower = [];
    
    let lastValue = historicalValues[historicalValues.length - 1];
    let trend = (historicalValues[historicalValues.length - 1] - historicalValues[0]) / historicalDays;
    
    for (let i = 1; i <= period; i++) {
        const date = new Date();
        date.setDate(date.getDate() + i);
        forecastLabels.push(date.toISOString().split('T')[0]);
        
        let forecastValue;
        let confidenceRange;
        
        switch(model) {
            case 'linear':
                forecastValue = lastValue + trend + (Math.random() * 50 - 25);
                confidenceRange = 80 + i * 2;
                break;
            case 'seasonal':
                // ARIMA-like seasonal model
                const seasonalComponent = 150 * Math.sin(i * 0.2);
                forecastValue = lastValue + trend * 0.8 + seasonalComponent + (Math.random() * 40 - 20);
                confidenceRange = 70 + i * 1.5;
                break;
            case 'exponential':
                // Exponential smoothing
                forecastValue = lastValue * 1.02 + trend * 0.5 + (Math.random() * 60 - 30);
                confidenceRange = 90 + i * 2.5;
                break;
            default:
                forecastValue = lastValue + trend + (Math.random() * 50 - 25);
                confidenceRange = 80 + i * 2;
        }
        
        forecastValues.push(Math.max(0, forecastValue));
        confidenceUpper.push(Math.max(0, forecastValue + confidenceRange));
        confidenceLower.push(Math.max(0, forecastValue - confidenceRange));
        
        lastValue = forecastValue;
    }
    
    return {
        historicalData: {
            labels: historicalLabels,
            values: historicalValues
        },
        forecastData: {
            labels: forecastLabels,
            values: forecastValues,
            confidenceUpper: confidenceUpper,
            confidenceLower: confidenceLower
        }
    };
}

// Setup event listeners
function setupEventListeners() {
    // Time range selector
    document.getElementById('timeRange').addEventListener('change', function(e) {
        currentTimeRange = parseInt(e.target.value);
        saveDashboardSettings();
        updateCharts();
    });
    
    // Category filter
    document.getElementById('categoryFilter').addEventListener('change', function(e) {
        currentCategory = e.target.value;
        saveDashboardSettings();
        updateCharts();
    });
    
    // Forecast model
    document.getElementById('forecastModel').addEventListener('change', function(e) {
        currentForecastModel = e.target.value;
        saveDashboardSettings();
        updateForecast();
    });
    
    // Forecast period buttons
    document.querySelectorAll('.forecast-period-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.forecast-period-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const period = parseInt(this.textContent);
            setForecastPeriod(period);
        });
    });
    
    // Export report button
    document.querySelector('.btn-apply[onclick="exportAnalytics()"]').addEventListener('click', exportAnalytics);
    
    // Refresh data button
    document.querySelector('.btn-apply[onclick="refreshData()"]').addEventListener('click', refreshData);
    
    // Sort performance table button
    document.querySelector('.btn-apply[onclick="sortPerformanceTable(\'revenue\')"]').addEventListener('click', () => sortPerformanceTable('revenue'));
    
    // Generate insights button
    document.querySelector('.btn-apply[onclick="generateNewInsights()"]').addEventListener('click', generateNewInsights);
    
    // Setup sidebar navigation
    setupSidebarNavigation();
}

// Update charts based on filters
function updateCharts() {
    // In a real application, this would fetch new data from the server
    // For now, we'll simulate filtering
    
    console.log(`Updating charts with timeRange: ${currentTimeRange}, category: ${currentCategory}`);
    
    // Update sales chart
    updateSalesChart();
    
    // Update stock chart
    updateStockChart();
    
    // Update category chart
    updateCategoryChart();
    
    // Update turnover chart
    updateTurnoverChart();
    
    // Show notification
    showNotification(`Charts updated for ${currentTimeRange} days`, 'success');
}

// Update sales chart
function updateSalesChart() {
    // Filter sales data based on time range
    const filteredData = sampleSalesData.slice(-currentTimeRange);
    
    charts.salesChart.data.labels = filteredData.map(d => d.date);
    charts.salesChart.data.datasets[0].data = filteredData.map(d => d.sales);
    charts.salesChart.data.datasets[1].data = filteredData.map(d => d.orders);
    
    // Update time unit based on range
    let timeUnit = 'day';
    if (currentTimeRange > 90) timeUnit = 'week';
    if (currentTimeRange > 180) timeUnit = 'month';
    
    charts.salesChart.options.scales.x.time.unit = timeUnit;
    charts.salesChart.update();
}

// Update stock chart
function updateStockChart() {
    // Filter stock data based on category
    let filteredData = sampleStockData;
    
    if (currentCategory !== 'all') {
        // In a real app, we would filter the dataset
        // For demo, we'll just show a subset
        filteredData = sampleStockData.slice(0, 3);
    }
    
    charts.stockChart.data.labels = filteredData.map(d => d.date);
    charts.stockChart.update();
}

// Update category chart
function updateCategoryChart() {
    // In a real app, we would fetch new category data
    // For demo, we'll keep the same data but recalculate percentages
    charts.categoryChart.update();
}

// Update turnover chart
function updateTurnoverChart() {
    // Filter turnover data based on category
    let filteredData = sampleTurnoverData;
    
    if (currentCategory !== 'all') {
        // Filter by category (simplified for demo)
        if (currentCategory === 'electronics') {
            filteredData = sampleTurnoverData.filter(d => 
                d.product.includes('Laptop') || 
                d.product.includes('Monitor') || 
                d.product.includes('Printer')
            );
        } else if (currentCategory === 'accessories') {
            filteredData = sampleTurnoverData.filter(d => 
                d.product.includes('Mouse') || 
                d.product.includes('Keyboard') || 
                d.product.includes('Webcam')
            );
        } else if (currentCategory === 'office') {
            filteredData = sampleTurnoverData.filter(d => 
                d.product.includes('Chair') || 
                d.product.includes('Desk')
            );
        }
    }
    
    charts.turnoverChart.data.labels = filteredData.map(d => d.product);
    charts.turnoverChart.data.datasets[0].data = filteredData.map(d => d.turnover);
    charts.turnoverChart.update();
}

// Update forecast
function updateForecast() {
    if (charts.forecastChart) {
        charts.forecastChart.destroy();
    }
    
    setupForecastChart();
    showNotification(`Forecast model updated to ${currentForecastModel}`, 'success');
}

// Set forecast period
function setForecastPeriod(period) {
    currentForecastPeriod = period;
    updateForecast();
    showNotification(`Forecast period set to ${period} days`, 'success');
}

// Load performance data
function loadPerformanceData() {
    performanceData = [
        {
            product: 'Laptop Dell',
            category: 'Electronics',
            stockLevel: 85,
            monthlySales: 12,
            turnoverRate: 4.2,
            forecast: 14,
            trend: 'up'
        },
        {
            product: 'Mouse Logitech',
            category: 'Accessories',
            stockLevel: 58,
            monthlySales: 45,
            turnoverRate: 8.5,
            forecast: 52,
            trend: 'up'
        },
        {
            product: 'Keyboard Mechanical',
            category: 'Accessories',
            stockLevel: 72,
            monthlySales: 28,
            turnoverRate: 6.3,
            forecast: 32,
            trend: 'up'
        },
        {
            product: 'Monitor 27"',
            category: 'Electronics',
            stockLevel: 42,
            monthlySales: 8,
            turnoverRate: 3.8,
            forecast: 9,
            trend: 'stable'
        },
        {
            product: 'Webcam HD',
            category: 'Electronics',
            stockLevel: 95,
            monthlySales: 32,
            turnoverRate: 7.2,
            forecast: 38,
            trend: 'up'
        },
        {
            product: 'Desk Chair',
            category: 'Furniture',
            stockLevel: 38,
            monthlySales: 6,
            turnoverRate: 2.5,
            forecast: 7,
            trend: 'stable'
        },
        {
            product: 'Office Desk',
            category: 'Furniture',
            stockLevel: 25,
            monthlySales: 4,
            turnoverRate: 1.8,
            forecast: 5,
            trend: 'down'
        },
        {
            product: 'Printer',
            category: 'Electronics',
            stockLevel: 65,
            monthlySales: 9,
            turnoverRate: 3.2,
            forecast: 10,
            trend: 'stable'
        }
    ];
    
    renderPerformanceTable();
}

// Render performance table
function renderPerformanceTable() {
    const tableBody = document.getElementById('performanceTableBody');
    
    tableBody.innerHTML = performanceData.map(item => `
        <tr>
            <td class="product-cell">
                <div class="product-info">
                    <div class="product-name">${item.product}</div>
                    <div class="product-code">SKU: ${item.product.split(' ')[0].substring(0,2).toUpperCase()}-${Math.floor(Math.random() * 1000)}</div>
                </div>
            </td>
            <td>
                <span class="category-badge category-${item.category.toLowerCase().replace(/\s+/g, '-')}">
                    ${item.category}
                </span>
            </td>
            <td>
                <div class="stock-level">
                    <div class="stock-bar">
                        <div class="stock-fill" style="width: ${item.stockLevel}%"></div>
                    </div>
                    <span class="stock-value">${item.stockLevel}%</span>
                </div>
            </td>
            <td class="sales-cell">
                <div class="sales-value">$${(item.monthlySales * 250).toLocaleString()}</div>
                <div class="sales-units">${item.monthlySales} units</div>
            </td>
            <td>
                <div class="turnover-rate ${item.turnoverRate > 6 ? 'high-turnover' : item.turnoverRate < 3 ? 'low-turnover' : ''}">
                    ${item.turnoverRate.toFixed(1)}x
                </div>
            </td>
            <td class="forecast-cell">
                <div class="forecast-value">$${(item.forecast * 250).toLocaleString()}</div>
                <div class="forecast-change ${item.forecast > item.monthlySales ? 'positive' : item.forecast < item.monthlySales ? 'negative' : ''}">
                    ${item.forecast > item.monthlySales ? '+' : ''}${((item.forecast - item.monthlySales) / item.monthlySales * 100).toFixed(1)}%
                </div>
            </td>
            <td>
                <div class="trend-indicator trend-${item.trend}">
                    <i class="bx bx-${item.trend === 'up' ? 'trending-up' : item.trend === 'down' ? 'trending-down' : 'minus'}"></i>
                    ${item.trend.charAt(0).toUpperCase() + item.trend.slice(1)}
                </div>
            </td>
        </tr>
    `).join('');
}

// Sort performance table
function sortPerformanceTable(sortBy) {
    let sortedData = [...performanceData];
    
    switch(sortBy) {
        case 'revenue':
            sortedData.sort((a, b) => (b.monthlySales * 250) - (a.monthlySales * 250));
            break;
        case 'turnover':
            sortedData.sort((a, b) => b.turnoverRate - a.turnoverRate);
            break;
        case 'stock':
            sortedData.sort((a, b) => b.stockLevel - a.stockLevel);
            break;
        case 'forecast':
            sortedData.sort((a, b) => b.forecast - a.forecast);
            break;
    }
    
    performanceData = sortedData;
    renderPerformanceTable();
    showNotification(`Performance table sorted by ${sortBy}`, 'success');
}

// Load insights
function loadInsights() {
    insightsData = [
        {
            id: 1,
            type: 'stock',
            title: 'Low Stock Alert',
            message: 'Monitor 27" stock is at 42% - consider replenishing before next month',
            priority: 'high',
            action: 'Replenish Stock',
            icon: 'bx-low-vision'
        },
        {
            id: 2,
            type: 'sales',
            title: 'High Performer',
            message: 'Mouse Logitech has 8.5x turnover rate - consider increasing stock levels',
            priority: 'medium',
            action: 'Increase Stock',
            icon: 'bx-trending-up'
        },
        {
            id: 3,
            type: 'category',
            title: 'Category Opportunity',
            message: 'Electronics category contributes 42% of revenue - focus marketing efforts here',
            priority: 'medium',
            action: 'Optimize Marketing',
            icon: 'bx-bulb'
        },
        {
            id: 4,
            type: 'forecast',
            title: 'Sales Forecast',
            message: 'Next 30-day sales forecast: $28,400 (+14.3% growth expected)',
            priority: 'low',
            action: 'Review Forecast',
            icon: 'bx-line-chart'
        },
        {
            id: 5,
            type: 'efficiency',
            title: 'Inventory Efficiency',
            message: 'Overall stock turnover rate improved by 0.8x this quarter',
            priority: 'low',
            action: 'View Report',
            icon: 'bx-bar-chart'
        }
    ];
    
    renderInsights();
}

// Render insights
function renderInsights() {
    const insightsList = document.getElementById('insightsList');
    
    insightsList.innerHTML = insightsData.map(insight => `
        <div class="insight-item insight-${insight.priority}">
            <div class="insight-icon">
                <i class="bx ${insight.icon}"></i>
            </div>
            <div class="insight-content">
                <div class="insight-title">${insight.title}</div>
                <div class="insight-message">${insight.message}</div>
            </div>
            <button class="insight-action" onclick="handleInsightAction(${insight.id})">
                ${insight.action}
            </button>
        </div>
    `).join('');
}

// Handle insight action
function handleInsightAction(insightId) {
    const insight = insightsData.find(i => i.id === insightId);
    if (insight) {
        showNotification(`Action taken: ${insight.action} for "${insight.title}"`, 'success');
        
        // In a real app, this would trigger specific actions
        switch(insight.type) {
            case 'stock':
                // Open stock management
                console.log('Opening stock management for low stock item');
                break;
            case 'sales':
                // Open sales dashboard
                console.log('Opening sales dashboard for high performer');
                break;
            case 'category':
                // Open category analytics
                console.log('Opening category analytics');
                break;
        }
    }
}

// Generate new insights
function generateNewInsights() {
    // Simulate AI generating new insights
    const newInsight = {
        id: insightsData.length + 1,
        type: 'ai',
        title: 'AI-Generated Insight',
        message: 'Based on recent trends, consider increasing inventory of high-turnover items before the weekend sales period.',
        priority: 'medium',
        action: 'Apply Suggestion',
        icon: 'bx-brain'
    };
    
    insightsData.unshift(newInsight);
    
    // Keep only last 5 insights
    if (insightsData.length > 5) {
        insightsData.pop();
    }
    
    renderInsights();
    showNotification('New AI-powered insights generated', 'success');
}

// Export analytics
function exportAnalytics() {
    try {
        // Create a comprehensive report object
        const report = {
            timestamp: new Date().toISOString(),
            timeRange: currentTimeRange,
            category: currentCategory,
            forecastModel: currentForecastModel,
            kpis: {
                totalSales: 24850,
                turnoverRate: 4.2,
                lowStockItems: 8,
                forecast: 28400
            },
            insights: insightsData.map(i => ({
                title: i.title,
                message: i.message,
                priority: i.priority
            }))
        };
        
        // Convert to JSON
        const reportJson = JSON.stringify(report, null, 2);
        
        // Create download link
        const blob = new Blob([reportJson], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        
        a.href = url;
        a.download = `analytics_report_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        
        showNotification('Analytics report exported successfully', 'success');
        
    } catch (error) {
        console.error('Export error:', error);
        showNotification('Failed to export analytics report', 'error');
    }
}

// Refresh data
function refreshData() {
    // Simulate data refresh
    showNotification('Refreshing analytics data...', 'info');
    
    // Update KPI cards
    updateKPICards();
    
    // Update charts with slight variation
    updateCharts();
    
    // Update performance table
    loadPerformanceData();
    
    setTimeout(() => {
        showNotification('Data refreshed successfully', 'success');
    }, 1000);
}

// Update KPI cards
function updateKPICards() {
    // In a real app, this would fetch actual data
    // For demo, we'll add some random variation
    
    const kpiValues = [
        { selector: '.kpi-card:nth-child(1) .kpi-value', value: `$${(24850 + Math.random() * 1000 - 500).toFixed(0)}` },
        { selector: '.kpi-card:nth-child(2) .kpi-value', value: `${(4.2 + Math.random() * 0.5 - 0.25).toFixed(1)}x` },
        { selector: '.kpi-card:nth-child(3) .kpi-value', value: `${Math.floor(8 + Math.random() * 4 - 2)}` },
        { selector: '.kpi-card:nth-child(4) .kpi-value', value: `$${(28400 + Math.random() * 2000 - 1000).toFixed(0)}` }
    ];
    
    kpiValues.forEach(kpi => {
        const element = document.querySelector(kpi.selector);
        if (element) {
            // Add animation
            element.style.opacity = '0.5';
            setTimeout(() => {
                element.textContent = kpi.value;
                element.style.opacity = '1';
            }, 300);
        }
    });
}

// Update dashboard controls
function updateDashboardControls() {
    // Any initialization for controls
    console.log('Dashboard controls initialized');
}

// Setup sidebar navigation
function setupSidebarNavigation() {
    const sidebarItems = document.querySelectorAll('.sidebar li');
    sidebarItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all items
            sidebarItems.forEach(li => li.classList.remove('active'));
            // Add active class to clicked item
            this.classList.add('active');
            
            // In a real application, you would navigate to different pages here
            const pageName = this.textContent.trim();
            showNotification(`Navigating to ${pageName}`, 'info');
        });
    });
}

// Toggle chart type
function toggleChartType(chartId) {
    const chart = charts[chartId];
    if (!chart) return;
    
    const currentType = chart.config.type;
    const newType = currentType === 'line' ? 'bar' : 
                   currentType === 'bar' ? 'pie' : 
                   currentType === 'pie' ? 'doughnut' : 'line';
    
    chart.config.type = newType;
    chart.update();
    
    showNotification(`Chart type changed to ${newType}`, 'success');
}

// Download chart as image
function downloadChart(chartId) {
    const chart = charts[chartId];
    if (!chart) return;
    
    const link = document.createElement('a');
    link.download = `${chartId}_${new Date().toISOString().split('T')[0]}.png`;
    link.href = chart.toBase64Image();
    link.click();
    
    showNotification(`Chart downloaded as ${link.download}`, 'success');
}

// Show notification
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="bx bx-${type === 'success' ? 'check-circle' : type === 'error' ? 'x-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="bx bx-x"></i>
        </button>
    `;
    
    // Add styles if not already added
    if (!document.querySelector('#notification-styles')) {
        const style = document.createElement('style');
        style.id = 'notification-styles';
        style.textContent = `
            .notification {
                position: fixed;
                top: 20px;
                right: 20px;
                padding: 15px 20px;
                border-radius: 8px;
                color: white;
                display: flex;
                justify-content: space-between;
                align-items: center;
                min-width: 300px;
                max-width: 400px;
                z-index: 10000;
                animation: slideIn 0.3s ease-out;
                box-shadow: 0 4px 20px rgba(0,0,0,0.15);
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
            }
            .notification-success { 
                background: linear-gradient(135deg, #4CAF50, #45a049);
                border-left: 4px solid #2E7D32;
            }
            .notification-error { 
                background: linear-gradient(135deg, #f44336, #e53935);
                border-left: 4px solid #c62828;
            }
            .notification-info { 
                background: linear-gradient(135deg, #2196F3, #1E88E5);
                border-left: 4px solid #1565C0;
            }
            .notification-warning { 
                background: linear-gradient(135deg, #ff9800, #fb8c00);
                border-left: 4px solid #ef6c00;
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .notification-content i {
                font-size: 20px;
            }
            .notification-close {
                background: none;
                border: none;
                color: white;
                font-size: 18px;
                cursor: pointer;
                margin-left: 15px;
                opacity: 0.8;
                transition: opacity 0.2s;
            }
            .notification-close:hover {
                opacity: 1;
            }
            @keyframes slideIn {
                from { transform: translateX(100%); opacity: 0; }
                to { transform: translateX(0); opacity: 1; }
            }
        `;
        document.head.appendChild(style);
    }
    
    // Add notification to page
    document.body.appendChild(notification);
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.remove();
        }
    }, 5000);
}

// Make functions available globally
window.updateCharts = updateCharts;
window.updateForecast = updateForecast;
window.setForecastPeriod = setForecastPeriod;
window.exportAnalytics = exportAnalytics;
window.refreshData = refreshData;
window.sortPerformanceTable = sortPerformanceTable;
window.generateNewInsights = generateNewInsights;
window.toggleChartType = toggleChartType;
window.downloadChart = downloadChart;
window.handleInsightAction = handleInsightAction;