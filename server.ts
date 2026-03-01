import express from 'express';
import cors from 'cors';
import ZAI from 'z-ai-web-dev-sdk';

const app = express();
app.use(cors());
app.use(express.json());

let zaiInstance: Awaited<ReturnType<typeof ZAI.create>> | null = null;

async function initZAI() {
  if (!zaiInstance) {
    zaiInstance = await ZAI.create();
    console.log('✅ Z-AI SDK initialized');
  }
  return zaiInstance;
}

// AI Chat endpoint
app.post('/api/chat', async (req, res) => {
  try {
    const { message, personality } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const zai = await initZAI();
    
    const systemPrompt = `Eres AURORA-X, una IA avanzada y amigable. Personalidad: ${personality || 'Conversacional y cercana'}. Responde en español de forma concisa y útil. Usa markdown para formatear tus respuestas cuando sea apropiado.`;

    const completion = await zai.chat.completions.create({
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.7,
      max_tokens: 2048
    });

    const responseText = completion.choices?.[0]?.message?.content || 'No pude generar una respuesta.';
    
    res.json({ success: true, response: responseText });
  } catch (error: any) {
    console.error('Chat error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error al procesar la solicitud' 
    });
  }
});

// Music search endpoint using web search
app.post('/api/music/search', async (req, res) => {
  try {
    const { query } = req.body;
    
    if (!query) {
      return res.status(400).json({ error: 'Query is required' });
    }

    const zai = await initZAI();
    
    // Use web search to find YouTube videos
    const searchQuery = `${query} site:youtube.com OR site:youtu.be`;
    const searchResult = await zai.functions.invoke('web_search', {
      query: searchQuery,
      num: 15
    });

    // Parse the results to extract YouTube video IDs
    const tracks = [];
    const seenIds = new Set();
    
    if (Array.isArray(searchResult)) {
      for (const item of searchResult) {
        // Extract YouTube video ID from URL
        const url = item.url || '';
        let videoId = '';
        
        // Match various YouTube URL formats
        const patterns = [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
          /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) {
            videoId = match[1];
            break;
          }
        }
        
        if (videoId && !seenIds.has(videoId)) {
          seenIds.add(videoId);
          tracks.push({
            id: videoId,
            title: item.name || item.snippet || 'Unknown Track',
            channel: item.host_name || 'YouTube',
            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            url: url
          });
        }
      }
    }
    
    // If no results from web search, fall back to popular songs
    if (tracks.length === 0) {
      const fallbackTracks = [
        { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee', channel: 'Luis Fonsi' },
        { id: '9bZkp7q19f0', title: 'PSY - GANGNAM STYLE', channel: 'officialpsy' },
        { id: 'JGwWNGJdvx8', title: 'Ed Sheeran - Shape of You', channel: 'Ed Sheeran' },
        { id: 'RgKAFK5djSk', title: 'Wiz Khalifa - See You Again ft. Charlie Puth', channel: 'Wiz Khalifa' },
        { id: '60ItHLz5WEA', title: 'Alan Walker - Faded', channel: 'Alan Walker' }
      ];
      
      // Filter fallback by query
      const queryLower = query.toLowerCase();
      const filtered = fallbackTracks.filter(t => 
        t.title.toLowerCase().includes(queryLower) || 
        t.channel.toLowerCase().includes(queryLower)
      );
      
      const results = (filtered.length > 0 ? filtered : fallbackTracks).map(s => ({
        ...s,
        thumbnail: `https://img.youtube.com/vi/${s.id}/mqdefault.jpg`
      }));
      
      return res.json({ success: true, tracks: results, fallback: true });
    }
    
    res.json({ success: true, tracks, fallback: false });
  } catch (error: any) {
    console.error('Music search error:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || 'Error al buscar música' 
    });
  }
});

// Popular music endpoint (fallback)
app.get('/api/music/popular', async (req, res) => {
  try {
    const zai = await initZAI();
    
    const searchResult = await zai.functions.invoke('web_search', {
      query: 'top music videos 2024 site:youtube.com',
      num: 20
    });

    const tracks = [];
    const seenIds = new Set();
    
    if (Array.isArray(searchResult)) {
      for (const item of searchResult) {
        const url = item.url || '';
        let videoId = '';
        
        const patterns = [
          /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
          /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
        ];
        
        for (const pattern of patterns) {
          const match = url.match(pattern);
          if (match) {
            videoId = match[1];
            break;
          }
        }
        
        if (videoId && !seenIds.has(videoId)) {
          seenIds.add(videoId);
          tracks.push({
            id: videoId,
            title: item.name || item.snippet || 'Unknown Track',
            channel: item.host_name || 'YouTube',
            thumbnail: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`,
            url: url
          });
        }
      }
    }
    
    // Fallback to predefined popular songs
    if (tracks.length === 0) {
      const popularSongs = [
        { id: 'dQw4w9WgXcQ', title: 'Rick Astley - Never Gonna Give You Up', channel: 'Rick Astley' },
        { id: '9bZkp7q19f0', title: 'PSY - GANGNAM STYLE', channel: 'officialpsy' },
        { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee', channel: 'Luis Fonsi' },
        { id: 'JGwWNGJdvx8', title: 'Ed Sheeran - Shape of You', channel: 'Ed Sheeran' },
        { id: 'RgKAFK5djSk', title: 'Wiz Khalifa - See You Again', channel: 'Wiz Khalifa' },
        { id: 'OPf0YbXqDm0', title: 'Mark Ronson - Uptown Funk', channel: 'Mark Ronson' },
        { id: 'CevxZvSJLk8', title: 'Katy Perry - Roar', channel: 'Katy Perry' },
        { id: 'hT_nvWreIhg', title: 'OneRepublic - Counting Stars', channel: 'OneRepublic' },
        { id: 'YQHsXMglC9A', title: 'Adele - Hello', channel: 'Adele' },
        { id: 'fRh_vgS2dFE', title: 'Justin Bieber - Sorry', channel: 'Justin Bieber' },
        { id: '60ItHLz5WEA', title: 'Alan Walker - Faded', channel: 'Alan Walker' },
        { id: 'pRpeEdMmmQ0', title: 'Shakira - Waka Waka', channel: 'Shakira' },
        { id: 'hLQl3WQQoQ0', title: 'Adele - Rolling in the Deep', channel: 'Adele' },
        { id: 'lp-EO5I60KA', title: 'Imagine Dragons - Demons', channel: 'ImagineDragons' },
        { id: 'e-ORhEE9VVg', title: 'Taylor Swift - Shake It Off', channel: 'Taylor Swift' }
      ];
      
      return res.json({ 
        success: true, 
        tracks: popularSongs.map(s => ({
          ...s,
          thumbnail: `https://img.youtube.com/vi/${s.id}/mqdefault.jpg`
        })),
        fallback: true
      });
    }
    
    res.json({ success: true, tracks, fallback: false });
  } catch (error: any) {
    console.error('Popular music error:', error);
    
    // Return fallback on error
    const popularSongs = [
      { id: 'kJQP7kiw5Fk', title: 'Luis Fonsi - Despacito ft. Daddy Yankee', channel: 'Luis Fonsi' },
      { id: '9bZkp7q19f0', title: 'PSY - GANGNAM STYLE', channel: 'officialpsy' },
      { id: 'JGwWNGJdvx8', title: 'Ed Sheeran - Shape of You', channel: 'Ed Sheeran' },
      { id: '60ItHLz5WEA', title: 'Alan Walker - Faded', channel: 'Alan Walker' },
      { id: 'RgKAFK5djSk', title: 'Wiz Khalifa - See You Again', channel: 'Wiz Khalifa' }
    ];
    
    res.json({ 
      success: true, 
      tracks: popularSongs.map(s => ({
        ...s,
        thumbnail: `https://img.youtube.com/vi/${s.id}/mqdefault.jpg`
      })),
      fallback: true,
      error: error.message
    });
  }
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`🚀 API Server running on port ${PORT}`);
  initZAI();
});
