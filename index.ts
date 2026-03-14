import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';
import {
  getBattingStats,
  getBowlingStats,
  getTopRunScorers,
  getTopWicketTakers,
  getHeadToHead,
} from './stats.js';
import { downloadMatches } from './downloader.js';

const server = new McpServer({
  name: 'cricsheet-mcp',
  version: '1.0.0',
});

server.tool('download_cricket_data',
  'Download match data. Types: t20i, odi, test, ipl',
  { match_types: z.array(z.string()).default(['t20i', 'odi']) },
  async ({ match_types }) => {
await downloadMatches(match_types);
return { content: [{ type: 'text', text: `Downloaded: ${match_types.join(', ')}` }] };
  }
);

server.tool('get_batting_stats',
  'Batting stats for a player. Optional: match_type (t20i/odi/test/ipl), year',
  { player_name: z.string(), match_type: z.string().optional(), year: z.number().optional() },
  async ({ player_name, match_type, year }) => ({
content: [{ type: 'text', text: JSON.stringify(getBattingStats(player_name, match_type, year), null, 2) }]
  })
);

server.tool('get_bowling_stats',
  'Bowling stats for a player. Optional: match_type, year',
  { player_name: z.string(), match_type: z.string().optional(), year: z.number().optional() },
  async ({ player_name, match_type, year }) => ({
content: [{ type: 'text', text: JSON.stringify(getBowlingStats(player_name, match_type, year), null, 2) }]
  })
);

server.tool('get_top_run_scorers',
  'Leaderboard of top run scorers. Optional: match_type, year, limit',
  { match_type: z.string().optional(), year: z.number().optional(), limit: z.number().default(10) },
  async ({ match_type, year, limit }) => ({
content: [{ type: 'text', text: JSON.stringify(getTopRunScorers(match_type, year, limit), null, 2) }]
  })
);

server.tool('get_top_wicket_takers',
  'Leaderboard of top wicket takers. Optional: match_type, year, limit',
  { match_type: z.string().optional(), year: z.number().optional(), limit: z.number().default(10) },
  async ({ match_type, year, limit }) => ({
content: [{ type: 'text', text: JSON.stringify(getTopWicketTakers(match_type, year, limit), null, 2) }]
  })
);

server.tool('get_head_to_head',
  'Head-to-head record between two teams. Optional: match_type',
  { team1: z.string(), team2: z.string(), match_type: z.string().optional() },
  async ({ team1, team2, match_type }) => ({
content: [{ type: 'text', text: JSON.stringify(getHeadToHead(team1, team2, match_type), null, 2) }]
  })
);

(async () => {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('🏏 Cricsheet MCP server running');
})();