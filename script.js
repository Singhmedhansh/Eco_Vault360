/**
 * Eco-Vault 360: Digital Twin for E-Waste Triage
 * Core JavaScript Module - AI Classification & Economic Metrics
 */

const VALUE_PER_TONNE_INR = 6250000;
const AI_ACCURACY = 0.95;
const COPPER_RECOVERY_TARGET = 0.995;
const OPERATIONAL_COST_PER_TONNE = 850000;
const DISPOSAL_COST_PER_TONNE = 120000;

// Image Classification Confidence Map
const CONFIDENCE_MAP = {
    'A': '99.9%',
    'B': '96.0%',
    'C': '92.0%',
    'D': '98.5%'
};

const appState = {
    totalItems: 0,
    totalTonnes: 0,
    totalValue: 0,
    classificationCounts: { A: 0, B: 0, C: 0, D: 0 },
    timeSeriesData: {
        labels: [],
        values: []
    },
    currentTime: 0
};

let valueChart = null;
let efficiencyChart = null;

function formatToLakh(value) {
    const lakhs = value / 100000;
    return `₹${lakhs.toFixed(2)} Lakh`;
}

function generateConfidenceScore() {
    const baseConfidence = AI_ACCURACY * 100;
    const variation = Math.random() * 10 - 5;
    return Math.min(99, Math.max(85, baseConfidence + variation)).toFixed(1);
}

function simulateItemMass() {
    return +(Math.random() * 4.9 + 0.1).toFixed(3);
}

function getRecoveryPercentage(classification) {
    const recoveryMap = {
        'A': 0.98,
        'B': 0.96,
        'C': COPPER_RECOVERY_TARGET,
        'D': 0.15
    };
    return recoveryMap[classification] || 0;
}

/**
 * Helper function to update dashboard classification results
 * Used by both dropdown classification and image prediction logic
 */
function updateDashboardClassification(classification, itemName, confidence, source = 'manual') {
    const resultDiv = document.getElementById('classificationResult');
    const recovery = getRecoveryPercentage(classification);
    
    document.getElementById('result-class').textContent = `Class ${classification}`;
    document.getElementById('result-confidence').textContent = confidence;
    
    const recoveryNote = document.getElementById('recovery-note');
    if (classification === 'C') {
        recoveryNote.textContent = `✓ Item qualifies for recovery processing (Target: ${(recovery * 100).toFixed(1)}% efficiency)`;
        recoveryNote.style.color = '#10b981';
    } else if (classification === 'D') {
        recoveryNote.textContent = '⚠ HAZARDOUS: Immediate isolation and VOC sensor activation required';
        recoveryNote.style.color = '#ef4444';
        recoveryNote.style.fontWeight = 'bold';
        
        // Safety protocol override for Class D (Hazardous)
        const classOutput = document.getElementById('class-output');
        const processOutput = document.getElementById('process-output');
        if (classOutput) classOutput.textContent = 'Class D - Hazardous Material';
        if (processOutput) processOutput.textContent = 'Immediate isolation and VOC sensor activation';
    } else if (classification === 'B') {
        recoveryNote.textContent = `→ High-Value Parts Harvesting - ${(recovery * 100).toFixed(1)}% recovery target`;
        recoveryNote.style.color = '#3b82f6';
    } else if (classification === 'A') {
        recoveryNote.textContent = `→ Repair/Resale candidate - ${(recovery * 100).toFixed(1)}% component recovery`;
        recoveryNote.style.color = '#8b5cf6';
    }
    
    resultDiv.style.display = 'block';
    
    console.log(`[Classification] Source: ${source}, Item: ${itemName}, Class: ${classification}, Confidence: ${confidence}`);
}

/**
 * Image Processing Simulation Function
 * Triggered by file input onchange event
 * Uses filename matching to simulate AI classification
 */
function processImageSimulation(event) {
    const file = event.target.files[0];
    
    if (!file) {
        console.warn('[Image Upload] No file selected');
        return;
    }
    
    // Validate file type
    if (!file.type.startsWith('image/')) {
        alert('Please upload a valid image file (JPEG, PNG, etc.)');
        return;
    }
    
    console.log(`[Image Upload] Processing file: ${file.name}`);
    
    // Use FileReader API to read and display the image
    const reader = new FileReader();
    
    reader.onload = function(e) {
        // Display uploaded image
        const uploadedImage = document.getElementById('uploaded-image');
        if (uploadedImage) {
            uploadedImage.src = e.target.result;
            uploadedImage.style.display = 'block';
        }
        
        // Simulation Logic: Filename Matching
        const filename = file.name.toLowerCase();
        let predictedClass = 'C';
        let predictedLabel = 'Generic E-Waste (Class C)';
        let confidence = CONFIDENCE_MAP['C'];
        
        // Check for hazardous materials (Class D)
        if (filename.includes('swollen') || filename.includes('hazard') || filename.includes('battery')) {
            predictedClass = 'D';
            predictedLabel = 'Hazardous Li-ion Battery (Class D)';
            confidence = CONFIDENCE_MAP['D'];
        }
        // Check for high-value parts (Class B)
        else if (filename.includes('screen') || filename.includes('cracked') || filename.includes('broken')) {
            predictedClass = 'B';
            predictedLabel = 'High-Value Parts Harvesting (Class B)';
            confidence = CONFIDENCE_MAP['B'];
        }
        // Check for repair/resale candidates (Class A)
        else if (filename.includes('working') || filename.includes('good') || filename.includes('full')) {
            predictedClass = 'A';
            predictedLabel = 'Repair/Resale Candidate (Class A)';
            confidence = CONFIDENCE_MAP['A'];
        }
        
        // Update image-specific result elements
        const imagePrediction = document.getElementById('image-prediction');
        const confidenceScore = document.getElementById('confidence-score');
        
        if (imagePrediction) {
            imagePrediction.textContent = predictedLabel;
            imagePrediction.style.fontWeight = 'bold';
            imagePrediction.style.color = predictedClass === 'D' ? '#ef4444' : '#d4af37';
        }
        
        if (confidenceScore) {
            confidenceScore.textContent = `Confidence: ${confidence}`;
            confidenceScore.style.fontWeight = 'bold';
            confidenceScore.style.color = '#d4af37';
        }
        
        // Update main dashboard classification (overrides dropdown logic)
        updateDashboardClassification(predictedClass, file.name, confidence, 'image-upload');
        
        // Update economic metrics
        updateEconomicMetrics(predictedClass);
        
        // Special handling for Class D (Hazardous) - Safety Protocol Override
        if (predictedClass === 'D') {
            console.warn('[SAFETY ALERT] Class D Hazardous material detected!');
            
            // Trigger visual alert if elements exist
            const imageResults = document.getElementById('image-results');
            if (imageResults) {
                imageResults.style.border = '3px solid #ef4444';
                imageResults.style.animation = 'pulse 1s infinite';
            }
        }
        
        console.log(`[Image Classification] Prediction: ${predictedLabel}, Confidence: ${confidence}`);
    };
    
    reader.onerror = function(error) {
        console.error('[Image Upload] Error reading file:', error);
        alert('Error reading image file. Please try again.');
    };
    
    reader.readAsDataURL(file);
}

function updateEconomicMetrics(classification) {
    const itemMass = simulateItemMass();
    const itemTonnes = itemMass / 1000;
    
    appState.totalItems++;
    appState.classificationCounts[classification]++;
    
    if (classification === 'C') {
        appState.totalTonnes += itemTonnes;
    }
    
    appState.totalValue = appState.totalTonnes * VALUE_PER_TONNE_INR * COPPER_RECOVERY_TARGET;
    appState.currentTime++;
    
    appState.timeSeriesData.labels.push(`Click ${appState.currentTime}`);
    appState.timeSeriesData.values.push(appState.totalValue / 100000);
    
    updateUIMetrics();
    updateValueChart();
    
    console.log(`[Metrics Update] Classification: ${classification}, Total Tonnes: ${appState.totalTonnes.toFixed(3)}, Total Value: ${formatToLakh(appState.totalValue)}`);
}

function updateUIMetrics() {
    document.getElementById('total-items').textContent = appState.totalItems;
    document.getElementById('recovery-items').textContent = appState.classificationCounts.C;
    document.getElementById('total-tonnes').textContent = appState.totalTonnes.toFixed(3) + ' tonnes';
    document.getElementById('gold-value').textContent = formatToLakh(appState.totalValue);
}

function classifyItem() {
    const itemInput = document.getElementById('item-input').value.trim();
    const selectedClass = document.getElementById('class-select').value;
    
    if (!itemInput) {
        alert('Please enter an e-waste item name');
        return;
    }
    
    const confidence = generateConfidenceScore() + '%';
    
    // Use the new helper function for consistency
    updateDashboardClassification(selectedClass, itemInput, confidence, 'dropdown');
    updateEconomicMetrics(selectedClass);
    document.getElementById('item-input').value = '';
}

function initializeValueChart() {
    const ctx = document.getElementById('valueChart').getContext('2d');
    
    valueChart = new Chart(ctx, {
        type: 'line',
        data: {
            labels: appState.timeSeriesData.labels,
            datasets: [{
                label: 'Cumulative Value Unlocked (Lakh ₹)',
                data: appState.timeSeriesData.values,
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointRadius: 5,
                pointBackgroundColor: '#10b981',
                pointBorderColor: '#fff',
                pointBorderWidth: 2,
                pointHoverRadius: 7
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12, weight: 'bold' },
                        padding: 15
                    }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return '₹' + value.toFixed(2) + ' L';
                        }
                    }
                }
            }
        }
    });
}

function updateValueChart() {
    if (valueChart) {
        valueChart.data.labels = appState.timeSeriesData.labels;
        valueChart.data.datasets[0].data = appState.timeSeriesData.values;
        valueChart.update('active');
    }
}

function initializeEfficiencyChart() {
    const ctx = document.getElementById('efficiencyChart').getContext('2d');
    
    efficiencyChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Recovery Rate', 'Loss Rate'],
            datasets: [
                {
                    label: 'Bioleaching (Eco-Vault 360)',
                    data: [99.5, 0.5],
                    backgroundColor: ['#10b981', '#fca5a5'],
                    borderColor: ['#059669', '#dc2626'],
                    borderWidth: 2
                },
                {
                    label: 'Traditional Smelting',
                    data: [90, 10],
                    backgroundColor: ['#3b82f6', '#fbbf24'],
                    borderColor: ['#1e40af', '#d97706'],
                    borderWidth: 2
                }
            ]
        },
        options: {
            indexAxis: 'y',
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: { size: 12, weight: 'bold' },
                        padding: 15
                    }
                }
            },
            scales: {
                x: {
                    max: 100,
                    ticks: {
                        callback: function(value) {
                            return value + '%';
                        }
                    }
                }
            }
        }
    });
}

function navigateTo(page) {
    const pages = document.querySelectorAll('.page-content');
    pages.forEach(p => p.classList.remove('active'));
    document.getElementById(page).classList.add('active');
    
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => link.classList.remove('active'));
    event.target.classList.add('active');
    
    if (page === 'dashboard') {
        setTimeout(() => {
            if (valueChart) valueChart.resize();
            if (efficiencyChart) efficiencyChart.resize();
        }, 100);
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('Eco-Vault 360 Application Initializing...');
    initializeValueChart();
    initializeEfficiencyChart();
    
    document.getElementById('item-input').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            classifyItem();
        }
    });
    
    // Initialize image upload handler if element exists
    const imageUploadInput = document.getElementById('image-upload');
    if (imageUploadInput) {
        imageUploadInput.addEventListener('change', processImageSimulation);
        console.log('✓ Image upload handler initialized');
    }
    
    updateUIMetrics();
    console.log('✓ Application Ready');
});
