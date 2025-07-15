"""Very basic bias check on training data."""
import pandas as pd


def check_bias(csv_path: str) -> pd.Series:
    df = pd.read_csv(csv_path)
    # Example: check default rates by age bucket
    df['age_bucket'] = pd.cut(df['age'], bins=[0, 25, 35, 50, 100], labels=['<25', '25-35', '35-50', '50+'])
    return df.groupby('age_bucket')['default'].mean()
