import React, { useEffect, useState } from 'react';
import axios from 'axios';

const DoctorList = () => {
  const [doctors, setDoctors] = useState([]);

  useEffect(() => {
    axios.get('http://localhost:8000/api/patient/doctors/')
      .then(response => {
        console.log('Doctor data:', response.data); // ✅ Add this for debugging
        setDoctors(response.data);
      })
      .catch(error => {
        console.error('Error fetching doctors:', error);
      });
  }, []);

  return (
    <div>
      <h2>Available Dooctors</h2>
      <table border="1" cellPadding="10">
        <thead>
          <tr>
            <th>Name</th>
            <th>Specialization</th>
            <th>Available Days</th>
            <th>Available Time</th>
          </tr>
        </thead>
        <tbody>
          {doctors.length > 0 ? (
            doctors.map((doctor) => (
              <tr key={doctor.id}>
                <td>{doctor.name}</td>
                <td>{doctor.specialization}</td>
                <td>{doctor.available_days}</td>
                <td>{doctor.available_time}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="4">No doctors available</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DoctorList;
