
// Firebase initialization
var config = {
    apiKey: "AIzaSyC8f6X3dPhyU-zgvzMWlMh-WImPZsJMMh8",
    authDomain: "fantasyfootball-7496f.firebaseapp.com",
    databaseURL: "https://fantasyfootball-7496f-default-rtdb.firebaseio.com",
    projectId: "fantasyfootball-7496f",
    storageBucket: "fantasyfootball-7496f.appspot.com",
    messagingSenderId: "25543165955",
    appId: "1:25543165955:web:d5f11a0603ed3d63756636",
    measurementId: "G-BFTXL1LBKL"
};
firebase.initializeApp(config);
var database = firebase.database();
const dbRef = firebase.database().ref();

// Global variables
var pageYear;
var pageWeek;
var weekArray;
var weekData;
var matchupChartData;
var timelineChart;
var maxY;

var numberDST;
var numberFLEX;
var numberK;
var numberOP;
var numberQB;
var numberRB;
var numberTE;
var numberWR;
var totalPlayerCount;


/* FUNCTION: loadWeeklyStats
*
* Initialization function on page load
*
*/
function loadWeeklyStats() {
    changeYear()
}

function changeYear() {
    var yearSelect = document.getElementById("yearSelect");
    pageYear = yearSelect.value;

    return firebase.database().ref('/weeklyFantasyData/' + pageYear.toString() + '/weeksListing').once('value').then((snapshot) => {
        weekArray = snapshot.val();
        getPositionAmounts();
    });
      
}

function getPositionAmounts() {
    return firebase.database().ref('/weeklyFantasyData/' + pageYear.toString() + '/positionLimits').once('value').then((snapshot) => {
        var positionAmounts = snapshot.val();
        numberDST = positionAmounts.DST;
        numberFLEX = positionAmounts.FLEX;
        numberK = positionAmounts.K;
        numberOP = positionAmounts.OP;
        numberQB = positionAmounts.QB;
        numberRB = positionAmounts.RB;
        numberTE = positionAmounts.TE;
        numberWR = positionAmounts.WR;
        totalPlayerCount = numberWR + numberTE + numberRB + numberQB + numberOP + numberK + numberFLEX + numberDST;
        updateWeekPulldown();
    });
}

function updateWeekPulldown() {

    var weekSelect = document.getElementById("week-select");
    while(weekSelect.hasChildNodes()) {
        weekSelect.removeChild(weekSelect.firstChild);
    }

    for(var i = 0; i < weekArray.length; i++) {
        var opt = document.createElement('option');
        opt.value = weekArray[i];
        opt.innerHTML = weekArray[i].toString();
        weekSelect.appendChild(opt);
        if(i == weekArray.length - 1) {
            opt.selected = true;
        }
    }

    changeWeek()
}

function changeWeek(){
    var weekSelect = document.getElementById("week-select");
    pageWeek = weekSelect.value;

    return firebase.database().ref('/weeklyFantasyData/' + pageYear.toString() + '/weeks/' + pageWeek.toString()).once('value').then((snapshot) => {
        weekData = snapshot.val();
        getMatchupChartData();
        setMatchupCharts();
        updatePage();
        
    });
}

function updatePage() {

    ////////////////////////////////////////////////////////
    // GET ARRAY OF JUST TEAM PERFORMANCES (NOT SPLIT INTO MATCHUPS AS IT COMES IN)
    ////////////////////////////////////////////////////////
    var teamPerformance = []
    for(var i = 0; i < weekData.games.length; i++) {
        teamPerformance.push({
            "owner": weekData.games[i].winner.owner,
            "results": "Win",
            "score": weekData.games[i].winner.points,
            "bestBallScore": -1000.0,
            "bestBallDiff": -1000.0,
            "opponent": weekData.games[i].loser.owner,
            "pointBreakdownTDS": weekData.games[i].winner.pointsCategories.tds,
            "pointBreakdownYards": weekData.games[i].winner.pointsCategories.yards,
            "pointBreakdownReceptions": weekData.games[i].winner.pointsCategories.receptions,
            "pointBreakdownKDST": weekData.games[i].winner.pointsCategories.kdst,
            "pointBreakdownMisc": weekData.games[i].winner.pointsCategories.misc,
            "bestBallRemovePlayers": [],
            "bestBallStartPlayers": [],
            "rank": -1
        })
        teamPerformance.push({
            "owner": weekData.games[i].loser.owner,
            "results": "Loss",
            "score": weekData.games[i].loser.points,
            "bestBallScore": -1000.0,
            "bestBallDiff": -1000.0,
            "opponent": weekData.games[i].winner.owner,
            "pointBreakdownTDS": weekData.games[i].loser.pointsCategories.tds,
            "pointBreakdownYards": weekData.games[i].loser.pointsCategories.yards,
            "pointBreakdownReceptions": weekData.games[i].loser.pointsCategories.receptions,
            "pointBreakdownKDST": weekData.games[i].loser.pointsCategories.kdst,
            "pointBreakdownMisc": weekData.games[i].loser.pointsCategories.misc,
            "bestBallRemovePlayers": [],
            "bestBallStartPlayers": [],
            "rank": -1
        })
    } 

    // Sort high to low
    teamPerformance.sort(function(a,b) {
        return b.score - a.score
    });

    // Fill in rank
    for(var i = 0; i < teamPerformance.length; i++){
        teamPerformance[i].rank = i+1;
    }

    ////////////////////////////////////////////////////////
    // MATCHUP TABLE
    ////////////////////////////////////////////////////////

    // Get table element and clear all of the rows
    var tableBody = document.getElementById("matchupsTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Loop through matchups based on rank and add them to the table
    for(var i = 0; i < teamPerformance.length; i++) {
        if(teamPerformance[i].results == "Win") {
            tr = tableBody.insertRow(-1);  
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = teamPerformance[i].owner;
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = i+1;
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(teamPerformance[i].score*100)/100;
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "    ";
            tabCell.style.borderTop = "None";
            tabCell.style.borderBottom = "None";
            tabCell.style.backgroundColor = "White";

            for(var j = i+1; j < teamPerformance.length; j++){

                if(teamPerformance[j].opponent == teamPerformance[i].owner){
                    tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = teamPerformance[j].owner;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = j+1;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = Math.round(teamPerformance[j].score*100)/100;
                    break;
                }
            }

        }
    }


    ////////////////////////////////////////////////////////
    // POINT BREAKDOWN TABLE
    ////////////////////////////////////////////////////////

    // Get table element and clear all of the rows
    var tableBody = document.getElementById("pointsBreakdownTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Loop through teams based on rank and add them to the table
    for(var i = 0; i < teamPerformance.length; i++) {
        tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = i+1;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = teamPerformance[i].owner;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = Math.round(teamPerformance[i].score*100)/100;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = Math.round(teamPerformance[i].pointBreakdownTDS*100)/100;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = Math.round(teamPerformance[i].pointBreakdownYards*100)/100;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = Math.round(teamPerformance[i].pointBreakdownReceptions*100)/100;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = Math.round(teamPerformance[i].pointBreakdownKDST*100)/100;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = Math.round(teamPerformance[i].pointBreakdownMisc*100)/100;
    }


    ////////////////////////////////////////////////////////
    // TOP SCORES/WEEK BY POSITION TABLE AND DRAWDOWN
    ////////////////////////////////////////////////////////

    // Load position data with QB
    loadPositionalPerformances()


    ////////////////////////////////////////////////////////
    // BEST BALL TABLE
    ////////////////////////////////////////////////////////

    // Loop through teams and determine best ball scores
    for(var i = 0; i < weekData.games.length; i++) {

        var players = getPlayersOnTeam(weekData.games[i].winner);

        for(var j = 0; j < teamPerformance.length; j++) {
            if(weekData.games[i].winner.owner == teamPerformance[j].owner) {
                fillInBestBall(teamPerformance[j], players);
                break;
            }
        }


        var players = getPlayersOnTeam(weekData.games[i].loser);

        for(var j = 0; j < teamPerformance.length; j++) {
            if(weekData.games[i].loser.owner == teamPerformance[j].owner) {
                fillInBestBall(teamPerformance[j], players);
                break;
            }
        }
    }

    // Get table element and clear all of the rows
    var tableBody = document.getElementById("bestBallTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Sort High to low
    teamPerformance.sort(function(a,b) {
        return b.bestBallDiff - a.bestBallDiff
    });

    for(var i = 0; i < teamPerformance.length; i++) {

        var oppID = -1;
        for(var j = 0; j < teamPerformance.length; j++){
            if(teamPerformance[j].owner == teamPerformance[i].opponent) {
                oppID = j;
                break;
            }
        }

        var resultFlipped = false;
        if(teamPerformance[i].results == "Win") {
            if(teamPerformance[i].bestBallScore < teamPerformance[oppID].bestBallScore)
                resultFlipped = true;
        } else {
            if(teamPerformance[i].bestBallScore > teamPerformance[oppID].bestBallScore)
                resultFlipped = true;
        }


        tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = teamPerformance[i].rank;
        if(resultFlipped) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = teamPerformance[i].owner;
        if(resultFlipped) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = teamPerformance[i].results;
        if(resultFlipped) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = Math.round(teamPerformance[i].score*100)/100;
        if(resultFlipped) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = Math.round(teamPerformance[i].bestBallScore*100)/100;
        if(resultFlipped) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = teamPerformance[i].bestBallRemovePlayers;
        if(resultFlipped) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = teamPerformance[i].bestBallStartPlayers;
        if(resultFlipped) tabCell.style.backgroundColor = "#ffd500";
    }

    ////////////////////////////////////////////////////////
    // MATCHUP CHARTS
    ////////////////////////////////////////////////////////

    changeMatchup()
}


/* FUNCTION: loadPositionalPerformances
*
* Loads the position for weekly top scores for a position table.
* Called whenever the drawdown menu changes.
*
*/
function loadPositionalPerformances() {

    // Gets position value from the pulldown
    var e = document.getElementById("positions");
    var position = e.value;

    // Loads data based on the position selected
    var positionData = [];
    if(position == 0){
        positionData = weekData.players.qb;
    }else if (position == 1) {
        positionData = weekData.players.rb;
    }else if (position == 2) {
        positionData = weekData.players.wr;
    }else if (position == 3) {
        positionData = weekData.players.te;
    }else if (position == 4) {
        positionData = weekData.players.k;
    }else if (position == 5) {
        positionData = weekData.players.dst;
    }

    // Gets table element and clears rows
    var tableBody = document.getElementById("positionalPerformancesTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Loads rows into table
    for(var i = 0; i < positionData.length; i++) {
        tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = i+1;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "9%";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = positionData[i].name;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "38%";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = positionData[i].score;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "14%";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = positionData[i].owner;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "27%";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = positionData[i].status;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "12%";
    }
}




function getPlayersOnTeam(team) {

    var players = []

    // Get QBs
    if (team.position.QB != undefined) {
        for(var i = 0; i < team.position.QB.length; i++) {
            players.push({
                "name": team.position.QB[i].name,
                "position": "QB",
                "points": team.position.QB[i].totalPoints,
                "status": "Active"
            })
        }
    }

    // Get RBs
    if (team.position.RB != undefined) {
        for(var i = 0; i < team.position.RB.length; i++) {
            players.push({
                "name": team.position.RB[i].name,
                "position": "RB",
                "points": team.position.RB[i].totalPoints,
                "status": "Active"
            })
        }
    }

    // Get WRs
    if (team.position.WR != undefined) {
        for(var i = 0; i < team.position.WR.length; i++) {
            players.push({
                "name": team.position.WR[i].name,
                "position": "WR",
                "points": team.position.WR[i].totalPoints,
                "status": "Active"
            })
        }
    }

    // Get TEs
    if (team.position.TE != undefined) {
        for(var i = 0; i < team.position.TE.length; i++) {
            players.push({
                "name": team.position.TE[i].name,
                "position": "TE",
                "points": team.position.TE[i].totalPoints,
                "status": "Active"
            })
        }
    }

    // Get Ks
    if (team.position.K != undefined) {
        for(var i = 0; i < team.position.K.length; i++) {
            players.push({
                "name": team.position.K[i].name,
                "position": "K",
                "points": team.position.K[i].totalPoints,
                "status": "Active"
            })
        }
    }

    // Get DSTs
    if (team.position.DST != undefined) {
        for(var i = 0; i < team.position.DST.length; i++) {
            players.push({
                "name": team.position.DST[i].name,
                "position": "DST",
                "points": team.position.DST[i].totalPoints,
                "status": "Active"
            })
        }
    }

    // Get OPs
    if (team.position.OP != undefined) {
        for(var i = 0; i < team.position.OP.length; i++) {

            var foundEntry = false;
            for(var j = 0; j < weekData.players.qb.length; j++) {
                if(weekData.players.qb[j].name == team.position.OP[i].name && Math.abs(weekData.players.qb[j].score - team.position.OP[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.OP[i].name,
                        "position": "QB",
                        "points": team.position.OP[i].totalPoints,
                        "status": "Active"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;

            for(var j = 0; j < weekData.players.rb.length; j++) {
                if(weekData.players.rb[j].name == team.position.OP[i].name && Math.abs(weekData.players.rb[j].score - team.position.OP[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.OP[i].name,
                        "position": "RB",
                        "points": team.position.OP[i].totalPoints,
                        "status": "Active"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;

            for(var j = 0; j < weekData.players.wr.length; j++) {
                if(weekData.players.wr[j].name == team.position.OP[i].name && Math.abs(weekData.players.wr[j].score - team.position.OP[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.OP[i].name,
                        "position": "WR",
                        "points": team.position.OP[i].totalPoints,
                        "status": "Active"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;
            
            for(var j = 0; j < weekData.players.te.length; j++) {
                if(weekData.players.te[j].name == team.position.OP[i].name && Math.abs(weekData.players.te[j].score - team.position.OP[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.OP[i].name,
                        "position": "TE",
                        "points": team.position.OP[i].totalPoints,
                        "status": "Active"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;
        }
    }

    // Get FLEXs
    if (team.position.FLEX != undefined) {
        for(var i = 0; i < team.position.FLEX.length; i++) {

            var foundEntry = false;
            for(var j = 0; j < weekData.players.rb.length; j++) {
                if(weekData.players.rb[j].name == team.position.FLEX[i].name && Math.abs(weekData.players.rb[j].score - team.position.FLEX[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.FLEX[i].name,
                        "position": "RB",
                        "points": team.position.FLEX[i].totalPoints,
                        "status": "Active"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;

            for(var j = 0; j < weekData.players.wr.length; j++) {
                if(weekData.players.wr[j].name == team.position.FLEX[i].name && Math.abs(weekData.players.wr[j].score - team.position.FLEX[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.FLEX[i].name,
                        "position": "WR",
                        "points": team.position.FLEX[i].totalPoints,
                        "status": "Active"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;
            
            for(var j = 0; j < weekData.players.te.length; j++) {
                if(weekData.players.te[j].name == team.position.FLEX[i].name && Math.abs(weekData.players.te[j].score - team.position.FLEX[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.FLEX[i].name,
                        "position": "TE",
                        "points": team.position.FLEX[i].totalPoints,
                        "status": "Active"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;
        }
    }

    // Get BENCHs
    if (team.position.BENCH != undefined) {
        for(var i = 0; i < team.position.BENCH.length; i++) {

            var foundEntry = false;
            for(var j = 0; j < weekData.players.qb.length; j++) {
                if(weekData.players.qb[j].name == team.position.BENCH[i].name && Math.abs(weekData.players.qb[j].score - team.position.BENCH[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.BENCH[i].name,
                        "position": "QB",
                        "points": team.position.BENCH[i].totalPoints,
                        "status": "Inactive"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;

            for(var j = 0; j < weekData.players.rb.length; j++) {
                if(weekData.players.rb[j].name == team.position.BENCH[i].name && Math.abs(weekData.players.rb[j].score - team.position.BENCH[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.BENCH[i].name,
                        "position": "RB",
                        "points": team.position.BENCH[i].totalPoints,
                        "status": "Inactive"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;

            for(var j = 0; j < weekData.players.wr.length; j++) {
                if(weekData.players.wr[j].name == team.position.BENCH[i].name && Math.abs(weekData.players.wr[j].score - team.position.BENCH[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.BENCH[i].name,
                        "position": "WR",
                        "points": team.position.BENCH[i].totalPoints,
                        "status": "Inactive"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;
            
            for(var j = 0; j < weekData.players.te.length; j++) {
                if(weekData.players.te[j].name == team.position.BENCH[i].name && Math.abs(weekData.players.te[j].score - team.position.BENCH[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.BENCH[i].name,
                        "position": "TE",
                        "points": team.position.BENCH[i].totalPoints,
                        "status": "Inactive"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;

            for(var j = 0; j < weekData.players.k.length; j++) {
                if(weekData.players.k[j].name == team.position.BENCH[i].name && Math.abs(weekData.players.k[j].score - team.position.BENCH[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.BENCH[i].name,
                        "position": "K",
                        "points": team.position.BENCH[i].totalPoints,
                        "status": "Inactive"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;

            for(var j = 0; j < weekData.players.dst.length; j++) {
                if(weekData.players.dst[j].name == team.position.BENCH[i].name && Math.abs(weekData.players.dst[j].score - team.position.BENCH[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.BENCH[i].name,
                        "position": "DST",
                        "points": team.position.BENCH[i].totalPoints,
                        "status": "Inactive"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;
        }
    }

    // Get IRs
    if (team.position.IR != undefined) {
        for(var i = 0; i < team.position.IR.length; i++) {

            var foundEntry = false;
            for(var j = 0; j < weekData.players.qb.length; j++) {
                if(weekData.players.qb[j].name == team.position.IR[i].name && Math.abs(weekData.players.qb[j].score - team.position.IR[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.IR[i].name,
                        "position": "QB",
                        "points": team.position.IR[i].totalPoints,
                        "status": "Inactive"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;

            for(var j = 0; j < weekData.players.rb.length; j++) {
                if(weekData.players.rb[j].name == team.position.IR[i].name && Math.abs(weekData.players.rb[j].score - team.position.IR[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.IR[i].name,
                        "position": "RB",
                        "points": team.position.IR[i].totalPoints,
                        "status": "Inactive"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;

            for(var j = 0; j < weekData.players.wr.length; j++) {
                if(weekData.players.wr[j].name == team.position.IR[i].name && Math.abs(weekData.players.wr[j].score - team.position.IR[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.IR[i].name,
                        "position": "WR",
                        "points": team.position.IR[i].totalPoints,
                        "status": "Inactive"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;
            
            for(var j = 0; j < weekData.players.te.length; j++) {
                if(weekData.players.te[j].name == team.position.IR[i].name && Math.abs(weekData.players.te[j].score - team.position.IR[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.IR[i].name,
                        "position": "TE",
                        "points": team.position.IR[i].totalPoints,
                        "status": "Inactive"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;

            for(var j = 0; j < weekData.players.k.length; j++) {
                if(weekData.players.k[j].name == team.position.IR[i].name && Math.abs(weekData.players.k[j].score - team.position.IR[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.IR[i].name,
                        "position": "K",
                        "points": team.position.IR[i].totalPoints,
                        "status": "Inactive"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;

            for(var j = 0; j < weekData.players.dst.length; j++) {
                if(weekData.players.dst[j].name == team.position.IR[i].name && Math.abs(weekData.players.dst[j].score - team.position.IR[i].totalPoints) < 0.000001) {
                    players.push({
                        "name": team.position.IR[i].name,
                        "position": "DST",
                        "points": team.position.IR[i].totalPoints,
                        "status": "Inactive"
                    })
                    foundEntry = true;
                    break;
                }
            }
            if(foundEntry) continue;
        }
    }

    return players;
}




function fillInBestBall(team, players) {
    players.sort(function(a,b) {
        return b.points - a.points
    });


    var qbCount = 0;
    var rbCount = 0;
    var wrCount = 0;
    var teCount = 0;
    var opCount = 0;
    var flexCount = 0;
    var dstCount = 0;
    var kCount = 0;
    var totalCount = 0;

    var bestBallPoints = 0;

    var startList = [];

    for(var i = 0; i < players.length; i++){

        if(players[i].position == "QB"){
            if(qbCount < numberQB) {
                startList.push(players[i].name);
                bestBallPoints += players[i].points;
                qbCount++;
                totalCount++;
            } else if (opCount < numberOP) {
                startList.push(players[i].name);
                bestBallPoints += players[i].points;
                opCount++;
                totalCount++;
            }
        }else if(players[i].position == "RB"){
            if(rbCount < numberRB) {
                startList.push(players[i].name);
                bestBallPoints += players[i].points;
                rbCount++;
                totalCount++;
            } else if (flexCount < numberFLEX) {
                startList.push(players[i].name);
                bestBallPoints += players[i].points;
                flexCount++;
                totalCount++;
            } else if (opCount < numberOP) {
                startList.push(players[i].name);
                bestBallPoints += players[i].points;
                opCount++;
                totalCount++;
            }
        }else if(players[i].position == "WR"){
            if(wrCount < numberWR) {
                startList.push(players[i].name);
                bestBallPoints += players[i].points;
                wrCount++;
                totalCount++;
            } else if (flexCount < numberFLEX) {
                startList.push(players[i].name);
                bestBallPoints += players[i].points;
                flexCount++;
                totalCount++;
            } else if (opCount < numberOP) {
                startList.push(players[i].name);
                bestBallPoints += players[i].points;
                opCount++;
                totalCount++;
            }
        }else if(players[i].position == "TE"){
            if(teCount < numberTE) {
                startList.push(players[i].name);
                bestBallPoints += players[i].points;
                teCount++;
                totalCount++;
            } else if (flexCount < numberFLEX) {
                startList.push(players[i].name);
                bestBallPoints += players[i].points;
                flexCount++;
                totalCount++;
            } else if (opCount < numberOP) {
                startList.push(players[i].name);
                bestBallPoints += players[i].points;
                opCount++;
                totalCount++;
            }
        }else if(players[i].position == "K"){
            if(kCount < numberK) {
                startList.push(players[i].name);
                bestBallPoints += players[i].points;
                kCount++;
                totalCount++;
            }
        }else if(players[i].position == "DST"){
            if(dstCount < numberDST) {
                startList.push(players[i].name);
                bestBallPoints += players[i].points;
                dstCount++;
                totalCount++;
            }
        }

        if(totalCount == totalPlayerCount) break;
    }


   

    for(var i = 0; i < players.length; i++){
        if(players[i].status == "Inactive") continue;

        foundEntry = false;
        for(var j = 0; j < startList.length; j++) {
            if(startList[j] == players[i].name) {
                foundEntry = true;
                break;
            }
        }
        if(!foundEntry) team.bestBallRemovePlayers.push(players[i].name)
    }

    for(var i = 0; i < players.length; i++){
        for(var j = 0; j < startList.length; j++) {
            if(startList[j] == players[i].name) {
                if(players[i].status == "Inactive") team.bestBallStartPlayers.push(players[i].name)
                break;
            }
        }
    }

    team.bestBallScore = bestBallPoints;
    team.bestBallDiff = bestBallPoints - team.score;

}





function getMatchupChartData() {
    matchupChartData = []

    var endTime = weekData.gameBlocks[weekData.gameBlocks.length - 1][1];

    for(var i = 0; i < weekData.games.length; i++) {
        var index = matchupChartData.length;
        matchupChartData.push({
            "winner": weekData.games[i].winner.owner,
            "loser": weekData.games[i].loser.owner,
            "winnerPoints": weekData.games[i].winner.points,
            "loserPoints": weekData.games[i].loser.points,
            "absPointDiff": Math.round(Math.abs(weekData.games[i].winner.points - weekData.games[i].loser.points)*100)/100,
            "winnerTimeline": [],
            "loserTimeline": []
        })

        // Get winner timeline data filled in
        if(weekData.games[i].winner.position.QB != undefined) {
            for(var j = 0; j < weekData.games[i].winner.position.QB.length; j++){
                if(weekData.games[i].winner.position.QB[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].winner.position.QB[j].plays.length; k++){
                    matchupChartData[index].winnerTimeline.push([
                        weekData.games[i].winner.position.QB[j].plays[k][0],    // The time of the play
                        weekData.games[i].winner.position.QB[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        if(weekData.games[i].winner.position.RB != undefined) {
            for(var j = 0; j < weekData.games[i].winner.position.RB.length; j++){
                if(weekData.games[i].winner.position.RB[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].winner.position.RB[j].plays.length; k++){
                    matchupChartData[index].winnerTimeline.push([
                        weekData.games[i].winner.position.RB[j].plays[k][0],    // The time of the play
                        weekData.games[i].winner.position.RB[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        if(weekData.games[i].winner.position.WR != undefined) {
            for(var j = 0; j < weekData.games[i].winner.position.WR.length; j++){
                if(weekData.games[i].winner.position.WR[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].winner.position.WR[j].plays.length; k++){
                    matchupChartData[index].winnerTimeline.push([
                        weekData.games[i].winner.position.WR[j].plays[k][0],    // The time of the play
                        weekData.games[i].winner.position.WR[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        if(weekData.games[i].winner.position.TE != undefined) {
            for(var j = 0; j < weekData.games[i].winner.position.TE.length; j++){
                if(weekData.games[i].winner.position.TE[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].winner.position.TE[j].plays.length; k++){
                    matchupChartData[index].winnerTimeline.push([
                        weekData.games[i].winner.position.TE[j].plays[k][0],    // The time of the play
                        weekData.games[i].winner.position.TE[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        if(weekData.games[i].winner.position.OP != undefined) {
            for(var j = 0; j < weekData.games[i].winner.position.OP.length; j++){
                if(weekData.games[i].winner.position.OP[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].winner.position.OP[j].plays.length; k++){
                    matchupChartData[index].winnerTimeline.push([
                        weekData.games[i].winner.position.OP[j].plays[k][0],    // The time of the play
                        weekData.games[i].winner.position.OP[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        if(weekData.games[i].winner.position.FLEX != undefined) {
            for(var j = 0; j < weekData.games[i].winner.position.FLEX.length; j++){
                if(weekData.games[i].winner.position.FLEX[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].winner.position.FLEX[j].plays.length; k++){
                    matchupChartData[index].winnerTimeline.push([
                        weekData.games[i].winner.position.FLEX[j].plays[k][0],    // The time of the play
                        weekData.games[i].winner.position.FLEX[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        if(weekData.games[i].winner.position.K != undefined) {
            for(var j = 0; j < weekData.games[i].winner.position.K.length; j++){
                if(weekData.games[i].winner.position.K[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].winner.position.K[j].plays.length; k++){
                    matchupChartData[index].winnerTimeline.push([
                        weekData.games[i].winner.position.K[j].plays[k][0],    // The time of the play
                        weekData.games[i].winner.position.K[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        if(weekData.games[i].winner.position.DST != undefined) {
            for(var j = 0; j < weekData.games[i].winner.position.DST.length; j++){
                if(weekData.games[i].winner.position.DST[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].winner.position.DST[j].plays.length; k++){
                    matchupChartData[index].winnerTimeline.push([
                        weekData.games[i].winner.position.DST[j].plays[k][0],    // The time of the play
                        weekData.games[i].winner.position.DST[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        matchupChartData[index].winnerTimeline.push([0.0, 0.0])
        matchupChartData[index].winnerTimeline.push([endTime, 0.0])

        // Get loser timeline data filled in
        if(weekData.games[i].loser.position.QB != undefined) {
            for(var j = 0; j < weekData.games[i].loser.position.QB.length; j++){
                if(weekData.games[i].loser.position.QB[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].loser.position.QB[j].plays.length; k++){
                    matchupChartData[index].loserTimeline.push([
                        weekData.games[i].loser.position.QB[j].plays[k][0],    // The time of the play
                        weekData.games[i].loser.position.QB[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        if(weekData.games[i].loser.position.RB != undefined) {
            for(var j = 0; j < weekData.games[i].loser.position.RB.length; j++){
                if(weekData.games[i].loser.position.RB[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].loser.position.RB[j].plays.length; k++){
                    matchupChartData[index].loserTimeline.push([
                        weekData.games[i].loser.position.RB[j].plays[k][0],    // The time of the play
                        weekData.games[i].loser.position.RB[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        if(weekData.games[i].loser.position.WR != undefined) {
            for(var j = 0; j < weekData.games[i].loser.position.WR.length; j++){
                if(weekData.games[i].loser.position.WR[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].loser.position.WR[j].plays.length; k++){
                    matchupChartData[index].loserTimeline.push([
                        weekData.games[i].loser.position.WR[j].plays[k][0],    // The time of the play
                        weekData.games[i].loser.position.WR[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        if(weekData.games[i].loser.position.TE != undefined) {
            for(var j = 0; j < weekData.games[i].loser.position.TE.length; j++){
                if(weekData.games[i].loser.position.TE[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].loser.position.TE[j].plays.length; k++){
                    matchupChartData[index].loserTimeline.push([
                        weekData.games[i].loser.position.TE[j].plays[k][0],    // The time of the play
                        weekData.games[i].loser.position.TE[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        if(weekData.games[i].loser.position.OP != undefined) {
            for(var j = 0; j < weekData.games[i].loser.position.OP.length; j++){
                if(weekData.games[i].loser.position.OP[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].loser.position.OP[j].plays.length; k++){
                    matchupChartData[index].loserTimeline.push([
                        weekData.games[i].loser.position.OP[j].plays[k][0],    // The time of the play
                        weekData.games[i].loser.position.OP[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        if(weekData.games[i].loser.position.FLEX != undefined) {
            for(var j = 0; j < weekData.games[i].loser.position.FLEX.length; j++){
                if(weekData.games[i].loser.position.FLEX[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].loser.position.FLEX[j].plays.length; k++){
                    matchupChartData[index].loserTimeline.push([
                        weekData.games[i].loser.position.FLEX[j].plays[k][0],    // The time of the play
                        weekData.games[i].loser.position.FLEX[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        if(weekData.games[i].loser.position.K != undefined) {
            for(var j = 0; j < weekData.games[i].loser.position.K.length; j++){
                if(weekData.games[i].loser.position.K[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].loser.position.K[j].plays.length; k++){
                    matchupChartData[index].loserTimeline.push([
                        weekData.games[i].loser.position.K[j].plays[k][0],    // The time of the play
                        weekData.games[i].loser.position.K[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        if(weekData.games[i].loser.position.DST != undefined) {
            for(var j = 0; j < weekData.games[i].loser.position.DST.length; j++){
                if(weekData.games[i].loser.position.DST[j].plays != undefined) {
                for(var k = 0; k < weekData.games[i].loser.position.DST[j].plays.length; k++){
                    matchupChartData[index].loserTimeline.push([
                        weekData.games[i].loser.position.DST[j].plays[k][0],    // The time of the play
                        weekData.games[i].loser.position.DST[j].plays[k][1]     // The points from the play
                    ])
                }
            }
            }
        }
        matchupChartData[index].loserTimeline.push([0.0, 0.0])
        matchupChartData[index].loserTimeline.push([endTime, 0.0])

        // Sort all the entries by time (low to high)
        matchupChartData[index].winnerTimeline.sort(function(a,b) {
            return a[0] - b[0]
        });
        matchupChartData[index].loserTimeline.sort(function(a,b) {
            return a[0] - b[0]
        });

        // Get cumulative sum
        for(var j = 1; j < matchupChartData[index].winnerTimeline.length; j++){
            matchupChartData[index].winnerTimeline[j][1] += matchupChartData[index].winnerTimeline[j-1][1];
        }
        for(var j = 1; j < matchupChartData[index].loserTimeline.length; j++){
            matchupChartData[index].loserTimeline[j][1] += matchupChartData[index].loserTimeline[j-1][1];
        }
        
        // Round
        for(var j = 1; j < matchupChartData[index].winnerTimeline.length; j++){
            matchupChartData[index].winnerTimeline[j][1] = Math.round(matchupChartData[index].winnerTimeline[j][1]*100)/100;
        }
        for(var j = 1; j < matchupChartData[index].loserTimeline.length; j++){
            matchupChartData[index].loserTimeline[j][1] = Math.round(matchupChartData[index].loserTimeline[j][1]*100)/100;
        }

        // Working from the back, insert steps
        var count = 1;
        while(true){
            matchupChartData[index].winnerTimeline.splice(count, 0, [matchupChartData[index].winnerTimeline[count][0],matchupChartData[index].winnerTimeline[count-1][1]]);
            count+=2;
            if (count >= matchupChartData[index].winnerTimeline.length-1) break;
        }
        count = 1;
        while(true){
            matchupChartData[index].loserTimeline.splice(count, 0, [matchupChartData[index].loserTimeline[count][0],matchupChartData[index].loserTimeline[count-1][1]]);
            count+=2;
            if (count >= matchupChartData[index].loserTimeline.length-1) break;
        }
    }

    // Sort games from lowest difference to highest difference (low to high)
    matchupChartData.sort(function(a,b) {
        return a.absPointDiff - b.absPointDiff
    });

    console.log(matchupChartData);

}


function setMatchupCharts() {

    // Get matchups pull down and clear
    var selectObj = document.getElementById("matchup-select");
    while(selectObj.hasChildNodes()) {
        selectObj.removeChild(selectObj.firstChild);
    }

    // Fill in pull down with applicable matchups
    for(var i = 0; i < matchupChartData.length; i++){
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = matchupChartData[i].winner + " vs. " + matchupChartData[i].loser;
        selectObj.appendChild(opt);
    }
    selectObj.selectedIndex = 0;

    // Determine maximum height
    maxY = 0;
    for(var i = 0; i < matchupChartData.length; i++){
        if(matchupChartData[i].winnerPoints > maxY) maxY = matchupChartData[i].winnerPoints;
        if(matchupChartData[i].loserPoints > maxY) maxY = matchupChartData[i].loserPoints;
    }
    maxY = Math.ceil(maxY/25.0) * 25.0;

}

function changeMatchup() {

    // Get matchup index from the pulldown
    var e = document.getElementById("matchup-select");
    var matchupIndex = e.value;

    ////////////////////////////////////////////////////////
    // CHART
    ////////////////////////////////////////////////////////

    // Fill in data to be graphed
    var maxX = 0;
    var winnerData = []
    for(var i = 0; i < matchupChartData[matchupIndex].winnerTimeline.length; i++){
        var subtractAmount = 0;
        for(var j = 0; j < weekData.gameBlocks.length-1; j++){
            if(matchupChartData[matchupIndex].winnerTimeline[i][0] <= weekData.gameBlocks[j][1] + 0.1) break;
            subtractAmount += weekData.gameBlocks[j+1][0] - 1200 - (weekData.gameBlocks[j][1] + 1200);
        }
        winnerData.push({x:matchupChartData[matchupIndex].winnerTimeline[i][0] - subtractAmount, y:matchupChartData[matchupIndex].winnerTimeline[i][1]})
        if(matchupChartData[matchupIndex].winnerTimeline[i][0] - subtractAmount>maxX) maxX = matchupChartData[matchupIndex].winnerTimeline[i][0] - subtractAmount;
    }

    var loserData = []
    for(var i = 0; i < matchupChartData[matchupIndex].loserTimeline.length; i++){
        var subtractAmount = 0;
        for(var j = 0; j < weekData.gameBlocks.length-1; j++){
            if(matchupChartData[matchupIndex].loserTimeline[i][0] <= weekData.gameBlocks[j][1] + 0.1) break;
            subtractAmount += weekData.gameBlocks[j+1][0] - 1200 - (weekData.gameBlocks[j][1] + 1200);
        }
        loserData.push({x:matchupChartData[matchupIndex].loserTimeline[i][0] - subtractAmount, y:matchupChartData[matchupIndex].loserTimeline[i][1]})
        if(matchupChartData[matchupIndex].loserTimeline[i][0] - subtractAmount>maxX) maxX = matchupChartData[matchupIndex].loserTimeline[i][0] - subtractAmount;
    }

    dataSet = [
        {
            "label":matchupChartData[matchupIndex].winner + " (Winner)",
            "data":winnerData,
            "fill": false,
            "lineTension": 0,
            'borderColor': '#006400',
            'fillColor': '#006400',
            showLine: true,
            pointRadius: 0
        },
        {
            "label":matchupChartData[matchupIndex].loser + " (Loser)",
            "data":loserData,
            "fill": false,
            "lineTension": 0,
            'borderColor': '#b22222',
            'fillColor': '#b22222',
            showLine: true,
            pointRadius: 0
        }
    ]
    var lineX = 0;
    for(var j = 0; j < weekData.gameBlocks.length-1; j++){
        lineX += weekData.gameBlocks[j][1] - weekData.gameBlocks[j][0] + 2400;
        dataSet.push({
            "label":"DELETE",
            "data":[{x:lineX,y:0},{x:lineX,y:maxY}],
            "fill": false,
            "lineTension": 0,
            'borderColor': '#808080',
            'fillColor': '#808080',
            showLine: true,
            pointRadius: 0
        })
    }

    // Get chart element
    graph = document.getElementById("matchupTrendChart");
    
    // Clear all data/destroy if needed (not first load)
    if (typeof timelineChart !== 'undefined'){
        timelineChart.destroy();
    }

    // Create graph
    timelineChart = new Chart(graph, {
        type: 'scatter',
        data: {
            datasets: dataSet
        },
        options: {
            legend: {
                display: true,
                position: 'chartArea',
                labels: {
                    filter: function(item, chart) {
                        // Logic to remove a particular legend item goes here
                        return !item.text.includes('DELETE');
                    }
                }    
            }, 
            scales: {
                xAxes: [{
                    ticks: {
                        min: 0,
                        max: maxX,
                        display: false
                    },
                    gridLines: {
                        drawBorder: false,
                        display:false
                    }
                }],
                yAxes: [{
                    ticks: {
                        min: 0,
                        max: maxY,
                    },
                    gridLines: {
                        drawBorder: false
                    }
                }]
            },
            tooltips: {
                enabled: false,
            }
        }
    })

    ////////////////////////////////////////////////////////
    // TABLE
    ////////////////////////////////////////////////////////

    // Update Header
    var header = document.getElementById("winnerVloserHeader");
    header.innerHTML = matchupChartData[matchupIndex].winner + " (Winner - Left) vs. " + matchupChartData[matchupIndex].loser + " (Loser - Right)";

    // Find actual index (for original data coming in)
    for(var i = 0; i < weekData.games.length; i++){
        if(weekData.games[i].winner.owner == matchupChartData[matchupIndex].winner && weekData.games[i].loser.owner == matchupChartData[matchupIndex].loser) {
            matchupIndex = i;
            break;
        }
    }

    // Set data storage
    var winnerQB = [];
    var winnerRB = [];
    var winnerWR = [];
    var winnerTE = [];
    var winnerOP = [];
    var winnerFLEX = [];
    var winnerDST = [];
    var winnerK = [];
    var loserQB = [];
    var loserRB = [];
    var loserWR = [];
    var loserTE = [];
    var loserOP = [];
    var loserFLEX = [];
    var loserDST = [];
    var loserK = [];

    // Set winner positions
    var qbCount = 0;
    var rbCount = 0;
    var wrCount = 0;
    var teCount = 0;
    var opCount = 0;
    var flexCount = 0;
    var dstCount = 0;
    var kCount = 0;
    var players = getPlayersOnTeam(weekData.games[matchupIndex].winner);
    players.sort(function(a,b) {
        return b.points - a.points
    });
    for(var i = 0; i < players.length; i++){
        if (players[i].status != "Active")
            continue;

        if(players[i].position == "QB"){
            if(qbCount < numberQB) {
                winnerQB.push([players[i].name,players[i].points]);
                qbCount++;
            } else if (opCount < numberOP) {
                winnerOP.push([players[i].name,players[i].points]);
                opCount++;
            }
        }else if(players[i].position == "RB"){
            if(rbCount < numberRB) {
                winnerRB.push([players[i].name,players[i].points]);
                rbCount++;
            } else if (flexCount < numberFLEX) {
                winnerFLEX.push([players[i].name,players[i].points]);
                flexCount++;
            } else if (opCount < numberOP) {
                winnerOP.push([players[i].name,players[i].points]);
                opCount++;
            }
        }else if(players[i].position == "WR"){
            if(wrCount < numberWR) {
                winnerWR.push([players[i].name,players[i].points]);
                wrCount++;
            } else if (flexCount < numberFLEX) {
                winnerFLEX.push([players[i].name,players[i].points]);
                flexCount++;
            } else if (opCount < numberOP) {
                winnerOP.push([players[i].name,players[i].points]);
                opCount++;
            }
        }else if(players[i].position == "TE"){
            if(teCount < numberTE) {
                winnerTE.push([players[i].name,players[i].points]);
                teCount++;
            } else if (flexCount < numberFLEX) {
                winnerFLEX.push([players[i].name,players[i].points]);
                flexCount++;
            } else if (opCount < numberOP) {
                winnerOP.push([players[i].name,players[i].points]);
                opCount++;
            }
        }else if(players[i].position == "K"){
            winnerK.push([players[i].name,players[i].points]);
            kCount++;
        }else if(players[i].position == "DST"){
            winnerDST.push([players[i].name,players[i].points]);
            dstCount++;
        }
    }

    // Sort high to low
    winnerQB.sort(function(a,b) {
        return b[1] - a[1]
    });
    winnerRB.sort(function(a,b) {
        return b[1] - a[1]
    });
    winnerWR.sort(function(a,b) {
        return b[1] - a[1]
    });
    winnerTE.sort(function(a,b) {
        return b[1] - a[1]
    });
    winnerOP.sort(function(a,b) {
        return b[1] - a[1]
    });
    winnerFLEX.sort(function(a,b) {
        return b[1] - a[1]
    });
    winnerDST.sort(function(a,b) {
        return b[1] - a[1]
    });
    winnerK.sort(function(a,b) {
        return b[1] - a[1]
    });

    // Set loser positions
    qbCount = 0;
    rbCount = 0;
    wrCount = 0;
    teCount = 0;
    opCount = 0;
    flexCount = 0;
    dstCount = 0;
    kCount = 0;
    players = getPlayersOnTeam(weekData.games[matchupIndex].loser);
    players.sort(function(a,b) {
        return b.points - a.points
    });
    for(var i = 0; i < players.length; i++){
        if (players[i].status != "Active")
            continue;

        if(players[i].position == "QB"){
            if(qbCount < numberQB) {
                loserQB.push([players[i].name,players[i].points]);
                qbCount++;
            } else if (opCount < numberOP) {
                loserOP.push([players[i].name,players[i].points]);
                opCount++;
            }
        }else if(players[i].position == "RB"){
            if(rbCount < numberRB) {
                loserRB.push([players[i].name,players[i].points]);
                rbCount++;
            } else if (flexCount < numberFLEX) {
                loserFLEX.push([players[i].name,players[i].points]);
                flexCount++;
            } else if (opCount < numberOP) {
                loserOP.push([players[i].name,players[i].points]);
                opCount++;
            }
        }else if(players[i].position == "WR"){
            if(wrCount < numberWR) {
                loserWR.push([players[i].name,players[i].points]);
                wrCount++;
            } else if (flexCount < numberFLEX) {
                loserFLEX.push([players[i].name,players[i].points]);
                flexCount++;
            } else if (opCount < numberOP) {
                loserOP.push([players[i].name,players[i].points]);
                opCount++;
            }
        }else if(players[i].position == "TE"){
            if(teCount < numberTE) {
                loserTE.push([players[i].name,players[i].points]);
                teCount++;
            } else if (flexCount < numberFLEX) {
                loserFLEX.push([players[i].name,players[i].points]);
                flexCount++;
            } else if (opCount < numberOP) {
                loserOP.push([players[i].name,players[i].points]);
                opCount++;
            }
        }else if(players[i].position == "K"){
            loserK.push([players[i].name,players[i].points]);
            kCount++;
        }else if(players[i].position == "DST"){
            loserDST.push([players[i].name,players[i].points]);
            dstCount++;
        }
    }

    // Sort high to low
    loserQB.sort(function(a,b) {
        return b[1] - a[1]
    });
    loserRB.sort(function(a,b) {
        return b[1] - a[1]
    });
    loserWR.sort(function(a,b) {
        return b[1] - a[1]
    });
    loserTE.sort(function(a,b) {
        return b[1] - a[1]
    });
    loserOP.sort(function(a,b) {
        return b[1] - a[1]
    });
    loserFLEX.sort(function(a,b) {
        return b[1] - a[1]
    });
    loserDST.sort(function(a,b) {
        return b[1] - a[1]
    });
    loserK.sort(function(a,b) {
        return b[1] - a[1]
    });

    // Get table element and clear all of the rows
    var tableBody = document.getElementById("matchupTableDetails");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Load rows
    for(var i = 0; i < Math.max(winnerQB.length, loserQB.length); i++){
        tr = tableBody.insertRow(-1);  
        
        if (winnerQB.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "QB";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = winnerQB[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(winnerQB[i][1] * 100)/100;
            if(loserQB.length <= i || winnerQB[i][1] > loserQB[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }

        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = "    ";
        tabCell.style.borderTop = "None";
        tabCell.style.borderBottom = "None";
        tabCell.style.backgroundColor = "White";

        if (loserQB.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(loserQB[i][1] * 100)/100;
            if(winnerQB.length <= i || loserQB[i][1] > winnerQB[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = loserQB[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "QB";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }
        
    }
    for(var i = 0; i < Math.max(winnerRB.length, loserRB.length); i++){
        tr = tableBody.insertRow(-1);  
        
        if (winnerRB.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "RB";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = winnerRB[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(winnerRB[i][1] * 100)/100;
            if(loserRB.length <= i || winnerRB[i][1] > loserRB[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }

        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = "    ";
        tabCell.style.borderTop = "None";
        tabCell.style.borderBottom = "None";
        tabCell.style.backgroundColor = "White";

        if (loserRB.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(loserRB[i][1] * 100)/100;
            if(winnerRB.length <= i || loserRB[i][1] > winnerRB[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = loserRB[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "RB";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }
        
    }
    for(var i = 0; i < Math.max(winnerWR.length, loserWR.length); i++){
        tr = tableBody.insertRow(-1);  
        
        if (winnerWR.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "WR";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = winnerWR[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(winnerWR[i][1] * 100)/100;
            if(loserWR.length <= i || winnerWR[i][1] > loserWR[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }

        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = "    ";
        tabCell.style.borderTop = "None";
        tabCell.style.borderBottom = "None";
        tabCell.style.backgroundColor = "White";

        if (loserWR.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(loserWR[i][1] * 100)/100;
            if(winnerWR.length <= i || loserWR[i][1] > winnerWR[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = loserWR[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "WR";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }
        
    }
    for(var i = 0; i < Math.max(winnerTE.length, loserTE.length); i++){
        tr = tableBody.insertRow(-1);  
        
        if (winnerTE.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "TE";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = winnerTE[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(winnerTE[i][1] * 100)/100;
            if(loserTE.length <= i || winnerTE[i][1] > loserTE[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }

        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = "    ";
        tabCell.style.borderTop = "None";
        tabCell.style.borderBottom = "None";
        tabCell.style.backgroundColor = "White";

        if (loserTE.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(loserTE[i][1] * 100)/100;
            if(winnerTE.length <= i || loserTE[i][1] > winnerTE[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = loserTE[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "TE";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }
        
    }
    for(var i = 0; i < Math.max(winnerOP.length, loserOP.length); i++){
        tr = tableBody.insertRow(-1);  
        
        if (winnerOP.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "OP";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = winnerOP[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(winnerOP[i][1] * 100)/100;
            if(loserOP.length <= i || winnerOP[i][1] > loserOP[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }

        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = "    ";
        tabCell.style.borderTop = "None";
        tabCell.style.borderBottom = "None";
        tabCell.style.backgroundColor = "White";

        if (loserOP.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(loserOP[i][1] * 100)/100;
            if(winnerOP.length <= i || loserOP[i][1] > winnerOP[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = loserOP[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "OP";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }
        
    }
    for(var i = 0; i < Math.max(winnerFLEX.length, loserFLEX.length); i++){
        tr = tableBody.insertRow(-1);  
        
        if (winnerFLEX.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "FLEX";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = winnerFLEX[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(winnerFLEX[i][1] * 100)/100;
            if(loserFLEX.length <= i || winnerFLEX[i][1] > loserFLEX[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }

        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = "    ";
        tabCell.style.borderTop = "None";
        tabCell.style.borderBottom = "None";
        tabCell.style.backgroundColor = "White";

        if (loserFLEX.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(loserFLEX[i][1] * 100)/100;
            if(winnerFLEX.length <= i || loserFLEX[i][1] > winnerFLEX[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = loserFLEX[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "FLEX";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }
        
    }
    for(var i = 0; i < Math.max(winnerDST.length, loserDST.length); i++){
        tr = tableBody.insertRow(-1);  
        
        if (winnerDST.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "DST";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = winnerDST[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(winnerDST[i][1] * 100)/100;
            if(loserDST.length <= i || winnerDST[i][1] > loserDST[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }

        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = "    ";
        tabCell.style.borderTop = "None";
        tabCell.style.borderBottom = "None";
        tabCell.style.backgroundColor = "White";

        if (loserDST.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(loserDST[i][1] * 100)/100;
            if(winnerDST.length <= i || loserDST[i][1] > winnerDST[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = loserDST[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "DST";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }
        
    }
    for(var i = 0; i < Math.max(winnerK.length, loserK.length); i++){
        tr = tableBody.insertRow(-1);  
        
        if (winnerK.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "K";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = winnerK[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(winnerK[i][1] * 100)/100;
            if(loserK.length <= i || winnerK[i][1] > loserK[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }

        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = "    ";
        tabCell.style.borderTop = "None";
        tabCell.style.borderBottom = "None";
        tabCell.style.backgroundColor = "White";

        if (loserK.length > i){
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = Math.round(loserK[i][1] * 100)/100;
            if(winnerK.length <= i || loserK[i][1] > winnerK[i][1]) tabCell.style.backgroundColor = "#ADFF2F";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = loserK[i][0];
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "K";
        } else {
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = "-";
        }
        
    }

}