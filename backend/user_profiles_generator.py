#!/usr/bin/env python3
"""
User Profile Generator for Kifaa Credit Scoring Platform

Generates diverse user profiles for different regions including LATAM and Asia,
with realistic demographic and financial characteristics.
"""

import pandas as pd
import numpy as np
import json
import random
from typing import Dict, List, Any
from datetime import datetime, timedelta
import uuid

class UserProfileGenerator:
    """Generates realistic user profiles for different regions"""
    
    def __init__(self):
        self.regions = {
            'latam': {
                'countries': ['mexico', 'brazil', 'colombia', 'argentina', 'chile', 'peru', 'ecuador'],
                'currencies': ['MXN', 'BRL', 'COP', 'ARS', 'CLP', 'PEN', 'USD'],
                'income_ranges': {
                    'low': (5000, 15000),
                    'medium': (15000, 40000),
                    'high': (40000, 100000),
                    'very_high': (100000, 300000)
                },
                'employment_types': ['formal', 'informal', 'self_employed', 'agricultural', 'service'],
                'education_levels': ['primary', 'secondary', 'technical', 'university', 'postgraduate'],
                'family_sizes': [1, 2, 3, 4, 5, 6, 7, 8],
                'urban_rural_split': 0.7  # 70% urban
            },
            'asia': {
                'countries': ['india', 'indonesia', 'philippines', 'vietnam', 'thailand', 'bangladesh', 'malaysia'],
                'currencies': ['INR', 'IDR', 'PHP', 'VND', 'THB', 'BDT', 'MYR'],
                'income_ranges': {
                    'low': (3000, 12000),
                    'medium': (12000, 35000),
                    'high': (35000, 80000),
                    'very_high': (80000, 250000)
                },
                'employment_types': ['formal', 'informal', 'agricultural', 'manufacturing', 'service', 'tech'],
                'education_levels': ['primary', 'secondary', 'technical', 'university', 'postgraduate'],
                'family_sizes': [2, 3, 4, 5, 6, 7, 8, 9],
                'urban_rural_split': 0.6  # 60% urban
            },
            'africa': {
                'countries': ['nigeria', 'kenya', 'south_africa', 'ghana', 'uganda', 'tanzania', 'rwanda'],
                'currencies': ['NGN', 'KES', 'ZAR', 'GHS', 'UGX', 'TZS', 'RWF'],
                'income_ranges': {
                    'low': (2000, 8000),
                    'medium': (8000, 25000),
                    'high': (25000, 60000),
                    'very_high': (60000, 150000)
                },
                'employment_types': ['formal', 'informal', 'agricultural', 'mining', 'service', 'trade'],
                'education_levels': ['primary', 'secondary', 'technical', 'university'],
                'family_sizes': [3, 4, 5, 6, 7, 8, 9, 10],
                'urban_rural_split': 0.5  # 50% urban
            }
        }
        
        # Common names by region
        self.names = {
            'latam': {
                'first_names': ['Carlos', 'Maria', 'Jose', 'Ana', 'Luis', 'Carmen', 'Miguel', 'Rosa', 
                               'Antonio', 'Elena', 'Francisco', 'Isabel', 'Juan', 'Patricia', 'Pedro'],
                'last_names': ['Garcia', 'Rodriguez', 'Martinez', 'Lopez', 'Gonzalez', 'Hernandez', 
                              'Perez', 'Sanchez', 'Ramirez', 'Cruz', 'Flores', 'Gomez', 'Diaz']
            },
            'asia': {
                'first_names': ['Raj', 'Priya', 'Amit', 'Sita', 'Ravi', 'Lakshmi', 'Suresh', 'Meera',
                               'Arjun', 'Kavya', 'Vikram', 'Anita', 'Rahul', 'Deepika', 'Kiran'],
                'last_names': ['Sharma', 'Patel', 'Singh', 'Kumar', 'Gupta', 'Agarwal', 'Jain',
                              'Reddy', 'Nair', 'Iyer', 'Rao', 'Verma', 'Mishra', 'Tiwari']
            },
            'africa': {
                'first_names': ['Kwame', 'Ama', 'Kofi', 'Akosua', 'Yaw', 'Efua', 'Kwaku', 'Adwoa',
                               'Kojo', 'Abena', 'Kwesi', 'Akua', 'Yaa', 'Kwabena', 'Afia'],
                'last_names': ['Asante', 'Osei', 'Mensah', 'Boateng', 'Owusu', 'Adjei', 'Appiah',
                              'Gyasi', 'Frimpong', 'Amoah', 'Ofori', 'Darko', 'Wiredu']
            }
        }
    
    def generate_profile(self, region: str, income_tier: str = None, **kwargs) -> Dict[str, Any]:
        """Generate a single user profile for a specific region"""
        if region not in self.regions:
            raise ValueError(f"Unsupported region: {region}")
        
        region_config = self.regions[region]
        
        # Basic demographics
        age = self._generate_age()
        gender = random.choice(['male', 'female'])
        country = random.choice(region_config['countries'])
        
        # Generate name
        name = self._generate_name(region, gender)
        
        # Location
        is_urban = random.random() < region_config['urban_rural_split']
        location_type = 'urban' if is_urban else 'rural'
        
        # Income and employment
        if not income_tier:
            income_tier = self._select_income_tier(age, location_type)
        
        income = self._generate_income(region, income_tier, age, location_type)
        employment = self._generate_employment(region, income_tier, age, location_type)
        
        # Financial profile
        financial_profile = self._generate_financial_profile(income, age, employment, region)
        
        # Family and social
        family_size = random.choice(region_config['family_sizes'])
        education = random.choice(region_config['education_levels'])
        
        # Technology access
        tech_profile = self._generate_tech_profile(income_tier, location_type, age)
        
        # Credit history
        credit_profile = self._generate_credit_profile(age, income, employment, region)
        
        # Generate unique user ID
        user_id = f"{region}_{country}_{uuid.uuid4().hex[:8]}"
        
        profile = {
            # Basic info
            'user_id': user_id,
            'name': name,
            'age': age,
            'gender': gender,
            'country': country,
            'region': region,
            'location_type': location_type,
            'family_size': family_size,
            'education': education,
            
            # Financial info
            'income': income,
            'currency': random.choice(region_config['currencies']),
            'employment_type': employment['type'],
            'employment_length': employment['length'],
            'employment_stability': employment['stability'],
            
            # Credit scoring fields
            'credit_history_length': credit_profile['history_length'],
            'debt_to_income_ratio': financial_profile['debt_to_income_ratio'],
            'number_of_accounts': credit_profile['accounts'],
            'payment_history_score': credit_profile['payment_history'],
            'credit_utilization': credit_profile['utilization'],
            'recent_inquiries': credit_profile['inquiries'],
            
            # Additional financial details
            'monthly_expenses': financial_profile['monthly_expenses'],
            'savings_rate': financial_profile['savings_rate'],
            'has_collateral': financial_profile['has_collateral'],
            'collateral_value': financial_profile['collateral_value'],
            
            # Technology and access
            'has_smartphone': tech_profile['smartphone'],
            'has_internet': tech_profile['internet'],
            'uses_mobile_money': tech_profile['mobile_money'],
            'bank_account_type': tech_profile['bank_account'],
            
            # Risk factors
            'risk_factors': self._generate_risk_factors(financial_profile, employment, region),
            
            # Metadata
            'generated_at': datetime.now().isoformat(),
            'profile_version': '1.0'
        }
        
        # Apply any custom overrides
        profile.update(kwargs)
        
        return profile
    
    def generate_batch(self, region: str, count: int, distribution: Dict[str, float] = None) -> List[Dict[str, Any]]:
        """Generate a batch of user profiles with specified distribution"""
        if not distribution:
            distribution = {'low': 0.4, 'medium': 0.35, 'high': 0.2, 'very_high': 0.05}
        
        profiles = []
        
        for _ in range(count):
            # Select income tier based on distribution
            tier = np.random.choice(
                list(distribution.keys()),
                p=list(distribution.values())
            )
            
            profile = self.generate_profile(region, tier)
            profiles.append(profile)
        
        return profiles
    
    def _generate_age(self) -> int:
        """Generate realistic age distribution"""
        # Weighted towards working age population
        age_ranges = [(18, 25, 0.15), (26, 35, 0.30), (36, 45, 0.25), (46, 55, 0.20), (56, 65, 0.10)]
        
        selected_range = np.random.choice(
            len(age_ranges),
            p=[weight for _, _, weight in age_ranges]
        )
        
        min_age, max_age, _ = age_ranges[selected_range]
        return random.randint(min_age, max_age)
    
    def _generate_name(self, region: str, gender: str) -> Dict[str, str]:
        """Generate culturally appropriate names"""
        names_config = self.names[region]
        
        first_name = random.choice(names_config['first_names'])
        last_name = random.choice(names_config['last_names'])
        
        return {
            'first_name': first_name,
            'last_name': last_name,
            'full_name': f"{first_name} {last_name}"
        }
    
    def _select_income_tier(self, age: int, location_type: str) -> str:
        """Select income tier based on age and location"""
        base_probs = {'low': 0.4, 'medium': 0.35, 'high': 0.2, 'very_high': 0.05}
        
        # Adjust based on age
        if age < 25:
            base_probs['low'] += 0.2
            base_probs['medium'] -= 0.1
            base_probs['high'] -= 0.1
        elif age > 45:
            base_probs['high'] += 0.1
            base_probs['very_high'] += 0.05
            base_probs['low'] -= 0.15
        
        # Adjust based on location
        if location_type == 'rural':
            base_probs['low'] += 0.2
            base_probs['medium'] -= 0.1
            base_probs['high'] -= 0.1
        
        # Normalize probabilities
        total = sum(base_probs.values())
        normalized_probs = {k: v/total for k, v in base_probs.items()}
        
        return np.random.choice(
            list(normalized_probs.keys()),
            p=list(normalized_probs.values())
        )
    
    def _generate_income(self, region: str, tier: str, age: int, location_type: str) -> float:
        """Generate income based on tier and demographics"""
        income_range = self.regions[region]['income_ranges'][tier]
        base_income = random.uniform(*income_range)
        
        # Age adjustment
        if age < 25:
            base_income *= random.uniform(0.7, 0.9)
        elif age > 45:
            base_income *= random.uniform(1.1, 1.3)
        
        # Location adjustment
        if location_type == 'rural':
            base_income *= random.uniform(0.6, 0.8)
        
        return round(base_income, 2)
    
    def _generate_employment(self, region: str, income_tier: str, age: int, location_type: str) -> Dict[str, Any]:
        """Generate employment details"""
        employment_types = self.regions[region]['employment_types']
        
        # Select employment type based on income tier and location
        if income_tier in ['high', 'very_high']:
            emp_type = random.choice(['formal', 'tech', 'service'])
        elif location_type == 'rural':
            emp_type = random.choice(['agricultural', 'informal', 'self_employed'])
        else:
            emp_type = random.choice(employment_types)
        
        # Employment length based on age
        max_length = min(age - 18, 40)
        emp_length = random.uniform(0.5, max_length)
        
        # Stability score
        stability_factors = {
            'formal': random.uniform(0.7, 0.9),
            'tech': random.uniform(0.8, 0.95),
            'agricultural': random.uniform(0.4, 0.7),
            'informal': random.uniform(0.3, 0.6),
            'self_employed': random.uniform(0.5, 0.8),
            'service': random.uniform(0.6, 0.8),
            'manufacturing': random.uniform(0.6, 0.8),
            'mining': random.uniform(0.7, 0.85),
            'trade': random.uniform(0.5, 0.75)
        }
        
        stability = stability_factors.get(emp_type, random.uniform(0.5, 0.8))
        
        return {
            'type': emp_type,
            'length': round(emp_length, 1),
            'stability': round(stability, 2)
        }
    
    def _generate_financial_profile(self, income: float, age: int, employment: Dict, region: str) -> Dict[str, Any]:
        """Generate detailed financial profile"""
        # Monthly expenses (percentage of income)
        expense_ratio = random.uniform(0.6, 0.9)
        monthly_expenses = income * expense_ratio / 12
        
        # Savings rate
        savings_rate = max(0, random.uniform(0.05, 0.3) * (1 - expense_ratio))
        
        # Debt-to-income ratio
        debt_factors = {
            'formal': random.uniform(0.1, 0.4),
            'informal': random.uniform(0.2, 0.6),
            'agricultural': random.uniform(0.15, 0.5),
            'self_employed': random.uniform(0.2, 0.5)
        }
        
        base_debt_ratio = debt_factors.get(employment['type'], random.uniform(0.2, 0.5))
        
        # Adjust for age and stability
        if age < 30:
            base_debt_ratio *= random.uniform(1.1, 1.3)
        if employment['stability'] < 0.5:
            base_debt_ratio *= random.uniform(1.2, 1.5)
        
        debt_to_income_ratio = min(0.8, base_debt_ratio)
        
        # Collateral
        has_collateral = random.random() < (0.3 + (age - 25) * 0.01)
        collateral_value = 0
        if has_collateral:
            collateral_value = income * random.uniform(0.5, 3.0)
        
        return {
            'monthly_expenses': round(monthly_expenses, 2),
            'savings_rate': round(savings_rate, 3),
            'debt_to_income_ratio': round(debt_to_income_ratio, 3),
            'has_collateral': has_collateral,
            'collateral_value': round(collateral_value, 2)
        }
    
    def _generate_tech_profile(self, income_tier: str, location_type: str, age: int) -> Dict[str, Any]:
        """Generate technology access profile"""
        # Base probabilities
        smartphone_prob = 0.7
        internet_prob = 0.6
        mobile_money_prob = 0.5
        
        # Adjust for income
        income_multipliers = {
            'low': 0.8,
            'medium': 1.0,
            'high': 1.2,
            'very_high': 1.3
        }
        multiplier = income_multipliers[income_tier]
        
        smartphone_prob *= multiplier
        internet_prob *= multiplier
        mobile_money_prob *= multiplier
        
        # Adjust for location
        if location_type == 'rural':
            smartphone_prob *= 0.8
            internet_prob *= 0.6
            mobile_money_prob *= 1.2  # Mobile money more common in rural areas
        
        # Adjust for age
        if age < 35:
            smartphone_prob *= 1.2
            internet_prob *= 1.1
        elif age > 55:
            smartphone_prob *= 0.7
            internet_prob *= 0.6
        
        # Bank account type
        bank_account_types = ['none', 'basic', 'savings', 'current']
        if income_tier in ['high', 'very_high']:
            bank_account = random.choice(['savings', 'current'])
        elif income_tier == 'medium':
            bank_account = random.choice(['basic', 'savings'])
        else:
            bank_account = random.choice(['none', 'basic'])
        
        return {
            'smartphone': random.random() < min(0.95, smartphone_prob),
            'internet': random.random() < min(0.9, internet_prob),
            'mobile_money': random.random() < min(0.8, mobile_money_prob),
            'bank_account': bank_account
        }
    
    def _generate_credit_profile(self, age: int, income: float, employment: Dict, region: str) -> Dict[str, Any]:
        """Generate credit history profile"""
        # Credit history length (cannot exceed age - 18)
        max_history = min(age - 18, 25)
        
        # Base history length
        if employment['type'] == 'formal':
            history_length = random.uniform(0.5, max_history)
        else:
            history_length = random.uniform(0, max_history * 0.7)
        
        # Number of accounts
        if history_length < 2:
            accounts = random.randint(0, 2)
        elif history_length < 5:
            accounts = random.randint(1, 4)
        else:
            accounts = random.randint(2, 8)
        
        # Payment history score
        base_payment_score = random.uniform(0.6, 0.95)
        if employment['stability'] > 0.8:
            base_payment_score = random.uniform(0.8, 0.98)
        elif employment['stability'] < 0.5:
            base_payment_score = random.uniform(0.4, 0.7)
        
        # Credit utilization
        utilization = random.uniform(0.1, 0.8)
        if income > 50000:
            utilization = random.uniform(0.1, 0.5)
        
        # Recent inquiries
        inquiries = random.randint(0, 5)
        if history_length < 1:
            inquiries = random.randint(0, 2)
        
        return {
            'history_length': round(history_length, 1),
            'accounts': accounts,
            'payment_history': round(base_payment_score, 3),
            'utilization': round(utilization, 3),
            'inquiries': inquiries
        }
    
    def _generate_risk_factors(self, financial_profile: Dict, employment: Dict, region: str) -> List[str]:
        """Generate risk factors based on profile"""
        risk_factors = []
        
        if financial_profile['debt_to_income_ratio'] > 0.5:
            risk_factors.append('high_debt_ratio')
        
        if employment['stability'] < 0.5:
            risk_factors.append('unstable_employment')
        
        if employment['type'] == 'informal':
            risk_factors.append('informal_income')
        
        if financial_profile['savings_rate'] < 0.05:
            risk_factors.append('low_savings')
        
        if not financial_profile['has_collateral']:
            risk_factors.append('no_collateral')
        
        return risk_factors

def generate_regional_datasets():
    """Generate comprehensive datasets for all regions"""
    generator = UserProfileGenerator()
    
    # Generate datasets for each region
    datasets = {}
    
    for region in ['latam', 'asia', 'africa']:
        print(f"Generating profiles for {region.upper()}...")
        
        # Generate different sized datasets
        datasets[region] = {
            'small': generator.generate_batch(region, 100),
            'medium': generator.generate_batch(region, 500),
            'large': generator.generate_batch(region, 1000)
        }
        
        print(f"Generated {sum(len(d) for d in datasets[region].values())} profiles for {region}")
    
    return datasets

def save_datasets(datasets: Dict, output_dir: str = "."):
    """Save datasets to files"""
    import os
    
    os.makedirs(output_dir, exist_ok=True)
    
    for region, sizes in datasets.items():
        for size, profiles in sizes.items():
            # Save as JSON
            json_filename = f"{output_dir}/user_profiles_{region}_{size}.json"
            with open(json_filename, 'w') as f:
                json.dump(profiles, f, indent=2)
            
            # Save as CSV
            csv_filename = f"{output_dir}/user_profiles_{region}_{size}.csv"
            df = pd.json_normalize(profiles)
            df.to_csv(csv_filename, index=False)
            
            print(f"Saved {len(profiles)} {region} profiles ({size}) to {json_filename} and {csv_filename}")

def main():
    """Main function to generate and save datasets"""
    print("🌍 Generating diverse user profiles for Kifaa platform...")
    print("=" * 60)
    
    # Generate datasets
    datasets = generate_regional_datasets()
    
    # Save datasets
    save_datasets(datasets)
    
    # Generate summary statistics
    print("\n📊 Dataset Summary:")
    print("-" * 40)
    
    total_profiles = 0
    for region, sizes in datasets.items():
        region_total = sum(len(profiles) for profiles in sizes.values())
        total_profiles += region_total
        print(f"{region.upper()}: {region_total} profiles")
        
        # Sample profile for demonstration
        sample = sizes['small'][0]
        print(f"  Sample: {sample['name']['full_name']}, Age: {sample['age']}, "
              f"Income: {sample['income']:.0f} {sample['currency']}")
    
    print(f"\nTotal profiles generated: {total_profiles}")
    print("✅ Dataset generation completed!")

if __name__ == "__main__":
    main()

