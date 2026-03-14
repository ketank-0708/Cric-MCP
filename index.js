"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mcp_js_1 = require("@modelcontextprotocol/sdk/server/mcp.js");
const stdio_js_1 = require("@modelcontextprotocol/sdk/server/stdio.js");
const zod_1 = require("zod");
const stats_js_1 = require("./stats.js");
const downloader_js_1 = require("./downloader.js");
const server = new mcp_js_1.McpServer({
    name: 'cricsheet-mcp',
    version: '1.0.0',
});
server.tool('download_cricket_data', 'Download match data. Types: t20i, odi, test, ipl', { match_types: zod_1.z.array(zod_1.z.string()).default(['t20i', 'odi']) }, async ({ match_types }) => {
    await (0, downloader_js_1.downloadMatches)(match_types);
    return { content: [{ type: 'text', text: `Downloaded: ${match_types.join(', ')}` }] };
});
server.tool('get_batting_stats', 'Batting stats for a player. Optional: match_type (t20i/odi/test/ipl), year', { player_name: zod_1.z.string(), match_type: zod_1.z.string().optional(), year: zod_1.z.number().optional() }, async ({ player_name, match_type, year }) => ({
    content: [{ type: 'text', text: JSON.stringify((0, stats_js_1.getBattingStats)(player_name, match_type, year), null, 2) }]
}));
server.tool('get_bowling_stats', 'Bowling stats for a player. Optional: match_type, year', { player_name: zod_1.z.string(), match_type: zod_1.z.string().optional(), year: zod_1.z.number().optional() }, async ({ player_name, match_type, year }) => ({
    content: [{ type: 'text', text: JSON.stringify((0, stats_js_1.getBowlingStats)(player_name, match_type, year), null, 2) }]
}));
server.tool('get_top_run_scorers', 'Leaderboard of top run scorers. Optional: match_type, year, limit', { match_type: zod_1.z.string().optional(), year: zod_1.z.number().optional(), limit: zod_1.z.number().default(10) }, async ({ match_type, year, limit }) => ({
    content: [{ type: 'text', text: JSON.stringify((0, stats_js_1.getTopRunScorers)(match_type, year, limit), null, 2) }]
}));
server.tool('get_top_wicket_takers', 'Leaderboard of top wicket takers. Optional: match_type, year, limit', { match_type: zod_1.z.string().optional(), year: zod_1.z.number().optional(), limit: zod_1.z.number().default(10) }, async ({ match_type, year, limit }) => ({
    content: [{ type: 'text', text: JSON.stringify((0, stats_js_1.getTopWicketTakers)(match_type, year, limit), null, 2) }]
}));
server.tool('get_head_to_head', 'Head-to-head record between two teams. Optional: match_type', { team1: zod_1.z.string(), team2: zod_1.z.string(), match_type: zod_1.z.string().optional() }, async ({ team1, team2, match_type }) => ({
    content: [{ type: 'text', text: JSON.stringify((0, stats_js_1.getHeadToHead)(team1, team2, match_type), null, 2) }]
}));
(async () => {
    const transport = new stdio_js_1.StdioServerTransport();
    await server.connect(transport);
    console.error('🏏 Cricsheet MCP server running');
})();
