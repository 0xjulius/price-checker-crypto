import React, { useState, useEffect } from 'react';
import axios from 'axios';

function App() {
  const [cryptoData, setCryptoData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastScrapedTime, setLastScrapedTime] = useState(null);
  const [dataUpdated, setDataUpdated] = useState(false);

  useEffect(() => {
    // Function to fetch crypto data
    const fetchCryptoData = async () => {
      try {
        const response = await axios.get(
          'https://api.coingecko.com/api/v3/coins/markets',
          {
            params: {
              vs_currency: 'usd',
              ids: 'bitcoin,ethereum,litecoin', // Add more IDs as needed
            },
          }
        );

        // Update last scraped time
        setLastScrapedTime(new Date().toLocaleTimeString());

        // Calculate percentage change and update data
        const newData = response.data.map((crypto) => {
          return {
            ...crypto,
          };
        });
        setCryptoData(newData);
        setLoading(false);
        setError(null); // Reset error state

        // Set dataUpdated to true only when data is updated
        if (JSON.stringify(newData) !== JSON.stringify(cryptoData)) {
          setDataUpdated(true);
        }

        // Store data in local storage
        localStorage.setItem('cryptoData', JSON.stringify(newData));
      } catch (error) {
        console.error('Error fetching data: ', error);
        setLoading(false);
        setError('Error fetching data. Please try again later.');

        // Load data from local storage if available
        const storedData = localStorage.getItem('cryptoData');
        if (storedData) {
          setCryptoData(JSON.parse(storedData));
        }
      }
    };

    // Function to fetch data at intervals
    const fetchDataInterval = setInterval(() => {
      fetchCryptoData();
    }, 10000); // Fetch data every 10 seconds

    // Fetch initial data
    fetchCryptoData();

    // Cleanup interval
    return () => clearInterval(fetchDataInterval);
  }, [cryptoData]); // Include cryptoData in dependencies to track changes

  useEffect(() => {
    // Remove animate-flash class after 1 second
    const flashTimeout = setTimeout(() => {
      setDataUpdated(false);
    }, 1000);

    return () => clearTimeout(flashTimeout);
  }, [dataUpdated]);

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-3xl font-bold mb-4">Crypto Prices</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {loading ? (
          <p className="text-gray-600">Loading...</p>
        ) : error ? (
          // Display the last successfully fetched data
          cryptoData.map((crypto) => (
            <div key={crypto.id} className="bg-white p-4 rounded-lg shadow card card-background">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{crypto.name}</h2>
                <img src={crypto.image} alt={crypto.name} className="h-8 w-8" />
              </div>
              <p className="text-gray-600">{crypto.symbol.toUpperCase()}</p>
              <p className={`price mt-2 ${dataUpdated ? 'animate-flash' : ''}`}>
                ${crypto.current_price}
              </p>
              <div className="flex justify-end mt-4">
                {crypto.market_data && crypto.market_data.market_cap && (
                  <p className="text-gray-500">{crypto.market_data.market_cap.usd}</p>
                )}
              </div>
            </div>
          ))
        ) : (
          // If there's an error fetching data, display the last successfully fetched data
          cryptoData.map((crypto) => (
            <div key={crypto.id} className="bg-white p-4 rounded-lg shadow card card-background">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">{crypto.name}</h2>
                <img src={crypto.image} alt={crypto.name} className="h-8 w-8" />
              </div>
              <p className="text-gray-600">{crypto.symbol.toUpperCase()}</p>
              <p className={`mt-2 ${dataUpdated ? 'animate-flash' : ''}`}>
                ${crypto.current_price}
              </p>
              <div className="flex justify-end mt-4">
                {crypto.market_data && crypto.market_data.market_cap && (
                  <p className="text-gray-500">{crypto.market_data.market_cap.usd}</p>
                )}
              </div>
            </div>
          ))
        )}
      </div>
      {lastScrapedTime && (
        <p className="text-sm text-gray-500">Last updated: {lastScrapedTime}</p>
      )}
    </div>
  );
}

export default App;
