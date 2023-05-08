const express = require("express");
const axios = require("axios");

const app = express();
const port = 3001;

app.get('/data', async (req, res) => {
    const apiUrl = 'https://api.covidtracking.com/v1/states/daily.json';
    const response = await axios.get(apiUrl);
    const data = response.data;

    const states = {};
    data.forEach((entry) => {
        const state = entry.state;
        const positive = entry.positive;
        const death = entry.death;
        const date = new Date(entry.dateChecked).toLocaleDateString();

        if (!states[state]) {
            states[state] = {
                positive: [],
                death: [],
            };
        }

        states[state].positive.push({ positive, date });
        states[state].death.push({ death, date });
    });

    for (const state in states) {
        states[state].positive.sort((a, b) => b.positive - a.positive);
        states[state].death.sort((a, b) => b.death - a.death);
    }

    // Get the top 10 states by positive cases
    const sortedStates = Object.keys(states).sort((a, b) => {
        const aPositive = states[a].positive[0].positive;
        const bPositive = states[b].positive[0].positive;
        return bPositive - aPositive;
    }).slice(0, 10);

    const topStates = {};
    sortedStates.forEach((state) => {
        topStates[state] = states[state];
    });

    res.json(topStates);
});


console.log('Creating server...');
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
