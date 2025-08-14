
import { useState, useEffect } from 'react';

// Define BAH data structure
const bahData = {
  'San Diego, CA': {
    'E1–E4': { withDependents: 3579, withoutDependents: 2684 },
    E5: { withDependents: 3882, withoutDependents: 2964 },
    // Add all other pay grades here...
  },
  'Norfolk/Virginia Beach, VA': {
    'E1–E4': { withDependents: 2154, withoutDependents: 1674 },
    E5: { withDependents: 2325, withoutDependents: 1869 },
    // Add other pay grades...
  },
  // Add other locations as needed
};

// Main component for calculating pay and BAH
const PayCalculator = () => {
  const [payGrade, setPayGrade] = useState('E1–E4');
  const [location, setLocation] = useState('San Diego, CA');
  const [hasDependents, setHasDependents] = useState(false);
  const [bah, setBah] = useState(0);

  // Calculate BAH based on selected pay grade, location, and dependent status
  useEffect(() => {
    const selectedBah = bahData[location]?.[payGrade];
    if (selectedBah) {
      setBah(hasDependents ? selectedBah.withDependents : selectedBah.withoutDependents);
    }
  }, [payGrade, location, hasDependents]);

  return (
    <div>
      <h1>Pay Calculator</h1>
      <label>
        Pay Grade:
        <select value={payGrade} onChange={(e) => setPayGrade(e.target.value)}>
          <option value=E1–E4>E1–E4</option>
          <option value=E5>E5</option>
          <option value=E6>E6</option>
          <option value=E7>E7</option>
          <option value=E8>E8</option>
          <option value=E9>E9</option>
          <option value=W1>W1</option>
          <option value=O1>O1</option>
          {/* Add all other pay grades here */}
        </select>
      </label>
      <label>
        Location:
        <select value={location} onChange={(e) => setLocation(e.target.value)}>
          <option value=San Diego, CA>San Diego, CA</option>
          <option value=Norfolk/Virginia Beach, VA>Norfolk/Virginia Beach, VA</option>
          {/* Add all other locations here */}
        </select>
      </label>
      <label>
        Dependent Status:
        <input type=checkbox checked={hasDependents} onChange={(e) => setHasDependents(e.target.checked)} />
        {hasDependents ? 'With Dependents' : 'Without Dependents'}
      </label>
      <div>
        <h2>BAH: </h2>
      </div>
    </div>
  );
};

export default PayCalculator;

