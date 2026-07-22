import pandas as pd
import numpy as np

class HouseDataset:
    """Class to manage the house price dataset."""
    
    def __init__(self, house_path, location_path):
        self.house_path = house_path
        self.location_path = location_path
        self.df = None
        self.loc_df = None
        self.operations = []

    def load_data(self):
        """Loads datasets from CSV files."""
        try:
            self.df = pd.read_csv(self.house_path)
            self.loc_df = pd.read_csv(self.location_path)
            msg = f"Dataset loaded successfully with {len(self.df)} records."
            print(msg)
            self.operations.append(msg)
        except FileNotFoundError as e:
            print(f"Error loading dataset: {e}")
            self.df = None

    def view_dataset(self, num_rows=5):
        """Displays the first few rows of the dataset."""
        if self.df is not None:
            print("\n--- House Prices Dataset ---")
            print(self.df.head(num_rows))
        else:
            print("Dataset not loaded. Please load the dataset first.")

    def clean_dataset(self):
        """Performs basic data cleaning."""
        if self.df is None:
            print("Dataset not loaded.")
            return

        initial_rows = len(self.df)
        
        # 1. Remove duplicates
        self.df.drop_duplicates(inplace=True)
        dup_msg = f"Removed {initial_rows - len(self.df)} duplicate records."
        self.operations.append(dup_msg)
        print(dup_msg)
        
        # 2. Handle missing values
        missing_count = self.df.isnull().sum().sum()
        # Fill missing numeric values with the median of the column
        numeric_cols = self.df.select_dtypes(include=[np.number]).columns
        for col in numeric_cols:
            if self.df[col].isnull().sum() > 0:
                median_val = self.df[col].median()
                self.df[col] = self.df[col].fillna(median_val)
                
        # Fill categorical with mode
        cat_cols = self.df.select_dtypes(include=['object']).columns
        for col in cat_cols:
            if self.df[col].isnull().sum() > 0:
                mode_val = self.df[col].mode()[0]
                self.df[col] = self.df[col].fillna(mode_val)
                
        miss_msg = f"Filled {missing_count} missing values with column medians/modes."
        self.operations.append(miss_msg)
        print(miss_msg)
                
        # Merge with location info
        self.df = pd.merge(self.df, self.loc_df, on='Location', how='left')
        merge_msg = "Merged dataset with location statistics (CrimeRate, SchoolRating)."
        self.operations.append(merge_msg)
        print(merge_msg)
        
        print("Dataset cleaning completed.")

    def get_data(self):
        """Returns the current dataframe."""
        return self.df
        
    def get_operations(self):
        """Returns the list of operations performed."""
        return self.operations

class NetflixDataset:
    """Class to manage the Netflix dataset."""
    
    def __init__(self, netflix_path):
        self.netflix_path = netflix_path
        self.df = None
        self.operations = []

    def load_data(self):
        try:
            self.df = pd.read_csv(self.netflix_path)
            msg = f"Dataset loaded successfully with {len(self.df)} records."
            print(msg)
            self.operations.append(msg)
        except FileNotFoundError as e:
            print(f"Error loading dataset: {e}")
            self.df = None

    def clean_dataset(self):
        if self.df is None:
            print("Dataset not loaded.")
            return

        initial_rows = len(self.df)
        
        # 1. Remove duplicates
        self.df.drop_duplicates(inplace=True)
        dup_msg = f"Removed {initial_rows - len(self.df)} duplicate records."
        self.operations.append(dup_msg)
        print(dup_msg)
        
        # 2. Handle missing categorical values
        missing_count = self.df.isnull().sum().sum()
        cat_cols = ['Director', 'Country']
        for col in cat_cols:
            if self.df[col].isnull().sum() > 0:
                self.df[col] = self.df[col].fillna('Unknown')
                
        miss_msg = f"Filled {missing_count} missing values in Director/Country with 'Unknown'."
        self.operations.append(miss_msg)
        print(miss_msg)
        
        print("Netflix dataset cleaning completed.")

    def get_data(self):
        return self.df
        
    def get_operations(self):
        return self.operations
