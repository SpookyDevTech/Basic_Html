// EMI Calculator functionality for Bank Loan Management System

function loadCalculatorPage(container) {
    const calculatorHtml = `
        <div class="row mb-4">
            <div class="col-12">
                <h2><i class="fas fa-calculator me-2"></i>EMI Calculator</h2>
                <p class="text-muted">Calculate your Equated Monthly Installments and plan your loan.</p>
            </div>
        </div>

        <div class="row">
            <!-- Calculator Form -->
            <div class="col-lg-6">
                <div class="calculator-container">
                    <h4 class="mb-4">Loan Calculator</h4>
                    
                    <form id="emiCalculatorForm">
                        <!-- Loan Type Selection -->
                        <div class="mb-4">
                            <label class="form-label">Loan Type</label>
                            <select class="form-select" id="loanType" onchange="updateLoanTypeDetails()">
                                <option value="">Select Loan Type</option>
                                ${getLoanTypeOptions()}
                            </select>
                        </div>

                        <!-- Principal Amount -->
                        <div class="mb-4">
                            <label for="principalAmount" class="form-label">
                                Loan Amount <span class="text-muted">(₹)</span>
                            </label>
                            <div class="input-group">
                                <span class="input-group-text">₹</span>
                                <input type="number" class="form-control" id="principalAmount" 
                                       placeholder="Enter loan amount" min="10000" max="50000000"
                                       oninput="calculateEMI()">
                            </div>
                            <div class="form-text">
                                <span id="amountRange">Amount range: ₹10,000 - ₹50,00,000</span>
                            </div>
                            <!-- Amount Slider -->
                            <input type="range" class="form-range mt-2" id="amountRange" 
                                   min="10000" max="5000000" step="10000" 
                                   oninput="updateAmountFromSlider(this.value)">
                        </div>

                        <!-- Interest Rate -->
                        <div class="mb-4">
                            <label for="interestRate" class="form-label">
                                Annual Interest Rate <span class="text-muted">(%)</span>
                            </label>
                            <div class="input-group">
                                <input type="number" class="form-control" id="interestRate" 
                                       placeholder="Enter interest rate" min="5" max="30" step="0.1"
                                       oninput="calculateEMI()">
                                <span class="input-group-text">%</span>
                            </div>
                            <!-- Interest Rate Slider -->
                            <input type="range" class="form-range mt-2" id="rateRange" 
                                   min="5" max="30" step="0.1" 
                                   oninput="updateRateFromSlider(this.value)">
                        </div>

                        <!-- Loan Tenure -->
                        <div class="mb-4">
                            <label for="loanTenure" class="form-label">
                                Loan Tenure
                            </label>
                            <div class="row">
                                <div class="col-8">
                                    <div class="input-group">
                                        <input type="number" class="form-control" id="loanTenure" 
                                               placeholder="Enter tenure" min="1" max="30"
                                               oninput="calculateEMI()">
                                        <select class="form-select" id="tenureType" onchange="calculateEMI()">
                                            <option value="months">Months</option>
                                            <option value="years">Years</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="col-4">
                                    <span class="form-text" id="tenureInMonths">0 months</span>
                                </div>
                            </div>
                            <!-- Tenure Slider -->
                            <input type="range" class="form-range mt-2" id="tenureRange" 
                                   min="1" max="30" step="1" 
                                   oninput="updateTenureFromSlider(this.value)">
                        </div>

                        <!-- Processing Fee -->
                        <div class="mb-4">
                            <label for="processingFee" class="form-label">
                                Processing Fee <span class="text-muted">(%)</span>
                            </label>
                            <div class="input-group">
                                <input type="number" class="form-control" id="processingFee" 
                                       placeholder="Enter processing fee" min="0" max="5" step="0.1"
                                       value="1" oninput="calculateEMI()">
                                <span class="input-group-text">%</span>
                            </div>
                        </div>

                        <!-- Calculate Button -->
                        <button type="button" class="btn btn-primary w-100 mb-3" onclick="calculateEMI()">
                            <i class="fas fa-calculator me-2"></i>Calculate EMI
                        </button>

                        <!-- Reset Button -->
                        <button type="button" class="btn btn-outline-secondary w-100" onclick="resetCalculator()">
                            <i class="fas fa-undo me-2"></i>Reset
                        </button>
                    </form>
                </div>
            </div>

            <!-- Results -->
            <div class="col-lg-6">
                <div class="calculator-result" id="calculatorResults" style="display: none;">
                    <h4 class="mb-3">Calculation Results</h4>
                    <div class="emi-amount" id="emiAmount">₹0</div>
                    <div class="mb-3">Monthly EMI</div>
                    
                    <div class="row text-center">
                        <div class="col-4">
                            <div class="text-white-50">Principal</div>
                            <div class="h5" id="principalDisplay">₹0</div>
                        </div>
                        <div class="col-4">
                            <div class="text-white-50">Interest</div>
                            <div class="h5" id="totalInterest">₹0</div>
                        </div>
                        <div class="col-4">
                            <div class="text-white-50">Total</div>
                            <div class="h5" id="totalAmount">₹0</div>
                        </div>
                    </div>
                </div>

                <!-- Loan Breakdown Chart -->
                <div class="card mt-3" id="breakdownCard" style="display: none;">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="fas fa-chart-pie me-2"></i>Loan Breakdown</h6>
                    </div>
                    <div class="card-body">
                        <canvas id="loanBreakdownChart" width="400" height="200"></canvas>
                        <div class="mt-3">
                            <div class="d-flex justify-content-between mb-2">
                                <span>Principal Amount:</span>
                                <span id="principalPercentage">0%</span>
                            </div>
                            <div class="d-flex justify-content-between">
                                <span>Total Interest:</span>
                                <span id="interestPercentage">0%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Quick Loan Comparison -->
                <div class="card mt-3">
                    <div class="card-header">
                        <h6 class="mb-0"><i class="fas fa-balance-scale me-2"></i>Quick Comparison</h6>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive">
                            <table class="table table-sm">
                                <thead>
                                    <tr>
                                        <th>Tenure</th>
                                        <th>EMI</th>
                                        <th>Total Interest</th>
                                        <th>Total Amount</th>
                                    </tr>
                                </thead>
                                <tbody id="comparisonTable">
                                    <!-- Comparison data will be populated here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <!-- Amortization Schedule -->
        <div class="row mt-4">
            <div class="col-12">
                <div class="card" id="amortizationCard" style="display: none;">
                    <div class="card-header d-flex justify-content-between align-items-center">
                        <h5 class="mb-0"><i class="fas fa-table me-2"></i>Amortization Schedule</h5>
                        <div>
                            <button class="btn btn-sm btn-outline-primary" onclick="downloadSchedule()">
                                <i class="fas fa-download me-1"></i>Download
                            </button>
                            <button class="btn btn-sm btn-outline-secondary" onclick="toggleAmortization()">
                                <i class="fas fa-eye-slash me-1"></i>Hide
                            </button>
                        </div>
                    </div>
                    <div class="card-body">
                        <div class="table-responsive" style="max-height: 400px; overflow-y: auto;">
                            <table class="table table-striped table-sm">
                                <thead class="table-dark sticky-top">
                                    <tr>
                                        <th>Month</th>
                                        <th>Opening Balance</th>
                                        <th>EMI</th>
                                        <th>Principal</th>
                                        <th>Interest</th>
                                        <th>Closing Balance</th>
                                    </tr>
                                </thead>
                                <tbody id="amortizationTable">
                                    <!-- Amortization data will be populated here -->
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;

    container.innerHTML = calculatorHtml;
    initializeCalculator();
}

function getLoanTypeOptions() {
    const loanProducts = dataManager.getLoans();
    return loanProducts.map(loan => 
        `<option value="${loan.id}" data-min="${loan.minAmount}" data-max="${loan.maxAmount}" 
                 data-rate="${loan.interestRate}" data-tenure="${loan.maxTenure}" 
                 data-fee="${loan.processingFee}">
            ${loan.name} (${loan.interestRate}% p.a.)
        </option>`
    ).join('');
}

function initializeCalculator() {
    // Set default values
    document.getElementById('principalAmount').value = 500000;
    document.getElementById('interestRate').value = 12;
    document.getElementById('loanTenure').value = 5;
    document.getElementById('tenureType').value = 'years';
    
    // Update sliders
    updateSlidersFromInputs();
    
    // Calculate initial EMI
    calculateEMI();
}

function updateLoanTypeDetails() {
    const loanTypeSelect = document.getElementById('loanType');
    const selectedOption = loanTypeSelect.options[loanTypeSelect.selectedIndex];
    
    if (selectedOption.value) {
        const minAmount = selectedOption.dataset.min;
        const maxAmount = selectedOption.dataset.max;
        const rate = selectedOption.dataset.rate;
        const maxTenure = selectedOption.dataset.tenure;
        const fee = selectedOption.dataset.fee;
        
        // Update form fields
        document.getElementById('interestRate').value = rate;
        document.getElementById('processingFee').value = fee;
        
        // Update amount range
        document.getElementById('amountRange').textContent = 
            `Amount range: ${utils.formatCurrency(minAmount)} - ${utils.formatCurrency(maxAmount)}`;
        
        const amountSlider = document.getElementById('amountRange');
        amountSlider.min = minAmount;
        amountSlider.max = maxAmount;
        
        // Update tenure range
        const tenureSlider = document.getElementById('tenureRange');
        tenureSlider.max = Math.floor(maxTenure / 12); // Convert to years
        
        updateSlidersFromInputs();
        calculateEMI();
    }
}

function updateAmountFromSlider(value) {
    document.getElementById('principalAmount').value = value;
    calculateEMI();
}

function updateRateFromSlider(value) {
    document.getElementById('interestRate').value = value;
    calculateEMI();
}

function updateTenureFromSlider(value) {
    const tenureType = document.getElementById('tenureType').value;
    document.getElementById('loanTenure').value = value;
    updateTenureDisplay();
    calculateEMI();
}

function updateSlidersFromInputs() {
    const principal = document.getElementById('principalAmount').value;
    const rate = document.getElementById('interestRate').value;
    const tenure = document.getElementById('loanTenure').value;
    
    document.getElementById('amountRange').value = principal;
    document.getElementById('rateRange').value = rate;
    document.getElementById('tenureRange').value = tenure;
    
    updateTenureDisplay();
}

function updateTenureDisplay() {
    const tenure = document.getElementById('loanTenure').value;
    const tenureType = document.getElementById('tenureType').value;
    
    const months = tenureType === 'years' ? tenure * 12 : tenure;
    document.getElementById('tenureInMonths').textContent = `${months} months`;
}

function calculateEMI() {
    const principal = parseFloat(document.getElementById('principalAmount').value) || 0;
    const annualRate = parseFloat(document.getElementById('interestRate').value) || 0;
    const tenure = parseFloat(document.getElementById('loanTenure').value) || 0;
    const tenureType = document.getElementById('tenureType').value;
    const processingFee = parseFloat(document.getElementById('processingFee').value) || 0;
    
    if (principal <= 0 || annualRate <= 0 || tenure <= 0) {
        hideResults();
        return;
    }
    
    // Convert to months
    const tenureInMonths = tenureType === 'years' ? tenure * 12 : tenure;
    
    // Convert annual rate to monthly rate
    const monthlyRate = annualRate / 12 / 100;
    
    // EMI calculation using the formula: P * r * (1+r)^n / ((1+r)^n - 1)
    const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, tenureInMonths) / 
                (Math.pow(1 + monthlyRate, tenureInMonths) - 1);
    
    const totalAmount = emi * tenureInMonths;
    const totalInterest = totalAmount - principal;
    const processingFeeAmount = (principal * processingFee) / 100;
    
    // Display results
    displayResults(emi, principal, totalInterest, totalAmount, processingFeeAmount);
    
    // Generate comparison table
    generateComparison(principal, annualRate, emi);
    
    // Generate amortization schedule
    generateAmortizationSchedule(principal, monthlyRate, tenureInMonths, emi);
    
    // Update sliders
    updateSlidersFromInputs();
}

function displayResults(emi, principal, totalInterest, totalAmount, processingFee) {
    document.getElementById('emiAmount').textContent = utils.formatCurrency(Math.round(emi));
    document.getElementById('principalDisplay').textContent = utils.formatCurrency(principal);
    document.getElementById('totalInterest').textContent = utils.formatCurrency(Math.round(totalInterest));
    document.getElementById('totalAmount').textContent = utils.formatCurrency(Math.round(totalAmount));
    
    // Calculate percentages
    const principalPercentage = Math.round((principal / totalAmount) * 100);
    const interestPercentage = Math.round((totalInterest / totalAmount) * 100);
    
    document.getElementById('principalPercentage').textContent = `${principalPercentage}%`;
    document.getElementById('interestPercentage').textContent = `${interestPercentage}%`;
    
    // Show results
    document.getElementById('calculatorResults').style.display = 'block';
    document.getElementById('breakdownCard').style.display = 'block';
    
    // Draw breakdown chart
    drawBreakdownChart(principal, totalInterest);
}

function hideResults() {
    document.getElementById('calculatorResults').style.display = 'none';
    document.getElementById('breakdownCard').style.display = 'none';
    document.getElementById('amortizationCard').style.display = 'none';
}

function drawBreakdownChart(principal, interest) {
    const canvas = document.getElementById('loanBreakdownChart');
    const ctx = canvas.getContext('2d');
    
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    const total = principal + interest;
    const principalAngle = (principal / total) * 2 * Math.PI;
    const interestAngle = (interest / total) * 2 * Math.PI;
    
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 20;
    
    // Draw principal portion
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, 0, principalAngle);
    ctx.closePath();
    ctx.fillStyle = '#0d6efd';
    ctx.fill();
    
    // Draw interest portion
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.arc(centerX, centerY, radius, principalAngle, principalAngle + interestAngle);
    ctx.closePath();
    ctx.fillStyle = '#dc3545';
    ctx.fill();
    
    // Add labels
    ctx.fillStyle = '#fff';
    ctx.font = 'bold 12px Arial';
    ctx.textAlign = 'center';
    
    // Principal label
    const principalLabelAngle = principalAngle / 2;
    const principalLabelX = centerX + Math.cos(principalLabelAngle) * (radius / 2);
    const principalLabelY = centerY + Math.sin(principalLabelAngle) * (radius / 2);
    ctx.fillText('Principal', principalLabelX, principalLabelY);
    
    // Interest label
    const interestLabelAngle = principalAngle + (interestAngle / 2);
    const interestLabelX = centerX + Math.cos(interestLabelAngle) * (radius / 2);
    const interestLabelY = centerY + Math.sin(interestLabelAngle) * (radius / 2);
    ctx.fillText('Interest', interestLabelX, interestLabelY);
}

function generateComparison(principal, annualRate, baseEmi) {
    const monthlyRate = annualRate / 12 / 100;
    const comparisonData = [];
    
    // Generate comparison for different tenures
    const tenures = [12, 24, 36, 48, 60, 84, 120, 180, 240, 300];
    
    tenures.forEach(months => {
        if (months <= 300) { // Max 25 years
            const emi = principal * monthlyRate * Math.pow(1 + monthlyRate, months) / 
                       (Math.pow(1 + monthlyRate, months) - 1);
            const totalAmount = emi * months;
            const totalInterest = totalAmount - principal;
            
            comparisonData.push({
                tenure: `${months} months`,
                emi: utils.formatCurrency(Math.round(emi)),
                totalInterest: utils.formatCurrency(Math.round(totalInterest)),
                totalAmount: utils.formatCurrency(Math.round(totalAmount))
            });
        }
    });
    
    const tableBody = document.getElementById('comparisonTable');
    tableBody.innerHTML = comparisonData.slice(0, 6).map(data => `
        <tr>
            <td>${data.tenure}</td>
            <td>${data.emi}</td>
            <td>${data.totalInterest}</td>
            <td>${data.totalAmount}</td>
        </tr>
    `).join('');
}

function generateAmortizationSchedule(principal, monthlyRate, tenure, emi) {
    const schedule = [];
    let remainingBalance = principal;
    
    for (let month = 1; month <= tenure; month++) {
        const interestAmount = remainingBalance * monthlyRate;
        const principalAmount = emi - interestAmount;
        remainingBalance -= principalAmount;
        
        // Avoid negative remaining balance due to rounding
        if (remainingBalance < 0) remainingBalance = 0;
        
        schedule.push({
            month: month,
            openingBalance: remainingBalance + principalAmount,
            emi: emi,
            principal: principalAmount,
            interest: interestAmount,
            closingBalance: remainingBalance
        });
    }
    
    const tableBody = document.getElementById('amortizationTable');
    tableBody.innerHTML = schedule.map(row => `
        <tr>
            <td>${row.month}</td>
            <td>${utils.formatCurrency(Math.round(row.openingBalance))}</td>
            <td>${utils.formatCurrency(Math.round(row.emi))}</td>
            <td>${utils.formatCurrency(Math.round(row.principal))}</td>
            <td>${utils.formatCurrency(Math.round(row.interest))}</td>
            <td>${utils.formatCurrency(Math.round(row.closingBalance))}</td>
        </tr>
    `).join('');
    
    // Show amortization card
    document.getElementById('amortizationCard').style.display = 'block';
    
    // Store schedule for download
    window.currentAmortizationSchedule = schedule;
}

function toggleAmortization() {
    const card = document.getElementById('amortizationCard');
    const button = event.target.closest('button');
    
    if (card.style.display === 'none') {
        card.style.display = 'block';
        button.innerHTML = '<i class="fas fa-eye-slash me-1"></i>Hide';
    } else {
        card.style.display = 'none';
        button.innerHTML = '<i class="fas fa-eye me-1"></i>Show';
    }
}

function downloadSchedule() {
    if (!window.currentAmortizationSchedule) {
        auth.showAlert('Please calculate EMI first to generate schedule', 'warning');
        return;
    }
    
    // Generate CSV content
    let csvContent = 'Month,Opening Balance,EMI,Principal,Interest,Closing Balance\n';
    
    window.currentAmortizationSchedule.forEach(row => {
        csvContent += `${row.month},${Math.round(row.openingBalance)},${Math.round(row.emi)},${Math.round(row.principal)},${Math.round(row.interest)},${Math.round(row.closingBalance)}\n`;
    });
    
    // Create and trigger download
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'amortization_schedule.csv';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
    
    auth.showAlert('Amortization schedule downloaded successfully!', 'success');
}

function resetCalculator() {
    document.getElementById('emiCalculatorForm').reset();
    hideResults();
    
    // Reset to default values
    setTimeout(() => {
        initializeCalculator();
    }, 100);
} 