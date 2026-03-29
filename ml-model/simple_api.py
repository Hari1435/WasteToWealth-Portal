from flask import Flask, request, jsonify
from flask_cors import CORS
import pandas as pd
import numpy as np
import joblib
import os
import traceback

app = Flask(__name__)
CORS(app)

# Global variables for models
models = {}
label_encoder = None
region_encoder = None
scaler = None

def load_models():
    """Load all models and preprocessors"""
    global models, label_encoder, region_encoder, scaler
    
    try:
        print("Loading models...")
        
        # Load preprocessors
        label_encoder = joblib.load('models/label_encoder.joblib')
        region_encoder = joblib.load('models/region_encoder.joblib')
        scaler = joblib.load('models/scaler.joblib')
        print("✅ Preprocessors loaded")
        
        # Load models
        models['xgboost'] = joblib.load('models/xgboost_model.joblib')
        models['random_forest'] = joblib.load('models/random_forest_model.joblib')
        models['decision_tree'] = joblib.load('models/decision_tree_model.joblib')
        print(f"✅ Loaded {len(models)} models")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        traceback.print_exc()
        return False

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        'status': 'healthy',
        'models_loaded': len(models),
        'available_models': list(models.keys())
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        print("\n=== PREDICTION REQUEST ===")
        
        # Get request data
        data = request.get_json()
        print(f"Request data: {data}")
        
        if not data:
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Validate required parameters
        if 'distance' not in data or 'quantity' not in data:
            return jsonify({'error': 'Missing required parameters: distance and quantity'}), 400
        
        # Extract parameters (only distance and quantity required)
        distance = float(data.get('distance', 0))
        quantity = float(data.get('quantity', 0))
        
        # Use default values for other parameters
        region_type = 'suburban'  # Default region
        time_factor = 1.0  # Default time factor
        model_name = data.get('model', 'xgboost')
        
        print(f"Parameters: distance={distance}, quantity={quantity}, model={model_name}")
        
        # Validate required parameters only
        if distance <= 0 or quantity <= 0:
            return jsonify({'error': 'Distance and quantity must be positive'}), 400
        
        if model_name not in models:
            return jsonify({'error': f'Model {model_name} not available'}), 400
        
        # Encode region
        region_encoded = region_encoder.transform([region_type])[0]
        print(f"Region encoded: {region_encoded}")
        
        # Create features DataFrame
        feature_names = ['distance_km', 'quantity_tons', 'region_encoded', 'time_factor']
        features_df = pd.DataFrame(
            [[distance, quantity, region_encoded, time_factor]], 
            columns=feature_names
        )
        print(f"Features: {features_df.values}")
        
        # Scale features
        features_scaled = scaler.transform(features_df)
        print(f"Scaled features: {features_scaled}")
        
        # Make prediction
        model = models[model_name]
        prediction = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]
        
        # Decode prediction
        truck_type = label_encoder.inverse_transform([prediction])[0]
        confidence = float(probabilities[prediction])
        
        print(f"Prediction: {truck_type} (confidence: {confidence:.3f})")
        
        # Create response
        result = {
            'success': True,
            'prediction': {
                'predicted_truck_type': truck_type,
                'confidence': confidence,
                'input_parameters': {
                    'distance_km': distance,
                    'quantity_tons': quantity
                }
            }
        }
        
        return jsonify(result)
        
    except Exception as e:
        print(f"❌ Error in prediction: {e}")
        traceback.print_exc()
        return jsonify({
            'error': f'Prediction failed: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("Starting Simple ML API...")
    
    if load_models():
        print("✅ Models loaded successfully!")
        print("\nAPI Endpoints:")
        print("  GET  /health")
        print("  POST /predict")
        print("\nExample request:")
        print('curl -X POST http://localhost:10000/predict \\')
        print('  -H "Content-Type: application/json" \\')
        print('  -d \'{"distance": 150, "quantity": 8.5}\'')
        
        port = int(os.environ.get("PORT", 10000))  # ✅ IMPORTANT
        app.run(host='0.0.0.0', port=port)
    else:
        print("❌ Failed to load models. Please run 'python train_models.py' first.")
