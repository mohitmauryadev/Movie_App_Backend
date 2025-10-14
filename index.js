require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const TMDB_KEY = process.env.TMDB_KEY;
const TMDB_BASE = 'https://api.themoviedb.org/3';

if(!TMDB_KEY) console.warn('TMDB_KEY missing in .env');

// Genre IDs for TMDB
const GENRES = {
    action: 28,
    comedy: 35,
    horror: 27,
    romance: 10749,
    'sci-fi': 878,
    adventure: 12,
    animation: 16,
    documentary: 99
};

// Trending Movies
app.get('/api/trending', async (req, res) => {
    try {
        const response = await axios.get(`${TMDB_BASE}/trending/movie/week`, {
            params: { api_key: TMDB_KEY }
        });
        res.json(response.data);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch trending movies' });
    }
});

// Search Movies
app.get('/api/search', async (req, res) => {
    try {
        const q = req.query.q;
        if(!q) return res.status(400).json({ error: 'Query param q required' });
        const response = await axios.get(`${TMDB_BASE}/search/movie`, {
            params: { api_key: TMDB_KEY, query: q }
        });
        res.json(response.data);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to search movies' });
    }
});

// Movie Details
app.get('/api/movie/:id', async (req,res) => {
    try {
        const id = req.params.id;
        const response = await axios.get(`${TMDB_BASE}/movie/${id}`, {
            params: { api_key: TMDB_KEY, append_to_response:'videos' }
        });
        res.json(response.data);
    } catch(err){
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch movie details' });
    }
});

// Category / Genre Movies
app.get('/api/category/:category', async (req,res) => {
    const category = req.params.category.toLowerCase();
    try {
        let url = '';
        if(GENRES[category]) {
            url = `${TMDB_BASE}/discover/movie`;
            const response = await axios.get(url, {
                params: { api_key: TMDB_KEY, with_genres: GENRES[category] }
            });
            return res.json(response.data);
        }
        // Motivational / Custom keyword categories
        if(category === 'motivational') {
            url = `${TMDB_BASE}/search/movie`;
            const response = await axios.get(url, {
                params: { api_key: TMDB_KEY, query: 'motivational' }
            });
            return res.json(response.data);
        }
        // Default fallback to trending
        const response = await axios.get(`${TMDB_BASE}/trending/movie/week`, {
            params: { api_key: TMDB_KEY }
        });
        res.json(response.data);
    } catch(err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch movies for this category' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
