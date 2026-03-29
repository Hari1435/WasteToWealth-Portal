import pandas as pd
import numpy as np
import joblib
import os
import json

class TruckRecommendationPredictor:
    def __init__(self, models_dir='models'):
        self.models_dir = models_dir
        self.models = {}
        self.label_encoder = None
        self.region_encoder = None
        self.scaler = None
        self.load_models()
    
    def load_models(self):
        """Load all trained models and preprocessing objects"""
        try:
            # Load preprocessing objects
            self.label_encoder = joblib.load(os.path.join(self.models_dir, 'label_encoder.joblib'))
            self.region_encoder = joblib.load(os.path.join(self.models_dir, 'region_encoder.joblib'))
            self.scaler = joblib.load(os.path.join(self.models_dir, 'scaler.joblib'))
            
            # Load models
            model_files = {
                'decision_tree': 'decision_tree_model.joblib',
                'random_forest': 'random_forest_model.joblib',
                'xgboost': 'xgboost_model.joblib'
            }
            
            for model_name, filename in model_files.items():
                model_path = os.path.join(self.models_dir, filename)
                if os.path.exists(model_path):
                    self.models[model_name] = joblib.load(model_path)
                    print(f"Loaded {model_name} model")
                else:
                    print(f"Warning: {model_name} model not found at {model_path}")
            
            print(f"Successfully loaded {len(self.models)} models")
            
        except Exception as e:
            print(f"Error loading models: {e}")
            print("Please ensure models are trained first by running 'python train_models.py'")
    
    def preprocess_input(self, distance, quantity, region_type='urban', time_factor=1.0):
        """Preprocess input data for prediction"""
        try:
            # Encode region type
            region_encoded = self.region_encoder.transform([region_type])[0]
            
            # Create feature array with proper column names
            import pandas as pd
            feature_names = ['distance_km', 'quantity_tons', 'region_encoded', 'time_factor']
            features_df = pd.DataFrame(
                [[distance, quantity, region_encoded, time_factor]], 
                columns=feature_names
            )
            
            # Scale features
            features_scaled = self.scaler.transform(features_df)
            
            return features_scaled
            
        except Exception as e:
            print(f"Error preprocessing input: {e}")
            return None
    
    def predict_truck_type(self, distance, quantity, region_type='urban', time_factor=1.0, model_name='random_forest'):
        """Predict truck type for given parameters"""
        if model_name not in self.models:
            print(f"Model '{model_name}' not available. Available models: {list(self.models.keys())}")
            return None
        
        # Preprocess input
        features = self.preprocess_input(distance, quantity, region_type, time_factor)
        if features is None:
            return None
        
        try:
            # Make prediction
            prediction = self.models[model_name].predict(features)[0]
            
            # Get prediction probabilities if available
            if hasattr(self.models[model_name], 'predict_proba'):
                probabilities = self.models[model_name].predict_proba(features)[0]
                prob_dict = dict(zip(self.label_encoder.classes_, probabilities))
            else:
                prob_dict = None
            
            # Decode prediction
            truck_type = self.label_encoder.inverse_transform([prediction])[0]
            
            return {
                'predicted_truck_type': truck_type,
                'confidence': max(probabilities) if prob_dict else None,
                'all_probabilities': prob_dict,
                'input_parameters': {
                    'distance_km': distance,
                    'quantity_tons': quantity,
                    'region_type': region_type,
                    'time_factor': time_factor
                }
            }
            
        except Exception as e:
            print(f"Error making prediction: {e}")
            return None
    
    def compare_models(self, distance, quantity, region_type='urban', time_factor=1.0):
        """Compare predictions from all available models"""
        results = {}
        
        for model_name in self.models.keys():
            prediction = self.predict_truck_type(distance, quantity, region_type, time_factor, model_name)
            if prediction:
                results[model_name] = prediction
        
        return results
    
    def batch_predict(self, test_data, model_name='random_forest'):
        """Make predictions for a batch of test data"""
        predictions = []
        
        for _, row in test_data.iterrows():
            prediction = self.predict_truck_type(
                distance=row['distance_km'],
                quantity=row['quantity_tons'],
                region_type=row.get('region_type', 'urban'),
                time_factor=row.get('time_factor', 1.0),
                model_name=model_name
            )
            predictions.append(prediction)
        
        return predictions

def test_models_with_samples():
    """Test the trained models with sample data"""
    print("Testing Truck Recommendation Models")
    print("=" * 50)
    
    # Initialize predictor
    predictor = TruckRecommendationPredictor()
    
    if not predictor.models:
        print("No models loaded. Please train models first.")
        return
    
    # Test cases
    test_cases = [
        {'distance': 25, 'quantity': 1.5, 'region': 'urban', 'description': 'Small urban delivery'},
        {'distance': 150, 'quantity': 8, 'region': 'suburban', 'description': 'Medium suburban transport'},
        {'distance': 300, 'quantity': 15, 'region': 'rural', 'description': 'Large rural delivery'},
        {'distance': 50, 'quantity': 0.8, 'region': 'urban', 'description': 'Very small urban pickup'},
        {'distance': 400, 'quantity': 25, 'region': 'rural', 'description': 'Heavy long-distance transport'}
    ]
    
    for i, test_case in enumerate(test_cases, 1):
        print(f"\nTest Case {i}: {test_case['description']}")
        print(f"Distance: {test_case['distance']} km, Quantity: {test_case['quantity']} tons")
        print("-" * 40)
        
        # Compare all models
        results = predictor.compare_models(
            distance=test_case['distance'],
            quantity=test_case['quantity'],
            region_type=test_case['region']
        )
        
        for model_name, result in results.items():
            confidence = f" (confidence: {result['confidence']:.2f})" if result['confidence'] else ""
            print(f"{model_name:15}: {result['predicted_truck_type']}{confidence}")

def evaluate_model_performance():
    """Evaluate model performance on test dataset"""
    print("\nEvaluating Model Performance")
    print("=" * 50)
    
    # Load test dataset
    test_file = 'dataset/truck_recommendation_test.csv'
    if not os.path.exists(test_file):
        print(f"Test dataset not found: {test_file}")
        print("Please run 'python generate_training_data.py' first")
        return
    
    test_df = pd.read_csv(test_file)
    print(f"Loaded test dataset with {len(test_df)} samples")
    
    # Initialize predictor
    predictor = TruckRecommendationPredictor()
    
    if not predictor.models:
        print("No models loaded. Please train models first.")
        return
    
    # Evaluate each model
    for model_name in predictor.models.keys():
        print(f"\nEvaluating {model_name}...")
        
        correct_predictions = 0
        total_predictions = 0
        
        for _, row in test_df.iterrows():
            prediction = predictor.predict_truck_type(
                distance=row['distance_km'],
                quantity=row['quantity_tons'],
                region_type=row['region_type'],
                time_factor=row['time_factor'],
                model_name=model_name
            )
            
            if prediction:
                total_predictions += 1
                if prediction['predicted_truck_type'] == row['optimal_truck_type']:
                    correct_predictions += 1
        
        accuracy = correct_predictions / total_predictions if total_predictions > 0 else 0
        print(f"{model_name} accuracy: {accuracy:.3f} ({correct_predictions}/{total_predictions})")

if __name__ == "__main__":
    print("Truck Recommendation Model Testing")
    print("=" * 50)
    
    # Test with sample cases
    test_models_with_samples()
    
    # Evaluate on test dataset
    evaluate_model_performance()
    
    print("\nTesting completed!")
