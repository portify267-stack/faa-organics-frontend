export function getShippingRateForState(stateName) {
  if (!stateName || typeof stateName !== 'string') return null;
  const clean = stateName.trim().toLowerCase();

  // 1. Tamil Nadu: ₹50
  if (clean === 'tamil nadu' || clean === 'tamilnadu' || clean === 'tn') {
    return { rate: 50, zone: 'Tamil Nadu', label: '₹50 (Tamil Nadu)' };
  }

  // 2. Other South Indian states: ₹60
  const southStates = [
    'andhra pradesh', 'andhra', 'ap',
    'karnataka', 'ka',
    'kerala', 'kl',
    'telangana', 'ts', 'tg',
    'puducherry', 'pondicherry', 'py'
  ];
  if (southStates.includes(clean)) {
    return { rate: 60, zone: 'Other South Indian States', label: '₹60 (South India)' };
  }

  // 3. North Indian states (and all remaining Indian states / UTs): ₹70
  return { rate: 70, zone: 'North Indian States', label: '₹70 (North India / Other States)' };
}

export const STATE_OPTIONS = [
  {
    group: 'Home State — ₹50',
    options: [
      { value: 'Tamil Nadu', label: 'Tamil Nadu (Special Rate: ₹50)' }
    ]
  },
  {
    group: 'Other South Indian States — ₹60',
    options: [
      { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
      { value: 'Karnataka', label: 'Karnataka' },
      { value: 'Kerala', label: 'Kerala' },
      { value: 'Telangana', label: 'Telangana' },
      { value: 'Puducherry', label: 'Puducherry' }
    ]
  },
  {
    group: 'North Indian States — ₹70',
    options: [
      { value: 'Delhi', label: 'Delhi (NCR)' },
      { value: 'Maharashtra', label: 'Maharashtra' },
      { value: 'Gujarat', label: 'Gujarat' },
      { value: 'Rajasthan', label: 'Rajasthan' },
      { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
      { value: 'Punjab', label: 'Punjab' },
      { value: 'Haryana', label: 'Haryana' },
      { value: 'West Bengal', label: 'West Bengal' },
      { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
      { value: 'Bihar', label: 'Bihar' },
      { value: 'Odisha', label: 'Odisha' },
      { value: 'Assam', label: 'Assam' },
      { value: 'Goa', label: 'Goa' },
      { value: 'Jharkhand', label: 'Jharkhand' },
      { value: 'Chhattisgarh', label: 'Chhattisgarh' },
      { value: 'Uttarakhand', label: 'Uttarakhand' },
      { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
      { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
      { value: 'Chandigarh', label: 'Chandigarh' },
      { value: 'Tripura', label: 'Tripura' },
      { value: 'Meghalaya', label: 'Meghalaya' },
      { value: 'Manipur', label: 'Manipur' },
      { value: 'Nagaland', label: 'Nagaland' },
      { value: 'Mizoram', label: 'Mizoram' },
      { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
      { value: 'Sikkim', label: 'Sikkim' },
      { value: 'Ladakh', label: 'Ladakh' },
      { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' },
      { value: 'Dadra and Nagar Haveli and Daman and Diu', label: 'Dadra and Nagar Haveli and Daman and Diu' },
      { value: 'Lakshadweep', label: 'Lakshadweep' }
    ]
  }
];
