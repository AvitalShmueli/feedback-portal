import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import Home from './pages/Home';
import FeedbackEntries from './pages/FeedbackEntries';
import { ConfigProvider } from 'antd';

const App: React.FC = () => {
  return (
    <ConfigProvider
      theme={{
        token: {
          colorPrimary: 'rgb(134, 103, 175)',
          colorLink: 'rgb(134, 103, 175)',
          colorLinkHover: 'rgba(134, 103, 175, 0.8)',
        },
      }}
    >
      <Router>
        <div style={{backgroundColor: '#f9f0ff', minHeight: '100vh'}}>  
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/feedback/:packageName/:formId" element={<FeedbackEntries />} />
          </Routes>
        </div>
      </Router>
    </ConfigProvider>
  );
};

export default App;