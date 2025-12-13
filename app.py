from flask import Flask, render_template, jsonify, request
from datetime import datetime

app = Flask(__name__)

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
    return render_template('index.html')

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
    print("Eco-Vault 360 Flask Server Started")
    print(f"Access at: http://localhost:5000")
    app.run(debug=True, host='localhost', port=5000)
