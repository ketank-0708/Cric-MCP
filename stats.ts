import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../data');

interface Delivery {
  batter: string; bowler: string;
  runs: { batter: number; extras: number; total: number };
  wickets?: Array<{ player_out: string; kind: string }>;
}

function loadAllMatches(matchType?: string): any[] {
  const dirs = matchType
    ? [path.join(DATA_DIR, matchType)]
    : fs.readdirSync(DATA_DIR).map(d => path.join(DATA_DIR, d));
  const matches: any[] = [];
  for (const dir of dirs) {
    if (!fs.statSync(dir).isDirectory()) continue;
    for (const file of fs.readdirSync(dir)) {
      if (!file.endsWith('.json')) continue;
      try {
        matches.push(JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8')));
      } catch {}
    }
  }
  return matches;
}

export function getBattingStats(player: string, matchType?: string, year?: number) {
  const matches = loadAllMatches(matchType);
  let runs=0, balls=0, innings=0, fifties=0, hundreds=0;
  let highScore=0, fours=0, sixes=0;

  for (const match of matches) {
    if (year && new Date(match.info?.dates?.[0]).getFullYear() !== year) continue;
    for (const inning of match.innings ?? []) {
      let iRuns=0, iBalls=0, batted=false;
      for (const over of inning.overs ?? [])
        for (const d of over.deliveries as Delivery[])
          if (d.batter.toLowerCase().includes(player.toLowerCase())) {
            batted=true; iRuns+=d.runs.batter; iBalls++;
            if (d.runs.batter===4) fours++;
            if (d.runs.batter===6) sixes++;
          }
      if (batted) {
        innings++; runs+=iRuns; balls+=iBalls;
        if (iRuns>highScore) highScore=iRuns;
        if (iRuns>=100) hundreds++; else if (iRuns>=50) fifties++;
      }
    }
  }
  return {
    player, matchType, year, innings, runs, balls,
    average: innings ? (runs/innings).toFixed(2) : '0',
    strikeRate: balls ? ((runs/balls)*100).toFixed(2) : '0',
    highScore, fifties, hundreds, fours, sixes
  };
}
export function getBowlingStats(player: string, matchType?: string, year?: number) {
  const matches = loadAllMatches(matchType);
  let wickets=0, runsConceded=0, ballsBowled=0, innings=0;
  const nonBowlerWickets = ['run out', 'retired hurt', 'obstructing the field'];

  for (const match of matches) {
    if (year && new Date(match.info?.dates?.[0]).getFullYear() !== year) continue;
    for (const inning of match.innings ?? []) {
      let bowled = false;
      for (const over of inning.overs ?? [])
        for (const d of over.deliveries as Delivery[])
          if (d.bowler.toLowerCase().includes(player.toLowerCase())) {
            bowled=true; runsConceded+=d.runs.total; ballsBowled++;
            for (const w of d.wickets??[])
              if (!nonBowlerWickets.includes(w.kind)) wickets++;
          }
      if (bowled) innings++;
    }
  }
  return {
    player, matchType, year, innings, wickets, runsConceded,
    overs: `${Math.floor(ballsBowled/6)}.${ballsBowled%6}`,
    economy: ballsBowled ? ((runsConceded/ballsBowled)*6).toFixed(2) : '0',
    average: wickets ? (runsConceded/wickets).toFixed(2) : 'N/A'
  };
}export function getTopRunScorers(matchType?: string, year?: number, limit=10) {
  const matches = loadAllMatches(matchType);
  const scorers: Record<string, number> = {};
  for (const match of matches) {
    if (year && new Date(match.info?.dates?.[0]).getFullYear() !== year) continue;
    for (const inning of match.innings??[])
      for (const over of inning.overs??[])
        for (const d of over.deliveries as Delivery[])
          scorers[d.batter] = (scorers[d.batter]??0) + d.runs.batter;
  }
  return Object.entries(scorers)
    .sort((a,b) => b[1]-a[1])
    .slice(0, limit)
    .map(([player, runs], i) => ({ rank: i+1, player, runs }));
}

export function getTopWicketTakers(matchType?: string, year?: number, limit=10) {
  const matches = loadAllMatches(matchType);
  const bowlers: Record<string, number> = {};
  for (const match of matches) {
    if (year && new Date(match.info?.dates?.[0]).getFullYear() !== year) continue;
    for (const inning of match.innings??[])
      for (const over of inning.overs??[])
        for (const d of over.deliveries as Delivery[])
          for (const w of d.wickets??[])
            if (!['run out','retired hurt'].includes(w.kind))
              bowlers[d.bowler] = (bowlers[d.bowler]??0) + 1;
  }
  return Object.entries(bowlers)
    .sort((a,b) => b[1]-a[1])
    .slice(0, limit)
    .map(([player, wickets], i) => ({ rank: i+1, player, wickets }));
}
export function getHeadToHead(team1: string, team2: string, matchType?: string) {
  const matches = loadAllMatches(matchType);
  let team1Wins=0, team2Wins=0, noResult=0;
  for (const match of matches) {
    const teams: string[] = match.info?.teams ?? [];
    const t1 = teams.find(t => t.toLowerCase().includes(team1.toLowerCase()));
    const t2 = teams.find(t => t.toLowerCase().includes(team2.toLowerCase()));
    if (!t1 || !t2) continue;
    const winner = match.info?.outcome?.winner;
    if (!winner) { noResult++; continue; }
    if (winner.toLowerCase().includes(team1.toLowerCase())) team1Wins++;
    else team2Wins++;
  }
  return {
    team1, team2, matchType,
    team1Wins, team2Wins, noResult,
    totalMatches: team1Wins + team2Wins + noResult
  };
}


