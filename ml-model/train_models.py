import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split, cross_val_score, GridSearchCV
from sklearn.tree import DecisionTreeClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import LabelEncoder, StandardScaler
from sklearn.metrics import classification_report, confusion_matrix, accuracy_score
import xgboost as xgb
import joblib
import json
import os
import warnings
warnings.filterwarnings('ignore')

# Try to import matplotlib, but don't fail if it's not available
try:
    import matplotlib.pyplot as plt
    import seaborn as sns
    PLOTTING_AVAILABLE = True
except ImportError:
    PLOTTING_AVAILABLE = False
    print("Matplotlib/Seaborn not available. Plots will be skipped.")

# Create necessary directories
os.makedirs('models', exist_ok=True)
os.makedirs('results', exist_ok=True)

class TruckRecommendationModel:
    def __init__(self):
        self.models = {}
        self.label_encoder = LabelEncoder()
        self.region_encoder = LabelEncoder()
        self.scaler = StandardScaler()
        self.feature_names = ['distance_km', 'quantity_tons', 'region_encoded', 'time_factor']
        self.truck_types = ['mini_pickup', 'small_pickup', 'medium_truck', 'large_truck', 'heavy_truck']
        self.model_scores = {}
        
    def load_and_preprocess_data(self, file_path):
        """Load and preprocess the training data"""
        print("Loading and preprocessing data...")
        
        try:
            df = pd.read_csv(file_path)
            print(f"Loaded dataset with {len(df)} samples")
        except FileNotFoundError:
            print(f"Error: Dataset file '{file_path}' not found.")
            print("Please run 'python generate_training_data.py' first to create the dataset.")
            return None, None, None
        
        # Check for required columns
        required_cols = ['distance_km', 'quantity_tons', 'region_type', 'time_factor', 'optimal_truck_type']
        missing_cols = [col for col in required_cols if col not in df.columns]
        if missing_cols:
            print(f"Error: Missing required columns: {missing_cols}")
            return None, None, None
        
        # Encode categorical variables
        df['region_encoded'] = self.region_encoder.fit_transform(df['region_type'])
        
        # Prepare features and target
        X = df[['distance_km', 'quantity_tons', 'region_encoded', 'time_factor']]
        y = df['optimal_truck_type']
        
        # Encode target variable
        y_encoded = self.label_encoder.fit_transform(y)
        
        # Scale features with proper feature names
        X_scaled = self.scaler.fit_transform(X)
        
        print(f"Dataset shape: {X.shape}")
        print(f"Target classes: {self.label_encoder.classes_}")
        print(f"Class distribution:")
        print(pd.Series(y).value_counts())
        
        return X_scaled, y_encoded, df
    
    def train_decision_tree(self, X_train, y_train, X_test, y_test):
        """Train Decision Tree model with hyperparameter tuning"""
        print("\nTraining Decision Tree model...")
        
        # Hyperparameter tuning
        param_grid = {
            'max_depth': [5, 10, 15, 20, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4],
            'criterion': ['gini', 'entropy']
        }
        
        dt = DecisionTreeClassifier(random_state=42)
        grid_search = GridSearchCV(dt, param_grid, cv=5, scoring='accuracy', n_jobs=-1)
        grid_search.fit(X_train, y_train)
        
        best_dt = grid_search.best_estimator_
        
        # Evaluate
        train_score = best_dt.score(X_train, y_train)
        test_score = best_dt.score(X_test, y_test)
        cv_scores = cross_val_score(best_dt, X_train, y_train, cv=5)
        
        print(f"Best parameters: {grid_search.best_params_}")
        print(f"Training accuracy: {train_score:.4f}")
        print(f"Test accuracy: {test_score:.4f}")
        print(f"Cross-validation score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        self.models['decision_tree'] = best_dt
        return best_dt
    
    def train_random_forest(self, X_train, y_train, X_test, y_test):
        """Train Random Forest model with hyperparameter tuning"""
        print("\nTraining Random Forest model...")
        
        # Hyperparameter tuning
        param_grid = {
            'n_estimators': [50, 100, 200],
            'max_depth': [10, 15, 20, None],
            'min_samples_split': [2, 5, 10],
            'min_samples_leaf': [1, 2, 4]
        }
        
        rf = RandomForestClassifier(random_state=42)
        grid_search = GridSearchCV(rf, param_grid, cv=3, scoring='accuracy', n_jobs=-1)
        grid_search.fit(X_train, y_train)
        
        best_rf = grid_search.best_estimator_
        
        # Evaluate
        train_score = best_rf.score(X_train, y_train)
        test_score = best_rf.score(X_test, y_test)
        cv_scores = cross_val_score(best_rf, X_train, y_train, cv=5)
        
        print(f"Best parameters: {grid_search.best_params_}")
        print(f"Training accuracy: {train_score:.4f}")
        print(f"Test accuracy: {test_score:.4f}")
        print(f"Cross-validation score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        # Feature importance
        feature_importance = pd.DataFrame({
            'feature': self.feature_names,
            'importance': best_rf.feature_importances_
        }).sort_values('importance', ascending=False)
        
        print("\nFeature Importance:")
        print(feature_importance)
        
        self.models['random_forest'] = best_rf
        return best_rf
    
    def train_xgboost(self, X_train, y_train, X_test, y_test):
        """Train XGBoost model with hyperparameter tuning"""
        print("\nTraining XGBoost model...")
        
        # Hyperparameter tuning
        param_grid = {
            'n_estimators': [100, 200],
            'max_depth': [3, 6, 9],
            'learning_rate': [0.01, 0.1, 0.2],
            'subsample': [0.8, 1.0]
        }
        
        xgb_model = xgb.XGBClassifier(random_state=42, eval_metric='mlogloss')
        grid_search = GridSearchCV(xgb_model, param_grid, cv=3, scoring='accuracy', n_jobs=-1)
        grid_search.fit(X_train, y_train)
        
        best_xgb = grid_search.best_estimator_
        
        # Evaluate
        train_score = best_xgb.score(X_train, y_train)
        test_score = best_xgb.score(X_test, y_test)
        cv_scores = cross_val_score(best_xgb, X_train, y_train, cv=5)
        
        print(f"Best parameters: {grid_search.best_params_}")
        print(f"Training accuracy: {train_score:.4f}")
        print(f"Test accuracy: {test_score:.4f}")
        print(f"Cross-validation score: {cv_scores.mean():.4f} (+/- {cv_scores.std() * 2:.4f})")
        
        self.models['xgboost'] = best_xgb
        return best_xgb
    
    def evaluate_models(self, X_test, y_test):
        """Evaluate all trained models"""
        print("\n" + "="*50)
        print("MODEL EVALUATION SUMMARY")
        print("="*50)
        
        results = {}
        
        for name, model in self.models.items():
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            results[name] = accuracy
            
            print(f"\n{name.upper()} MODEL:")
            print(f"Accuracy: {accuracy:.4f}")
            print("\nClassification Report:")
            print(classification_report(y_test, y_pred, target_names=self.label_encoder.classes_))
        
        # Find best model
        best_model_name = max(results, key=results.get)
        best_accuracy = results[best_model_name]
        
        print(f"\nBEST MODEL: {best_model_name.upper()} (Accuracy: {best_accuracy:.4f})")
        
        return results, best_model_name
    
    def save_models(self, model_dir='models'):
        """Save all trained models and preprocessors"""
        os.makedirs(model_dir, exist_ok=True)
        
        # Save models
        for name, model in self.models.items():
            joblib.dump(model, f'{model_dir}/{name}_model.joblib')
            print(f"Saved {name} model to {model_dir}/{name}_model.joblib")
        
        # Save preprocessors
        joblib.dump(self.label_encoder, f'{model_dir}/label_encoder.joblib')
        joblib.dump(self.region_encoder, f'{model_dir}/region_encoder.joblib')
        joblib.dump(self.scaler, f'{model_dir}/scaler.joblib')
        
        # Save feature names and truck types
        joblib.dump(self.feature_names, f'{model_dir}/feature_names.joblib')
        joblib.dump(self.truck_types, f'{model_dir}/truck_types.joblib')
        
        # Save model performance
        performance_data = {}
        for name, score in self.model_scores.items():
            performance_data[name] = {
                'accuracy': score,
                'trained_at': pd.Timestamp.now().isoformat()
            }
        
        with open(f'{model_dir}/../results/model_performance.json', 'w') as f:
            json.dump(performance_data, f, indent=2)
        
        print(f"All models and preprocessors saved to {model_dir}/")
    
    def predict_truck_type(self, distance_km, quantity_tons, region_type='suburban', time_factor=1.0, model_name='random_forest'):
        """Predict truck type for given parameters"""
        try:
            # Encode region using the fitted encoder
            region_encoded = self.region_encoder.transform([region_type])[0]
            
            # Prepare features with proper DataFrame to avoid warnings
            import pandas as pd
            feature_names = ['distance_km', 'quantity_tons', 'region_encoded', 'time_factor']
            features_df = pd.DataFrame(
                [[distance_km, quantity_tons, region_encoded, time_factor]], 
                columns=feature_names
            )
            features_scaled = self.scaler.transform(features_df)
            
            # Predict
            model = self.models[model_name]
            prediction = model.predict(features_scaled)[0]
            probabilities = model.predict_proba(features_scaled)[0]
            
            # Get truck type name
            truck_type = self.label_encoder.inverse_transform([prediction])[0]
            
            # Get confidence scores for all truck types
            confidence_scores = {}
            for i, truck in enumerate(self.label_encoder.classes_):
                confidence_scores[truck] = float(probabilities[i])
            
            return {
                'recommended_truck': truck_type,
                'confidence': float(probabilities[prediction]),
                'all_probabilities': confidence_scores
            }
        except Exception as e:
            print(f"Error in prediction: {e}")
            return None

def main():
    print("Starting Truck Recommendation Model Training")
    print("=" * 50)
    
    # Initialize model trainer
    trainer = TruckRecommendationModel()
    
    # Load and preprocess data
    X, y, df = trainer.load_and_preprocess_data('dataset/truck_recommendation_dataset.csv')
    
    if X is None:
        print("Failed to load data. Exiting.")
        return
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42, stratify=y)
    
    print(f"\nTraining set size: {X_train.shape[0]}")
    print(f"Test set size: {X_test.shape[0]}")
    
    # Train models
    print("\nTraining models...")
    trainer.train_decision_tree(X_train, y_train, X_test, y_test)
    trainer.train_random_forest(X_train, y_train, X_test, y_test)
    trainer.train_xgboost(X_train, y_train, X_test, y_test)
    
    # Evaluate models
    print("\nEvaluating models...")
    results, best_model = trainer.evaluate_models(X_test, y_test)
    
    # Save models
    print("\nSaving models...")
    trainer.save_models()
    
    # Test predictions
    print("\n" + "="*50)
    print("SAMPLE PREDICTIONS")
    print("="*50)
    
    test_cases = [
        (15, 1.5, 'urban', 1.0),      # Small load, short distance
        (100, 5, 'suburban', 1.2),    # Medium load, medium distance
        (250, 15, 'rural', 0.9),      # Large load, long distance
        (50, 0.8, 'suburban', 1.1),   # Very small load
        (400, 25, 'rural', 1.3)       # Very large load, very long distance
    ]
    
    for distance, quantity, region, time_factor in test_cases:
        result = trainer.predict_truck_type(distance, quantity, region, time_factor, best_model)
        print(f"\nDistance: {distance}km, Quantity: {quantity}t, Region: {region}")
        print(f"Recommended: {result['recommended_truck']} (Confidence: {result['confidence']:.3f})")
    
    print("\n" + "="*50)
    print("TRAINING COMPLETED SUCCESSFULLY!")
    print("="*50)
    print("\nNext steps:")
    print("1. Test models: python test_models.py")
    print("2. Start API server: python model_api.py")
    print("3. Integrate with your web application")

if __name__ == "__main__":
    main()
