// EV Adoption Forecasting Dashboard JavaScript

class EVDashboard {
    constructor() {
        this.evData = [
            {
                "Date": "2022-09-30",
                "County": "Riverside",
                "State": "CA",
                "Vehicle_Primary_Use": "Passenger",
                "BEVs": 7,
                "PHEVs": 0,
                "EV_Total": 7,
                "Non_Electric_Total": 460,
                "Total_Vehicles": 467,
                "Percent_Electric": 1.5,
                "Year": 2022,
                "Month": 9
            },
            {
                "Date": "2022-12-31",
                "County": "Prince William",
                "State": "VA", 
                "Vehicle_Primary_Use": "Passenger",
                "BEVs": 1,
                "PHEVs": 2,
                "EV_Total": 3,
                "Non_Electric_Total": 188,
                "Total_Vehicles": 191,
                "Percent_Electric": 1.57,
                "Year": 2022,
                "Month": 12
            },
            {
                "Date": "2020-01-31",
                "County": "Dakota",
                "State": "MN",
                "Vehicle_Primary_Use": "Passenger", 
                "BEVs": 0,
                "PHEVs": 1,
                "EV_Total": 1,
                "Non_Electric_Total": 32,
                "Total_Vehicles": 33,
                "Percent_Electric": 3.03,
                "Year": 2020,
                "Month": 1
            },
            {
                "Date": "2021-07-31",
                "County": "Douglas",
                "State": "CO",
                "Vehicle_Primary_Use": "Passenger",
                "BEVs": 0,
                "PHEVs": 1, 
                "EV_Total": 1,
                "Non_Electric_Total": 83,
                "Total_Vehicles": 84,
                "Percent_Electric": 1.19,
                "Year": 2021,
                "Month": 7
            },
            {
                "Date": "2023-08-31",
                "County": "King",
                "State": "WA",
                "Vehicle_Primary_Use": "Passenger",
                "BEVs": 25,
                "PHEVs": 8,
                "EV_Total": 33,
                "Non_Electric_Total": 1400,
                "Total_Vehicles": 1433,
                "Percent_Electric": 2.3,
                "Year": 2023,
                "Month": 8
            }
        ];

        this.stateStats = {
            "CA": {"total_evs": 4721, "avg_percent": 2.03, "counties": 58},
            "WA": {"total_evs": 15420, "avg_percent": 4.2, "counties": 39}, 
            "TX": {"total_evs": 2350, "avg_percent": 1.1, "counties": 254},
            "FL": {"total_evs": 1387, "avg_percent": 2.51, "counties": 67},
            "CO": {"total_evs": 738, "avg_percent": 3.11, "counties": 64}
        };

        this.charts = {};
        this.currentFilters = {};
        this.chartsInitialized = {
            trends: false,
            regional: false
        };
        
        this.init();
    }

    init() {
        this.generateExtendedData();
        this.setupTabNavigation();
        this.setupEventListeners();
        this.populateDropdowns();
        this.updateMetrics();
        this.populateDataTable();
        this.setupRegionalAnalysis();
        
        // Initialize overview charts immediately since it's the default tab
        this.initializeOverviewCharts();
    }

    setupTabNavigation() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabContents = document.querySelectorAll('.tab-content');

        tabButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                
                const targetTab = button.dataset.tab;
                
                // Remove active class from all buttons and contents
                tabButtons.forEach(btn => btn.classList.remove('active'));
                tabContents.forEach(content => content.classList.remove('active'));
                
                // Add active class to clicked button and corresponding content
                button.classList.add('active');
                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('active');
                }
                
                // Initialize tab-specific functionality with delay to ensure DOM is ready
                setTimeout(() => {
                    if (targetTab === 'trends' && !this.chartsInitialized.trends) {
                        this.initializeTrendCharts();
                        this.chartsInitialized.trends = true;
                    } else if (targetTab === 'regional' && !this.chartsInitialized.regional) {
                        this.initializeRegionalCharts();
                        this.chartsInitialized.regional = true;
                    }
                }, 100);
            });
        });
    }

    setupEventListeners() {
        // Filter controls
        const applyFiltersBtn = document.getElementById('apply-filters');
        if (applyFiltersBtn) {
            applyFiltersBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.applyFilters();
            });
        }

        // Trend analysis controls
        const updateTrendsBtn = document.getElementById('update-trends');
        if (updateTrendsBtn) {
            updateTrendsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.updateTrendCharts();
            });
        }

        // Forecasting
        const forecastMonthsSlider = document.getElementById('forecast-months');
        if (forecastMonthsSlider) {
            forecastMonthsSlider.addEventListener('input', (e) => {
                const monthsValue = document.getElementById('months-value');
                if (monthsValue) {
                    monthsValue.textContent = e.target.value;
                }
            });
        }

        const generateForecastBtn = document.getElementById('generate-forecast');
        if (generateForecastBtn) {
            generateForecastBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.generateForecast();
            });
        }

        const downloadForecastBtn = document.getElementById('download-forecast');
        if (downloadForecastBtn) {
            downloadForecastBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.downloadForecast();
            });
        }
    }

    populateDropdowns() {
        // State filter dropdown
        const stateFilter = document.getElementById('state-filter');
        if (stateFilter) {
            const states = [...new Set(this.evData.map(d => d.State))].sort();
            states.forEach(state => {
                const option = document.createElement('option');
                option.value = state;
                option.textContent = state;
                stateFilter.appendChild(option);
            });
        }

        // Forecast region dropdown
        const forecastRegion = document.getElementById('forecast-region');
        if (forecastRegion) {
            const regions = new Set();
            this.evData.forEach(d => {
                regions.add(`${d.County}, ${d.State}`);
            });
            
            [...regions].sort().forEach(region => {
                const option = document.createElement('option');
                option.value = region;
                option.textContent = region;
                forecastRegion.appendChild(option);
            });
        }

        // Set date range inputs
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');
        if (dateFrom) dateFrom.value = '2020-01-01';
        if (dateTo) dateTo.value = '2023-12-31';
    }

    updateMetrics() {
        const totalEVs = Object.values(this.stateStats).reduce((sum, state) => sum + state.total_evs, 0);
        const avgGrowth = Object.values(this.stateStats).reduce((sum, state) => sum + state.avg_percent, 0) / Object.keys(this.stateStats).length;
        const topState = Object.entries(this.stateStats).reduce((max, [state, data]) => 
            data.total_evs > max.total_evs ? {state, total_evs: data.total_evs} : max, 
            {state: '', total_evs: 0}
        );
        const totalCounties = Object.values(this.stateStats).reduce((sum, state) => sum + state.counties, 0);

        const totalEVsEl = document.getElementById('total-evs');
        const avgGrowthEl = document.getElementById('avg-growth');
        const topStateEl = document.getElementById('top-state');
        const totalCountiesEl = document.getElementById('total-counties');

        if (totalEVsEl) totalEVsEl.textContent = totalEVs.toLocaleString();
        if (avgGrowthEl) avgGrowthEl.textContent = `${avgGrowth.toFixed(1)}%`;
        if (topStateEl) topStateEl.textContent = topState.state;
        if (totalCountiesEl) totalCountiesEl.textContent = totalCounties;
    }

    populateDataTable() {
        const tbody = document.querySelector('#ev-data-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        let dataToShow = this.evData.slice(0, 20); // Show first 20 rows for performance
        if (Object.keys(this.currentFilters).length > 0) {
            dataToShow = this.applyDataFilters(this.evData).slice(0, 20);
        }

        dataToShow.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${row.Date}</td>
                <td>${row.County}</td>
                <td>${row.State}</td>
                <td>${row.Vehicle_Primary_Use}</td>
                <td>${row.BEVs}</td>
                <td>${row.PHEVs}</td>
                <td>${row.EV_Total}</td>
                <td>${row.Percent_Electric}%</td>
            `;
            tbody.appendChild(tr);
        });
    }

    applyFilters() {
        const stateFilter = document.getElementById('state-filter');
        const vehicleTypeFilter = document.getElementById('vehicle-type-filter');
        const dateFrom = document.getElementById('date-from');
        const dateTo = document.getElementById('date-to');

        this.currentFilters = {
            state: stateFilter ? stateFilter.value : '',
            vehicleType: vehicleTypeFilter ? vehicleTypeFilter.value : '',
            dateFrom: dateFrom ? dateFrom.value : '',
            dateTo: dateTo ? dateTo.value : ''
        };

        this.populateDataTable();
    }

    applyDataFilters(data) {
        return data.filter(row => {
            if (this.currentFilters.state && row.State !== this.currentFilters.state) return false;
            if (this.currentFilters.vehicleType && row.Vehicle_Primary_Use !== this.currentFilters.vehicleType) return false;
            if (this.currentFilters.dateFrom && row.Date < this.currentFilters.dateFrom) return false;
            if (this.currentFilters.dateTo && row.Date > this.currentFilters.dateTo) return false;
            return true;
        });
    }

    initializeOverviewCharts() {
        // No charts in overview tab currently
    }

    initializeTrendCharts() {
        setTimeout(() => {
            this.createTimeSeriesChart();
            this.createStateBarChart();
            this.createBevPhevChart();
            this.createPenetrationChart();
        }, 200);
    }

    initializeRegionalCharts() {
        setTimeout(() => {
            this.createRegionalComparisonChart();
            this.createGrowthComparisonChart();
        }, 200);
    }

    createTimeSeriesChart() {
        const canvas = document.getElementById('time-series-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (this.charts.timeSeries) {
            this.charts.timeSeries.destroy();
        }

        const data = this.prepareTimeSeriesData();

        this.charts.timeSeries = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Total EVs',
                    data: data.values,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: true,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
    }

    createStateBarChart() {
        const canvas = document.getElementById('state-bar-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (this.charts.stateBar) {
            this.charts.stateBar.destroy();
        }

        const states = Object.keys(this.stateStats);
        const values = states.map(state => this.stateStats[state].total_evs);

        this.charts.stateBar = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: states,
                datasets: [{
                    label: 'Total EVs',
                    data: values,
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createBevPhevChart() {
        const canvas = document.getElementById('bev-phev-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (this.charts.bevPhev) {
            this.charts.bevPhev.destroy();
        }

        const totalBEVs = this.evData.reduce((sum, d) => sum + d.BEVs, 0);
        const totalPHEVs = this.evData.reduce((sum, d) => sum + d.PHEVs, 0);

        this.charts.bevPhev = new Chart(ctx, {
            type: 'pie',
            data: {
                labels: ['BEVs', 'PHEVs'],
                datasets: [{
                    data: [totalBEVs, totalPHEVs],
                    backgroundColor: ['#1FB8CD', '#FFC185']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    }
                }
            }
        });
    }

    createPenetrationChart() {
        const canvas = document.getElementById('penetration-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        if (this.charts.penetration) {
            this.charts.penetration.destroy();
        }

        const data = this.preparePenetrationData();

        this.charts.penetration = new Chart(ctx, {
            type: 'line',
            data: {
                labels: data.labels,
                datasets: [{
                    label: 'Electric Vehicle %',
                    data: data.electric,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: false
                }, {
                    label: 'Non-Electric Vehicle %',
                    data: data.nonElectric,
                    borderColor: '#B4413C',
                    backgroundColor: 'rgba(180, 65, 60, 0.1)',
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    prepareTimeSeriesData() {
        const sortedData = [...this.evData].sort((a, b) => new Date(a.Date) - new Date(b.Date));
        const monthlyTotals = {};
        
        sortedData.forEach(d => {
            const monthKey = d.Date.substring(0, 7); // YYYY-MM format
            if (!monthlyTotals[monthKey]) {
                monthlyTotals[monthKey] = 0;
            }
            monthlyTotals[monthKey] += d.EV_Total;
        });

        return {
            labels: Object.keys(monthlyTotals).sort(),
            values: Object.keys(monthlyTotals).sort().map(key => monthlyTotals[key])
        };
    }

    preparePenetrationData() {
        const sortedData = [...this.evData].sort((a, b) => new Date(a.Date) - new Date(b.Date));
        const monthlyData = {};

        sortedData.forEach(d => {
            const monthKey = d.Date.substring(0, 7);
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = { ev: 0, total: 0 };
            }
            monthlyData[monthKey].ev += d.EV_Total;
            monthlyData[monthKey].total += d.Total_Vehicles;
        });

        const labels = Object.keys(monthlyData).sort();
        return {
            labels: labels,
            electric: labels.map(key => {
                const percent = (monthlyData[key].ev / monthlyData[key].total) * 100;
                return parseFloat(percent.toFixed(2));
            }),
            nonElectric: labels.map(key => {
                const percent = ((monthlyData[key].total - monthlyData[key].ev) / monthlyData[key].total) * 100;
                return parseFloat(percent.toFixed(2));
            })
        };
    }

    updateTrendCharts() {
        const period = document.getElementById('time-period');
        const metric = document.getElementById('metric-type');
        
        if (!period || !metric) return;
        
        // Filter data based on period
        let filteredData = this.evData;
        if (period.value !== 'all') {
            filteredData = this.evData.filter(d => d.Year.toString() === period.value);
        }

        // Update charts with filtered data
        this.updateChartData(filteredData, metric.value);
    }

    updateChartData(data, metric) {
        if (!this.charts.timeSeries) return;

        const sortedData = [...data].sort((a, b) => new Date(a.Date) - new Date(b.Date));
        const monthlyData = {};

        sortedData.forEach(d => {
            const monthKey = d.Date.substring(0, 7);
            if (!monthlyData[monthKey]) {
                monthlyData[monthKey] = 0;
            }
            
            switch(metric) {
                case 'ev_total':
                    monthlyData[monthKey] += d.EV_Total;
                    break;
                case 'percent_electric':
                    monthlyData[monthKey] += d.Percent_Electric;
                    break;
                case 'bevs':
                    monthlyData[monthKey] += d.BEVs;
                    break;
                case 'phevs':
                    monthlyData[monthKey] += d.PHEVs;
                    break;
                default:
                    monthlyData[monthKey] += d.EV_Total;
            }
        });

        const labels = Object.keys(monthlyData).sort();
        const values = labels.map(key => monthlyData[key]);

        this.charts.timeSeries.data.labels = labels;
        this.charts.timeSeries.data.datasets[0].data = values;
        this.charts.timeSeries.data.datasets[0].label = metric.replace('_', ' ').toUpperCase();
        this.charts.timeSeries.update();
    }

    generateForecast() {
        const regionSelect = document.getElementById('forecast-region');
        const monthsSelect = document.getElementById('forecast-months');
        const vehicleTypeSelect = document.getElementById('forecast-vehicle-type');

        if (!regionSelect || !monthsSelect || !vehicleTypeSelect) return;

        const region = regionSelect.value;
        const months = parseInt(monthsSelect.value);
        const vehicleType = vehicleTypeSelect.value;

        if (!region) {
            alert('Please select a region for forecasting');
            return;
        }

        this.showLoading();

        // Simulate API call delay
        setTimeout(() => {
            const forecastData = this.simulateForecast(region, months, vehicleType);
            this.displayForecastResults(forecastData);
            this.hideLoading();
        }, 1500);
    }

    simulateForecast(region, months, vehicleType) {
        const [county, state] = region.split(', ');
        const baseData = this.evData.find(d => d.County === county && d.State === state);
        
        if (!baseData) {
            return this.generateDefaultForecast(months);
        }

        const forecast = [];
        let baseValue = baseData.EV_Total;
        const growthRate = 0.05 + (Math.random() * 0.1); // 5-15% monthly growth

        for (let i = 1; i <= months; i++) {
            const predicted = Math.round(baseValue * Math.pow(1 + growthRate, i));
            const confidence = Math.max(0.6, 0.95 - (i * 0.02)); // Decreasing confidence
            const margin = predicted * (0.3 * (1 - confidence));
            
            forecast.push({
                month: i,
                predicted: predicted,
                lowerBound: Math.round(predicted - margin),
                upperBound: Math.round(predicted + margin),
                confidence: Math.round(confidence * 100)
            });
        }

        return forecast;
    }

    generateDefaultForecast(months) {
        const forecast = [];
        let baseValue = 15;
        const growthRate = 0.08;

        for (let i = 1; i <= months; i++) {
            const predicted = Math.round(baseValue * Math.pow(1 + growthRate, i));
            const confidence = Math.max(0.6, 0.95 - (i * 0.02));
            const margin = predicted * (0.3 * (1 - confidence));
            
            forecast.push({
                month: i,
                predicted: predicted,
                lowerBound: Math.round(predicted - margin),
                upperBound: Math.round(predicted + margin),
                confidence: Math.round(confidence * 100)
            });
        }

        return forecast;
    }

    displayForecastResults(forecastData) {
        // Show results section
        const resultsSection = document.getElementById('forecast-results');
        if (resultsSection) {
            resultsSection.classList.remove('hidden');
        }

        // Create forecast chart
        this.createForecastChart(forecastData);

        // Populate forecast table
        this.populateForecastTable(forecastData);
    }

    createForecastChart(forecastData) {
        const canvas = document.getElementById('forecast-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.forecast) {
            this.charts.forecast.destroy();
        }

        const labels = forecastData.map(d => `Month ${d.month}`);
        const predicted = forecastData.map(d => d.predicted);
        const lowerBound = forecastData.map(d => d.lowerBound);
        const upperBound = forecastData.map(d => d.upperBound);

        this.charts.forecast = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'Predicted EVs',
                    data: predicted,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.1)',
                    fill: false
                }, {
                    label: 'Upper Bound',
                    data: upperBound,
                    borderColor: '#FFC185',
                    backgroundColor: 'rgba(255, 193, 133, 0.1)',
                    borderDash: [5, 5],
                    fill: '+1'
                }, {
                    label: 'Lower Bound',
                    data: lowerBound,
                    borderColor: '#B4413C',
                    backgroundColor: 'rgba(180, 65, 60, 0.1)',
                    borderDash: [5, 5],
                    fill: false
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                },
                plugins: {
                    tooltip: {
                        mode: 'index',
                        intersect: false
                    }
                }
            }
        });
    }

    populateForecastTable(forecastData) {
        const tbody = document.querySelector('#forecast-table tbody');
        if (!tbody) return;
        
        tbody.innerHTML = '';

        forecastData.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>Month ${row.month}</td>
                <td>${row.predicted}</td>
                <td>${row.lowerBound}</td>
                <td>${row.upperBound}</td>
                <td>${row.confidence}%</td>
            `;
            tbody.appendChild(tr);
        });
    }

    setupRegionalAnalysis() {
        this.populateStateRankings();
    }

    populateStateRankings() {
        const container = document.getElementById('state-rankings');
        if (!container) return;
        
        container.innerHTML = '';

        // Sort states by total EVs
        const sortedStates = Object.entries(this.stateStats)
            .sort(([,a], [,b]) => b.total_evs - a.total_evs);

        sortedStates.forEach(([state, data]) => {
            const rankingItem = document.createElement('div');
            rankingItem.className = 'ranking-item';
            rankingItem.innerHTML = `
                <div>
                    <div class="ranking-state">${state}</div>
                    <div style="font-size: 12px; color: var(--color-text-secondary);">
                        ${data.counties} counties
                    </div>
                </div>
                <div>
                    <div class="ranking-value">${data.total_evs.toLocaleString()}</div>
                    <div style="font-size: 12px; color: var(--color-text-secondary);">
                        ${data.avg_percent}% avg
                    </div>
                </div>
            `;
            container.appendChild(rankingItem);
        });
    }

    createRegionalComparisonChart() {
        const canvas = document.getElementById('regional-comparison-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.regionalComparison) {
            this.charts.regionalComparison.destroy();
        }

        const states = Object.keys(this.stateStats);
        const totalEVs = states.map(state => this.stateStats[state].total_evs);

        this.charts.regionalComparison = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: states,
                datasets: [{
                    label: 'Total EVs',
                    data: totalEVs,
                    backgroundColor: ['#1FB8CD', '#FFC185', '#B4413C', '#ECEBD5', '#5D878F']
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    y: {
                        beginAtZero: true
                    }
                }
            }
        });
    }

    createGrowthComparisonChart() {
        const canvas = document.getElementById('growth-comparison-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        if (this.charts.growthComparison) {
            this.charts.growthComparison.destroy();
        }

        const states = Object.keys(this.stateStats);
        const avgPercents = states.map(state => this.stateStats[state].avg_percent);

        this.charts.growthComparison = new Chart(ctx, {
            type: 'radar',
            data: {
                labels: states,
                datasets: [{
                    label: 'Average EV Percentage',
                    data: avgPercents,
                    borderColor: '#1FB8CD',
                    backgroundColor: 'rgba(31, 184, 205, 0.2)',
                    pointBackgroundColor: '#1FB8CD'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                scales: {
                    r: {
                        beginAtZero: true,
                        max: 5
                    }
                }
            }
        });
    }

    generateExtendedData() {
        // Generate additional synthetic data for better visualization
        const additionalData = [];
        const baseDate = new Date('2023-01-01');
        
        for (let i = 0; i < 12; i++) {
            const currentDate = new Date(baseDate.getFullYear(), baseDate.getMonth() + i, 1);
            const dateString = currentDate.toISOString().split('T')[0];
            
            Object.keys(this.stateStats).forEach(state => {
                const counties = ['Metro', 'Suburban', 'Rural'];
                counties.forEach(county => {
                    const baseEVs = Math.floor(Math.random() * 100) + 10;
                    const growth = 1 + (i * 0.15); // 15% monthly growth
                    
                    additionalData.push({
                        Date: dateString,
                        County: county,
                        State: state,
                        Vehicle_Primary_Use: 'Passenger',
                        BEVs: Math.floor(baseEVs * 0.7 * growth),
                        PHEVs: Math.floor(baseEVs * 0.3 * growth),
                        EV_Total: Math.floor(baseEVs * growth),
                        Non_Electric_Total: Math.floor((baseEVs * growth) * 20),
                        Total_Vehicles: Math.floor((baseEVs * growth) * 21),
                        Percent_Electric: parseFloat(((baseEVs * growth) / ((baseEVs * growth) * 21) * 100).toFixed(2)),
                        Year: currentDate.getFullYear(),
                        Month: currentDate.getMonth() + 1
                    });
                });
            });
        }
        
        this.evData = [...this.evData, ...additionalData];
    }

    downloadForecast() {
        const forecastTable = document.getElementById('forecast-table');
        if (!forecastTable) return;

        let csv = 'Month,Predicted EVs,Lower Bound,Upper Bound,Confidence\n';
        const rows = forecastTable.querySelectorAll('tbody tr');
        
        rows.forEach(row => {
            const cells = row.querySelectorAll('td');
            const rowData = Array.from(cells).map(cell => cell.textContent);
            csv += rowData.join(',') + '\n';
        });

        this.downloadCSV(csv, 'ev_forecast.csv');
    }

    downloadCSV(csvContent, filename) {
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        
        if (link.download !== undefined) {
            const url = URL.createObjectURL(blob);
            link.setAttribute('href', url);
            link.setAttribute('download', filename);
            link.style.visibility = 'hidden';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }
    }

    showLoading() {
        const modal = document.getElementById('loading-modal');
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    hideLoading() {
        const modal = document.getElementById('loading-modal');
        if (modal) {
            modal.classList.add('hidden');
        }
    }
}

// Initialize the dashboard when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.evDashboard = new EVDashboard();
});

// Handle window resize for chart responsiveness
window.addEventListener('resize', () => {
    if (window.evDashboard && window.evDashboard.charts) {
        Object.values(window.evDashboard.charts).forEach(chart => {
            if (chart && typeof chart.resize === 'function') {
                chart.resize();
            }
        });
    }
});