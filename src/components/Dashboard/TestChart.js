import React from 'react';

const TestChart = ({ title }) => {
  console.log('🔥 TEST CHART RENDERING:', title);
  
  return (
    <div style={{
      background: 'red',
      border: '5px solid yellow',
      padding: '20px',
      margin: '10px',
      minHeight: '200px',
      color: 'white',
      fontSize: '18px',
      fontWeight: 'bold',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      position: 'relative',
      zIndex: 9999
    }}>
      <h2>🔥 {title} TEST CHART 🔥</h2>
      <p>If you can see this, the layout works!</p>
      <div style={{
        background: 'yellow',
        color: 'black',
        padding: '10px',
        borderRadius: '5px',
        marginTop: '10px'
      }}>
        This should be VERY visible
      </div>
    </div>
  );
};

export default TestChart;