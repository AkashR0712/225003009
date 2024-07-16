const express = require('express');
const axios = require('axios');
require('dotenv').config(); 

const app = express();
const port = 9876;
 

const windowSize = 10;
let window = new Set();

const ACCESS_TOKEN = process.env.ACCESS_TOKEN;

const calculateAverage = () => {
    if (window.size === 0) return 0;
    const sum = Array.from(window).reduce((acc, num) => acc + num, 0);
    return sum / window.size;
};

const fetchNumbers = async (numberType) => {
    try {
        const sourceUrl = `http://20.244.56.144/test/${numberType}`;
        const response = await axios.get(sourceUrl, {
            headers: {
                Authorization: `Bearer ${ACCESS_TOKEN}`
            },
            timeout: 5000
        });
        return response.data.numbers || [];
    } catch (error) {
        console.error(`Error fetching numbers: ${error.message}`);
        return [];
    }
};


app.get('/numbers/:numberid', async (req, res) => {
    const numberType = req.params.numberid;
    const validTypes = ['primes', 'fibo', 'even', 'random'];

    if (!validTypes.includes(numberType)) {
        return res.status(400).json({ error: 'Invalid number ID type' });
    }

    const numbers = await fetchNumbers(numberType);

    const prevState = Array.from(window);

   
    numbers.forEach((num) => {
        if (!window.has(num)) {
            if (window.size >= windowSize) {
                const iterator = window.values();
                window.delete(iterator.next().value);
            }
            window.add(num);
        }
    });

    const currentState = Array.from(window);
    const average = calculateAverage();

    res.json({
        numbers: numbers,
        windowPrevState: prevState,
        windowCurrState: currentState,
        avg: average
    });
});
app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});
