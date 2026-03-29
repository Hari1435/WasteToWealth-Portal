import pandas as pd
import numpy as np
import random
import os
from datetime import datetime, timedelta

# Set random seed for reproducibility
np.random.seed(42)
random.seed(42)

# Create dataset directory if it doesn't exist
os.makedirs('dataset', exist_ok=True)

def generate_truck_recommendation_dataset(n_samples=10000):
    """
    Generate synthetic dataset for truck recommendation based on:
    - Distance (km)
    - Quantity (tons)
    - Truck type classification
    """
    
    # Set random seed for reproducibility
    np.random.seed(42)
    random.seed(42)
    
    # Define truck types and their characteristics
    truck_types = {
        'mini_pickup': {'capacity_range': (0.5, 2), 'distance_range': (5, 50), 'cost_per_km': 8},
        'small_pickup': {'capacity_range': (1, 3), 'distance_range': (10, 80), 'cost_per_km': 12},
        'medium_truck': {'capacity_range': (2, 10), 'distance_range': (20, 200), 'cost_per_km': 18},
        'large_truck': {'capacity_range': (5, 20), 'distance_range': (50, 300), 'cost_per_km': 25},
        'heavy_truck': {'capacity_range': (10, 30), 'distance_range': (100, 500), 'cost_per_km': 35}
    }
    
    data = []
    
    for _ in range(n_samples):
        # Generate base parameters
        distance = np.random.uniform(5, 500)  # 5-500 km
        quantity = np.random.uniform(0.5, 30)  # 0.5-30 tons
        
        # Determine optimal truck type based on business rules
        optimal_truck = determine_optimal_truck(distance, quantity, truck_types)
        
        # Add some realistic variations and edge cases
        region_type = random.choice(['urban', 'suburban', 'rural'])
        time_factor = np.random.uniform(0.8, 1.5)  # Traffic/weather factor
        
        # Calculate estimated cost
        truck_info = truck_types[optimal_truck]
        base_cost = truck_info['cost_per_km'] * distance
        
        # Apply modifiers
        region_multiplier = {'urban': 1.3, 'suburban': 1.1, 'rural': 1.0}[region_type]
        quantity_factor = 1 + (quantity / 20) * 0.2  # Slight increase for higher quantities
        
        estimated_cost = base_cost * region_multiplier * quantity_factor * time_factor
        
        # Add some noise to make it more realistic
        estimated_cost += np.random.normal(0, estimated_cost * 0.1)
        estimated_cost = max(50, estimated_cost)  # Minimum cost
        
        data.append({
            'distance_km': round(distance, 2),
            'quantity_tons': round(quantity, 2),
            'region_type': region_type,
            'time_factor': round(time_factor, 2),
            'optimal_truck_type': optimal_truck,
            'estimated_cost': round(estimated_cost, 2),
            'truck_capacity': truck_info['capacity_range'][1],  # Max capacity
            'cost_per_km': truck_info['cost_per_km']
        })
    
    return pd.DataFrame(data)

def determine_optimal_truck(distance, quantity, truck_types):
    """
    Determine optimal truck type based on business logic
    """
    # Rule-based classification
    if quantity <= 2 and distance <= 50:
        return 'mini_pickup'
    elif quantity <= 3 and distance <= 80:
        return 'small_pickup'
    elif quantity <= 10 and distance <= 200:
        return 'medium_truck'
    elif quantity <= 20 and distance <= 300:
        return 'large_truck'
    else:
        return 'heavy_truck'

def add_realistic_variations(df):
    """
    Add realistic variations and edge cases to the dataset
    """
    # Add some suboptimal choices (real-world scenarios)
    n_variations = len(df) // 10  # 10% variations
    
    for i in range(n_variations):
        idx = random.randint(0, len(df) - 1)
        
        # Sometimes people choose larger trucks for small loads (safety margin)
        if df.loc[idx, 'optimal_truck_type'] == 'mini_pickup' and random.random() < 0.3:
            df.loc[idx, 'optimal_truck_type'] = 'small_pickup'
        
        # Sometimes smaller trucks are used for cost savings
        elif df.loc[idx, 'optimal_truck_type'] == 'large_truck' and random.random() < 0.2:
            df.loc[idx, 'optimal_truck_type'] = 'medium_truck'
    
    return df

if __name__ == "__main__":
    print("Generating truck recommendation training dataset...")
    
    # Generate dataset
    df = generate_truck_recommendation_dataset(10000)
    
    # Add realistic variations
    df = add_realistic_variations(df)
    
    # Save dataset
    output_file = 'dataset/truck_recommendation_dataset.csv'
    df.to_csv(output_file, index=False)
    
    # Display dataset info
    print(f"Dataset shape: {df.shape}")
    print(f"Dataset saved to: {output_file}")
    print(f"\nTruck type distribution:")
    print(df['optimal_truck_type'].value_counts())
    
    # Print sample data
    print("\nSample data:")
    print(df.head(10))
    
    # Print statistics
    print("\nDataset Statistics:")
    print(df.describe())
    
    # Create a smaller test dataset
    test_df = df.sample(n=2000, random_state=42)
    test_df.to_csv('dataset/truck_recommendation_test.csv', index=False)
    print("\nTest dataset saved to: dataset/truck_recommendation_test.csv")
    
    print("\nTraining dataset generated successfully!")
    print("Next step: Run 'python train_models.py' to train the ML models")
