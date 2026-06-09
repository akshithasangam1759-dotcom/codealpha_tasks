const axios = require('axios');

const JAMENDO_BASE = 'https://api.jamendo.com/v3.0';
const CLIENT_ID = () => process.env.JAMENDO_CLIENT_ID || 'b6747d04';

// Axios instance with 8s timeout
const jamendo = axios.create({ timeout: 8000 });

// @desc    Get trending tracks
exports.getTrendingTracks = async (req, res) => {
  try {
    const { limit = 20, genre, offset = 0 } = req.query;
    const params = {
      client_id: CLIENT_ID(),
      format: 'json',
      limit,
      offset,
      order: 'popularity_total',
      include: 'musicinfo',
      audioformat: 'mp32',
      imagesize: 300,
    };
    if (genre) params.tags = genre;

    const response = await jamendo.get(`${JAMENDO_BASE}/tracks/`, { params });
    res.json({ success: true, tracks: response.data.results, headers: response.data.headers });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch tracks', error: error.message });
  }
};

// @desc    Search tracks
exports.searchTracks = async (req, res) => {
  try {
    const { q, limit = 20, offset = 0 } = req.query;
    const response = await jamendo.get(`${JAMENDO_BASE}/tracks/`, {
      params: {
        client_id: CLIENT_ID(),
        format: 'json',
        limit,
        offset,
        search: q,
        audioformat: 'mp32',
        imagesize: 300,
      },
    });
    res.json({ success: true, tracks: response.data.results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Search failed', error: error.message });
  }
};

// @desc    Get trending artists
exports.getTrendingArtists = async (req, res) => {
  try {
    const { limit = 12 } = req.query;
    const response = await jamendo.get(`${JAMENDO_BASE}/artists/`, {
      params: {
        client_id: CLIENT_ID(),
        format: 'json',
        limit,
        order: 'popularity_total',
        imagesize: 300,
      },
    });
    res.json({ success: true, artists: response.data.results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch artists', error: error.message });
  }
};

// @desc    Get artist tracks
exports.getArtistTracks = async (req, res) => {
  try {
    const { artistId, limit = 10 } = req.query;
    const response = await jamendo.get(`${JAMENDO_BASE}/tracks/`, {
      params: {
        client_id: CLIENT_ID(),
        format: 'json',
        limit,
        artist_id: artistId,
        audioformat: 'mp32',
        imagesize: 300,
        order: 'popularity_artist',
      },
    });
    res.json({ success: true, tracks: response.data.results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch artist tracks', error: error.message });
  }
};

// @desc    Get genres
exports.getGenres = async (req, res) => {
  const genres = [
    { id: 'pop', name: 'Pop', icon: '🎵', color: '#FF6B9D' },
    { id: 'rock', name: 'Rock', icon: '🎸', color: '#FF4444' },
    { id: 'hiphop', name: 'Hip Hop', icon: '🎤', color: '#9B59B6' },
    { id: 'electronic', name: 'Electronic', icon: '⚡', color: '#3498DB' },
    { id: 'jazz', name: 'Jazz', icon: '🎷', color: '#F39C12' },
    { id: 'rnb', name: 'R&B', icon: '💜', color: '#8E44AD' },
    { id: 'classical', name: 'Classical', icon: '🎻', color: '#1ABC9C' },
    { id: 'lofi', name: 'Lo-Fi', icon: '🌙', color: '#2C3E50' },
    { id: 'indie', name: 'Indie', icon: '🌿', color: '#27AE60' },
    { id: 'ambient', name: 'Ambient', icon: '🌊', color: '#2980B9' },
    { id: 'reggae', name: 'Reggae', icon: '🌴', color: '#16A085' },
    { id: 'country', name: 'Country', icon: '🤠', color: '#D35400' },
  ];
  res.json({ success: true, genres });
};

// @desc    Get recommended tracks (by tags)
exports.getRecommended = async (req, res) => {
  try {
    const { tags = 'pop', limit = 10 } = req.query;
    const response = await jamendo.get(`${JAMENDO_BASE}/tracks/`, {
      params: {
        client_id: CLIENT_ID(),
        format: 'json',
        limit,
        tags,
        order: 'popularity_month',
        audioformat: 'mp32',
        imagesize: 300,
      },
    });
    res.json({ success: true, tracks: response.data.results });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch recommendations', error: error.message });
  }
};