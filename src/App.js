import './App.css';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import WeatherApp from './components/WeatherApp';
import ForecastPage from './components/ForecastPage';


const App = () => {

  return (
    <div className="App">
      <header className="App-header">
        <Router basename="/weather-app">
          <Routes>
            <Route path="/" element={<WeatherApp/>} />
            <Route path="/forecast" element={<ForecastPage />} /> 
          </Routes>
        </Router>
      </header>
    </div>
  );
};

export default App;
