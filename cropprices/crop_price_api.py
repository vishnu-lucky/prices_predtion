from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

model = joblib.load('C:\\Users\\vishnu lucky\\Desktop\\crop\\cropprices\\crop_price_prediction_model.pkl')

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()

        required_fields = ['year', 'month', 'cp', 'rainfall', 'yields']
        for field in required_fields:
            if field not in data:
                return jsonify({'error': f'Missing required field: {field}'}), 400

        input_data = pd.DataFrame(data, index=[0])

        prediction = model.predict(input_data)

        return jsonify({'prediction': prediction[0]})

    except Exception as e:
        error_message = str(e)
        print(f"Error predicting crop price: {error_message}")
        return jsonify({'error': error_message}), 500

df = pd.read_excel('C:\\Users\\vishnu lucky\\Desktop\\crop\\cropprices\\present.xlsx')

@app.route('/get_present_price', methods=['POST'])
def get_present_price():
    try:
        data = request.get_json()
        crop_name = data.get('cp')

        print(f"Received request for crop: {crop_name}")  

      
        row = df[df['cp'] == crop_name]

        if not row.empty:
            present_price = row['prices'].values[0]
            print(f"Present price for {crop_name}: {present_price}")  
            return jsonify({'presentPrice': str(present_price)})
        else:
            return jsonify({'error': 'Present price not available for the selected crop'}), 404

    except Exception as e:
        error_message = str(e)
        print(f"Error getting present price: {error_message}")
        return jsonify({'error': error_message}), 500

if __name__ == '__main__':
    app.run(host='192.168.238.59', port=5000)
