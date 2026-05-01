import os
import joblib
import pandas as pd
import numpy as np
from flask import Flask, render_template, request, jsonify, session, redirect, url_for

app = Flask(__name__)
app.secret_key = 'walmart-forecast-2024'
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Load Model
MODEL_PATH = os.path.join(BASE_DIR, 'models', 'model.pkl')
model = joblib.load(MODEL_PATH)

# Features array
FEATURE_COLS = [
    'CPI', 'Day', 'Dept', 'Fuel_Price', 'IsHoliday_True', 
    'Month', 'Size', 'Store', 'Temperature', 'Unemployment', 'Year'
]

# Load Historical Data
TRAIN_PATH = os.path.join(BASE_DIR, 'data', 'train.csv')
sales_history = []
if os.path.exists(TRAIN_PATH):
    df = pd.read_csv(TRAIN_PATH)
    df['Date'] = pd.to_datetime(df['Date'])
    df['Month_Year'] = df['Date'].dt.to_period('M').astype(str)
    trend = df.groupby('Month_Year')['Weekly_Sales'].mean().reset_index()
    sales_history = [{'month': row['Month_Year'], 'avg_sales': round(row['Weekly_Sales'], 2)} for _, row in trend.iterrows()]

# Helper safely parse empty strings to avoid error
def safe_float(val, default=0.0):
    try: return float(val) if val != "" else default
    except: return default

def safe_int(val, default=1):
    try: return int(val) if val != "" else default
    except: return default

@app.route('/')
def landing():
    return render_template('landing.html', sales_history=sales_history)

@app.route('/predict-form')
def predict_form():
    return render_template('predict.html', sales_history=sales_history)

@app.route('/result')
def result():
    pred_data = session.get('prediction')
    if not pred_data:
        return redirect(url_for('predict_form'))
    return render_template('result.html', pred=pred_data, sales_history=sales_history)

@app.route('/api/predict', methods=['POST'])
def api_predict():
    try:
        form = request.get_json()
        
        input_dict = {
            'CPI': safe_float(form.get('cpi'), 200.0),
            'Day': safe_int(form.get('day'), 15),
            'Dept': safe_int(form.get('dept'), 1),
            'Fuel_Price': safe_float(form.get('fuel_price'), 3.5),
            'IsHoliday_True': 1.0 if str(form.get('is_holiday', 'false')).lower() == 'true' else 0.0,
            'Month': safe_int(form.get('month'), 6),
            'Size': safe_float(form.get('size'), 150000.0),
            'Store': safe_int(form.get('store'), 1),
            'Temperature': safe_float(form.get('temperature'), 60.0),
            'Unemployment': safe_float(form.get('unemployment'), 7.0),
            'Year': safe_int(form.get('year'), 2012)
        }
        
        X = np.array([[input_dict[col] for col in FEATURE_COLS]])
        pred_val = float(model.predict(X)[0])
        
        result = {
            'prediction': round(pred_val, 2),
            'inputs': form
        }
        
        session['prediction'] = result
        return jsonify(result)
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5000)