from flask import Flask, render_template, request, jsonify
from datetime import datetime, timedelta

app = Flask(__name__)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/calculate_oee', methods=['POST'])
def calculate_oee():
    data = request.json
    
    shift_start = datetime.strptime(data['shiftStart'], "%H:%M")
    shift_end = datetime.strptime(data['shiftEnd'], "%H:%M")
    if shift_end < shift_start:
        shift_end += timedelta(days=1)
    
    shift_length = (shift_end - shift_start).total_seconds() / 60
    planned_production_time = shift_length - data['plannedDowntime']
    operating_time = planned_production_time - data['unplannedDowntime']
    
    availability = operating_time / planned_production_time

    if data['mode'] == 'weight':
        ideal_rate = data['idealRateValue'] / data['idealRateTime']  # kg/min
        ideal_production = operating_time * ideal_rate
        performance = data['totalProduced'] / ideal_production
    else:  # quantity mode
        ideal_rate = data['idealRateValue'] / data['idealRateTime']  # min/ea
        ideal_production = operating_time / ideal_rate
        performance = data['totalProduced'] / ideal_production

    quality = (data['totalProduced'] - data['totalScrap']) / data['totalProduced']
    
    oee = availability * performance * quality
    
    capacity = round(ideal_production, 1)
    
    result = {
        'oee': round(oee * 100, 1),
        'capacity': capacity,
        'totalProduced': data['totalProduced'],
        'performance': round(performance * 100, 1),
        'quality': round(quality * 100, 1),
        'availability': round(availability * 100, 1)
    }
    
    return jsonify(result)

if __name__ == '__main__':
    app.run(debug=True)