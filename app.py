from flask import Flask, jsonify, request
from datetime import datetime
import os

app = Flask(__name__, static_folder='.', static_url_path='')

VALUE_PER_TONNE_INR = 6250000
AI_ACCURACY = 0.95
COPPER_RECOVERY_TARGET = 0.995
OPERATIONAL_COST_PER_TONNE = 850000
DISPOSAL_COST_PER_TONNE = 120000

app_state = {
    'totalItems': 0,
    'totalTonnes': 0,
    'totalValue': 0,
    'classificationCounts': {'A': 0, 'B': 0, 'C': 0, 'D': 0},
    'timeSeriesData': {'labels': [], 'values': []},
    'currentTime': 0,
    'startTime': datetime.now().isoformat()
}

@app.route('/')
def index():
    with open('index.html', 'r', encoding='utf-8') as f:
        return f.read()

@app.route('/style.css')
def style():
    with open('style.css', 'r', encoding='utf-8') as f:
        return f.read(), 200, {'Content-Type': 'text/css'}

@app.route('/script.js')
def script():
    with open('script.js', 'r', encoding='utf-8') as f:
        return f.read(), 200, {'Content-Type': 'application/javascript'}

@app.route('/api/state', methods=['GET'])
def get_state():
    return jsonify(app_state)

@app.route('/api/metrics', methods=['GET'])
def get_metrics():
    metrics = {
        'totalItems': app_state['totalItems'],
        'recoveryItems': app_state['classificationCounts']['C'],
        'totalTonnes': round(app_state['totalTonnes'], 3),
        'totalValue': app_state['totalValue'],
        'totalValueLakh': round(app_state['totalValue'] / 100000, 2),
        'classificationBreakdown': app_state['classificationCounts']
    }
    return jsonify(metrics)

@app.route('/api/classify', methods=['POST'])
def classify_item():
    try:
        data = request.get_json()
        item_name = data.get('item_name', '')
        classification = data.get('classification', '')
        
        if not item_name or classification not in ['A', 'B', 'C', 'D']:
            return jsonify({'error': 'Invalid input'}), 400
        
        app_state['totalItems'] += 1
        app_state['classificationCounts'][classification] += 1
        
        if classification == 'C':
            import random
            item_mass = random.uniform(0.1, 5.0)
            item_tonnes = item_mass / 1000
            app_state['totalTonnes'] += item_tonnes
        
        app_state['totalValue'] = (
            app_state['totalTonnes'] * VALUE_PER_TONNE_INR * COPPER_RECOVERY_TARGET
        )
        
        app_state['currentTime'] += 1
        app_state['timeSeriesData']['labels'].append(f"Click {app_state['currentTime']}")
        app_state['timeSeriesData']['values'].append(app_state['totalValue'] / 100000)
        
        return jsonify({'success': True, 'state': app_state})
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    print("=" * 70)
    print(" Eco-Vault 360 - Digital Twin for E-Waste Triage")
    print("=" * 70)
    print("\n Flask server starting...")
    print("\n Access from THIS device:")
    print("   http://localhost:5000")
    print("\n Access from OTHER devices on your network:")
    print("   http://<your-machine-ip>:5000")
    print("   (Find your IP: ipconfig on Windows, ifconfig on Mac/Linux)")
    print("\n Example: http://192.168.1.100:5000")
    print("=" * 70 + "\n")
    
    app.run(debug=True, host='0.0.0.0', port=5000)
