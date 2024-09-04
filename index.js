const fs = require('fs');
const path = require('path');

// Function to read and parse the groups data from a JSON file
function fetchGroupsData() {
    const filePath = path.join(__dirname, 'groups.json');
    try {
        const fileContent = fs.readFileSync(filePath, 'utf8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error('Error reading or parsing groups data:', error);
        return {};
    }
}

// Function to simulate a match result based on FIBA rankings
function simulateMatch(team1, team2) {
    const rankingDifference = team1.FIBARanking - team2.FIBARanking;
    const probability = 1 / (1 + Math.pow(10, -rankingDifference / 400));
    const result = Math.random();

    let winner, loser;
    if (result < probability) {
        winner = team1;
        loser = team2;
    } else {
        winner = team2;
        loser = team1;
    }

    // Generate a more realistic score
    const baseScore = 70;
    const maxScoreDifference = 30;
    const scoreDifference = Math.floor(Math.random() * maxScoreDifference) + 1;
    const winnerScore = baseScore + scoreDifference;
    const loserScore = baseScore;

    return { 
        winner: winner, 
        loser: loser, 
        score: [winnerScore, loserScore]
    };
}

// Function to simulate the group stage
function simulateGroupStage(groupsData) {
    return Object.entries(groupsData).reduce((groupResults, [groupName, teams]) => {
        const results = {
            teams: initializeTeams(teams),
            matches: []
        };

        for (let i = 0; i < teams.length; i++) {
            for (let j = i + 1; j < teams.length; j++) {
                const matchResult = simulateMatch(teams[i], teams[j]);
                results.matches.push(matchResult);
                updateTeamStats(results.teams, matchResult);
            }
        }

        results.teams.sort(sortTeams);
        groupResults[groupName] = results;
        return groupResults;
    }, {});
}

function initializeTeams(teams) {
    return teams.map(team => ({ ...team, points: 0, wins: 0, losses: 0, scored: 0, allowed: 0 }));
}

function updateTeamStats(teams, matchResult) {
    const winner = teams.find(team => team.Team === matchResult.winner.Team);
    const loser = teams.find(team => team.Team === matchResult.loser.Team);

    winner.wins++;
    winner.points += 2;
    winner.scored += matchResult.score[0];
    winner.allowed += matchResult.score[1];

    loser.losses++;
    loser.scored += matchResult.score[1];
    loser.allowed += matchResult.score[0];
}

function sortTeams(a, b) {
    return b.points - a.points || 
           (b.scored - b.allowed) - (a.scored - a.allowed) || 
           b.scored - a.scored;
}

// Function to display group stage results
function displayGroupStageResults(groupResults) {
    Object.entries(groupResults).forEach(([groupName, results]) => {
        console.log(`Group ${groupName} Results:`);
        
        displayMatches(results.matches);
        displayStandings(results.teams);
    });
}

function displayMatches(matches) {
    matches.forEach(match => {
        console.log(`${match.winner.Team} vs ${match.loser.Team} (${match.score[0]}:${match.score[1]})`);
    });
}

function displayStandings(teams) {
    console.log('Final Group Standings:');
    teams.forEach((team, index) => {
        console.log(formatTeamStanding(team, index));
    });
}

function formatTeamStanding(team, index) {
    return `${index + 1}. ${team.Team} - Wins: ${team.wins}, Losses: ${team.losses}, Points: ${team.points}, Scored: ${team.scored}, Allowed: ${team.allowed}, Difference: ${team.scored - team.allowed}`;
}

// Function to determine the knockout stage teams
function determineKnockoutStageTeams(groupResults) {
    const teams = [];
    for (const groupName in groupResults) {
        const results = groupResults[groupName];
        teams.push(results.teams[0]);
        teams.push(results.teams[1]);
        teams.push(results.teams[2]);
    }
    teams.sort((a, b) => b.points - a.points || (b.scored - b.allowed) - (a.scored - a.allowed) || b.scored - a.scored);
    return teams.slice(0, 8);
}

// Function to simulate the knockout stage
function simulateKnockoutStage(teams) {
    const pots = {
        D: [teams[0], teams[1]],
        E: [teams[2], teams[3]],
        F: [teams[4], teams[5]],
        G: [teams[6], teams[7]]
    };
    console.log('Pots:');
    console.log('Pot D:', pots.D.map(team => team.Team).join(', '));
    console.log('Pot E:', pots.E.map(team => team.Team).join(', '));
    console.log('Pot F:', pots.F.map(team => team.Team).join(', '));
    console.log('Pot G:', pots.G.map(team => team.Team).join(', '));

    const quarterFinals = [];
    quarterFinals.push(simulateMatch(pots.D[0], pots.G[0]));
    quarterFinals.push(simulateMatch(pots.D[1], pots.G[1]));
    quarterFinals.push(simulateMatch(pots.E[0], pots.F[0]));
    quarterFinals.push(simulateMatch(pots.E[1], pots.F[1]));

    console.log('Quarter-Finals:');
    quarterFinals.forEach(match => {
        console.log(`${match.winner.Team} vs ${match.loser.Team} (${match.score[0]}:${match.score[1]})`);
    });

    const semiFinals = [];
    semiFinals.push(simulateMatch(quarterFinals[0].winner, quarterFinals[2].winner));
    semiFinals.push(simulateMatch(quarterFinals[1].winner, quarterFinals[3].winner));

    console.log('Semi-Finals:');
    semiFinals.forEach(match => {
        console.log(`${match.winner.Team} vs ${match.loser.Team} (${match.score[0]}:${match.score[1]})`);
    });

    const final = simulateMatch(semiFinals[0].winner, semiFinals[1].winner);
    const thirdPlaceMatch = simulateMatch(semiFinals[0].loser, semiFinals[1].loser);

    console.log('Third-Place Match:');
    console.log(`${thirdPlaceMatch.winner.Team} vs ${thirdPlaceMatch.loser.Team} (${thirdPlaceMatch.score[0]}:${thirdPlaceMatch.score[1]})`);

    console.log('Final:');
    console.log(`${final.winner.Team} vs ${final.loser.Team} (${final.score[0]}:${final.score[1]})`);

    console.log('Medals:');
    console.log('Gold:', final.winner.Team);
    console.log('Silver:', final.loser.Team);
    console.log('Bronze:', thirdPlaceMatch.winner.Team);
}

// Main function to run the tournament simulation
function runTournamentSimulation() {
    const groupsData = fetchGroupsData();
    const groupResults = simulateGroupStage(groupsData);
    displayGroupStageResults(groupResults);
    const knockoutStageTeams = determineKnockoutStageTeams(groupResults);
    simulateKnockoutStage(knockoutStageTeams);
}

// Run the tournament simulation
runTournamentSimulation();