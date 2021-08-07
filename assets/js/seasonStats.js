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

const analytics = firebase.analytics();
analytics.setCurrentScreen(window.location.pathname) // sets `screen_name` parameter
analytics.logEvent('screen_view') // log event with `screen_name` parameter attached

// Global variables
var seasonData;
var seasonDataYear;
var pageYear;
var median;
var numberTeams;
var numberWeeks;

// Color schemes
var colorScheme = [];
var color8 = [];
var color10 = ['#f9ca24','#f0932b','#eb4d4b','#6ab04c','#c7ecee','#22a6b3','#be2edd','#4834d4','#130f40','#535c68'];
var color12 = [];
var color14 = [];
var color16 = [];

// Chart variables
var rankingTrendChart;
var powerRankingTrendChart;
var playoffOddsChart;
var matchupChart;

/* FUNCTION: loadSeasonStats
*
* Initialization function on page load
*
*/
function loadSeasonStats() {

    var radios = document.getElementsByName('season-select');

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            pageYear = radios[i].value;
            break;
        }
    }

    dbRef.child("seasonFantasyTeamData").get().then((snapshot) => {
        seasonData = snapshot.val();
        updatePage();
    }).catch((error) => {
        console.error(error);
    });
}


/* FUNCTION: updatePage
*
* Updates all of the charts/tables/forms on the page.
* Called whenever the year/season radio button is updated (and on page load).
*
*/
function updatePage() {

    ////////////////////////////////////////////////////////
    // INITIALIZE SOME VARIABLES
    ////////////////////////////////////////////////////////
    
    // Load data into storage for the selected year
    for(var i = 0; i < seasonData.length; i++) {
        if(seasonData[i].year == pageYear) {
            seasonDataYear = seasonData[i];
            break;
        }
    }

    // Determine number of teams
    numberTeams = seasonDataYear.standings.length;

    // Determine number of active weeks
    numberWeeks = 0;
    for(var i = 0; i < seasonDataYear.standings[0].scores.length; i++){
        if(seasonDataYear.standings[0].scores[i] > 0.000000001) {
            numberWeeks++;
        }
    }

    // Set color scheme
    if(numberTeams == 8) {
        colorScheme = color8;
    } else if (numberTeams == 10) {
        colorScheme = color10;
    } else if (numberTeams == 12) {
        colorScheme = color12;
    } else if (numberTeams == 14) {
        colorScheme = color14;
    } else if (numberTeams == 16) {
        colorScheme = color16;
    } 

    // Setup table elements for later
    var tr;
    var th;
    var tabCell;

    

    ////////////////////////////////////////////////////////
    // SEASON SUMMARY TABLE
    ////////////////////////////////////////////////////////

    // Get table element and clear all of the rows
    var tableBody = document.getElementById("seasonStandingTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // get all the team data and sort it
    var sortArray = []
    seasonDataYear.standings.forEach(function(team,index2,array) {
        sortArray.push({
            "rank":team.rank, 
            "team":team.team, 
            "owner":team.owner, 
            "wins":team.wins, 
            "pointFor":team.pointFor, 
            "pointsAgainst":team.pointsAgainst, 
        })
    })
    sortArray.sort(function(a,b) {
        return a.rank - b.rank
    });

    // Load data into table
    sortArray.forEach(function(team,index2,array) {
        tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.rank;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.team;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.owner;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.wins;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.pointFor;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.pointsAgainst;                 
    })



    ////////////////////////////////////////////////////////
    // RANK BY WEEK CHART AND SCHEDULE TABLE
    ////////////////////////////////////////////////////////

    // Get data for plot and load into variables
    var xAxis = [];
    var dataSet = [];
    for(i = 0; i < seasonDataYear.standings[0].rankingTrend.length; i++) {
        xAxis.push(i+1)
    }
    seasonDataYear.standings.forEach(function(team,index2,array) {
        dataSet.push({
            "label":team.owner, 
            "data":team.rankingTrend,
            "fill": false,
            "lineTension": 0,
            'borderColor': colorScheme[index2],
            'fillColor': '#ffffff'
        })
    })
    
    // Get chart and clear any data/plot
    var graph = document.getElementById("positionalTrendsChart");
    if (typeof rankingTrendChart !== 'undefined') {
        rankingTrendChart.destroy();
    }

    // Load data into chart
    rankingTrendChart = new Chart(graph, {
        type: 'line',
        data: {
            labels: xAxis,
            datasets: dataSet
        },
        options: {
            legend: {
                position: 'right'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        reverse: true
                    }
                }]
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    title: function(tooltipItems, data) {
                        var score = seasonDataYear.standings[tooltipItems[0].datasetIndex].scores[tooltipItems[0].xLabel-1];
                        var oppScore = seasonDataYear.standings[tooltipItems[0].datasetIndex].oppScores[tooltipItems[0].xLabel-1];
                        var opponent = seasonDataYear.standings[seasonDataYear.standings[tooltipItems[0].datasetIndex].oppID[tooltipItems[0].xLabel-1]].owner;
                        if (score < oppScore){
                            return seasonDataYear.standings[tooltipItems[0].datasetIndex].owner + "\nLoss to " + opponent + "\n" + score + " to " + oppScore
                        } else {
                            return seasonDataYear.standings[tooltipItems[0].datasetIndex].owner + "\nWin over " + opponent + "\n" + score + " to " + oppScore
                        }
                        
                    },
                    label: function() {
                        return null;
                    }
                }
            }
        }
    })
    
    // Add function that loads a schedule based on selecting a line on the plot
    document.getElementById("positionalTrendsChart").onclick = function(evt) {
        var activePoint = rankingTrendChart.getElementAtEvent(evt);
      
        // make sure click was on an actual point
        if (activePoint.length > 0) {
            loadScheduleTable(activePoint[0]._datasetIndex);
        }
    };

    // Load the first place schedule
    for(i = 0; i < seasonDataYear.standings.length; i++) {
        if(seasonDataYear.standings[i].rank == 1) {
            loadScheduleTable(i);
            break;
        }
    }



    ////////////////////////////////////////////////////////
    // POWER RANKING TABLE AND CONTRIBUTIONS TABLE
    ////////////////////////////////////////////////////////

    // Get chart data and store into variables
    xAxis = [];
    dataSet = [];
    for(i = 0; i < seasonDataYear.standings[0].powerRankingTrends.length; i++) {
        xAxis.push(i)
    }
    seasonDataYear.standings.forEach(function(team,index2,array) {
        dataSet.push({
            "label":team.owner, 
            "data":team.powerRankingTrends,
            "fill": false,
            "lineTension": 0,
            'borderColor': colorScheme[index2],
            'fillColor': '#ffffff'
        })
    })
    
    // Get chart element and delete and prior plotting if applicable
    graph = document.getElementById("powerRankingsChart");
    if (typeof powerRankingTrendChart !== 'undefined') {
        powerRankingTrendChart.destroy();
    }

    // Load data into chart and format
    powerRankingTrendChart = new Chart(graph, {
        type: 'line',
        data: {
            labels: xAxis,
            datasets: dataSet
        },
        options: {
            legend: {
                position: 'right'
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    title: function(tooltipItems, data) {
                        if(tooltipItems[0].xLabel == 0)
                            return "All start\nat 1500"
                        var score = seasonDataYear.standings[tooltipItems[0].datasetIndex].scores[tooltipItems[0].xLabel-1];
                        var oppScore = seasonDataYear.standings[tooltipItems[0].datasetIndex].oppScores[tooltipItems[0].xLabel-1];
                        var opponent = seasonDataYear.standings[seasonDataYear.standings[tooltipItems[0].datasetIndex].oppID[tooltipItems[0].xLabel-1]].owner;
                        if (score < oppScore){
                            return seasonDataYear.standings[tooltipItems[0].datasetIndex].owner + "\nLoss to " + opponent + "\n" + score + " to " + oppScore
                        } else {
                            return seasonDataYear.standings[tooltipItems[0].datasetIndex].owner + "\nWin over " + opponent + "\n" + score + " to " + oppScore
                        }
                        
                    },
                    label: function() {
                        return null;
                    }
                }
            }
        }
    })

    // Get power ranking contribution table and clear any rows
    tableBody = document.getElementById("powerRankingsTable");
    while(tableBody != null && tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Update header to reflect maximum week with data
    var header = document.getElementById("powerRankingsTableHeader");
    header.innerText = "Week " + xAxis[xAxis.length - 1] + " Score Contributions";

    // Load power ranking contribution data and sort
    powerRankingSortArray = []
    for(var i = 0; i < numberTeams; i++) {
        powerRankingSortArray.push({
            "owner":seasonDataYear.standings[i].owner, 
            "rankingOverall":seasonDataYear.standings[i].powerRankingTrends[seasonDataYear.standings[i].powerRankingTrends.length - 1], 
            "wins":Math.round(seasonDataYear.standings[i].powerRanking.wins*100)/100, 
            "expWins":Math.round(seasonDataYear.standings[i].powerRanking.expWins*100)/100, 
            "points":Math.round(seasonDataYear.standings[i].powerRanking.pointsScored*100)/100, 
            "playoff":Math.round(seasonDataYear.standings[i].powerRanking.playoffOdds*100)/100, 
        })
    }
    powerRankingSortArray.sort(function(a,b) {
        return b.rankingOverall - a.rankingOverall
    });

    // Create table rows
    for(var i = 0; i < numberTeams; i++) {
        tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.innerText = i + 1;
        tabCell = tr.insertCell(-1);
        tabCell.innerText = powerRankingSortArray[i].owner;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell = tr.insertCell(-1);
        tabCell.innerText = powerRankingSortArray[i].wins;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell = tr.insertCell(-1);
        tabCell.innerText = powerRankingSortArray[i].expWins;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell = tr.insertCell(-1);
        tabCell.innerText = powerRankingSortArray[i].points;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell = tr.insertCell(-1);
        tabCell.innerText = powerRankingSortArray[i].playoff;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
    }



    ////////////////////////////////////////////////////////
    // PLAYOFF ODDS TABLE AND CHART
    ////////////////////////////////////////////////////////

    // Get playoff odds chart data and store into variables
    xAxis = [];
    dataSet = [];
    for(i = 0; i < seasonDataYear.standings[0].playoffOddTrends.length; i++) {
        xAxis.push(i)
    }
    seasonDataYear.standings.forEach(function(team,index2,array) {
        dataSet.push({
            "label":team.owner, 
            "data":team.playoffOddTrends.map(function(element) { return element*100; }),
            "fill": false,
            "lineTension": 0,
            'borderColor': colorScheme[index2],
            'fillColor': '#ffffff'
        })
    })
    
    // Get graph element, clear it (if applicable), and fill in the data
    graph = document.getElementById("playoffOddsChart");
    if (typeof playoffOddsChart !== 'undefined'){
        playoffOddsChart.destroy();
    }
    playoffOddsChart = new Chart(graph, {
        type: 'line',
        data: {
            labels: xAxis,
            datasets: dataSet
        },
        options: {
            legend: {
                position: 'right'
            },
            scales: {
                yAxes: [{
                    ticks: {
                        min: 0,
                        max: 100
                    }
                }]
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    title: function(tooltipItems, data) {
                        if (tooltipItems[0].xLabel == 0){
                            return seasonDataYear.standings[tooltipItems[0].datasetIndex].owner;
                        }
                        var score = seasonDataYear.standings[tooltipItems[0].datasetIndex].scores[tooltipItems[0].xLabel-1];
                        var oppScore = seasonDataYear.standings[tooltipItems[0].datasetIndex].oppScores[tooltipItems[0].xLabel-1];
                        var opponent = seasonDataYear.standings[seasonDataYear.standings[tooltipItems[0].datasetIndex].oppID[tooltipItems[0].xLabel-1]].owner;
                        if (score < oppScore){
                            return seasonDataYear.standings[tooltipItems[0].datasetIndex].owner + "\nLoss to " + opponent + "\n" + score + " to " + oppScore
                        } else {
                            return seasonDataYear.standings[tooltipItems[0].datasetIndex].owner + "\nWin over " + opponent + "\n" + score + " to " + oppScore
                        }

                    },
                    label: function(tooltipItems, data) {
                        var odds = Math.round(seasonDataYear.standings[tooltipItems.datasetIndex].playoffOddTrends[tooltipItems.xLabel] * 10000)/100;
                        
                        return "Week " + tooltipItems.xLabel + ": " + odds + "%";
                    }
                }
            }
        }
    })

    // Get the table HEADER element and empty the data
    tableBody = document.getElementById("playoffOddsTableHead");
    while(tableBody != null && tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Fill in the table HEADER
    tr = tableBody.insertRow(-1);  
    th = document.createElement("TH");
    th.innerHTML = "Owner";
    tr.appendChild(th);
    th = document.createElement("TH");
    th.innerHTML = "Rank";
    tr.appendChild(th);
    for(var i = 0; i < numberTeams; i++) {
        th = document.createElement("TH");
        th.innerHTML = i+1;
        tr.appendChild(th);
    }
    th = document.createElement("TH");
    th.innerHTML = "Playoff Odds";
    tr.appendChild(th);

    // Get the playoff data and sort it based on rank
    playoffOddsSortArray = []
    for(var i = 0; i < numberTeams; i++) {
        var playOdds = 0;
        for(var j = 0; j < seasonDataYear.playoffTeams; j++){
            playOdds += seasonDataYear.standings[i].playoffOdds[j]
        }
        playoffOddsSortArray.push({
            "owner":seasonDataYear.standings[i].owner, 
            "rank":seasonDataYear.standings[i].rank,
            "playoffOdds":playOdds, 
            "playoffOddsArray":seasonDataYear.standings[i].playoffOdds,
            "playoffsPossible":seasonDataYear.standings[i].playoffSpotPossible,
        })
    }
    playoffOddsSortArray.sort(function(a,b) {
        return a.rank - b.rank
    });

    // Get the table body and clear the rows
    tableBody = document.getElementById("playoffOddsTableBody");
    while(tableBody != null && tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Fill in the table body
    for(var i = 0; i < numberTeams; i++) {
        tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerText = playoffOddsSortArray[i].owner;
        tabCell = tr.insertCell(-1);
        tabCell.innerText = playoffOddsSortArray[i].rank;
        for(var j = 0; j < numberTeams; j++){
            tabCell = tr.insertCell(-1);
            tabCell.innerText = Math.round(playoffOddsSortArray[i].playoffOddsArray[j]*10000)/100 + "%";
            if(i == j) {
                tabCell.style.backgroundColor = "green";
                tabCell.style.color = "white";
            }else if(!playoffOddsSortArray[i].playoffsPossible[j]) {
                tabCell.style.backgroundColor = "black";
                tabCell.style.color = "black";
            }
        }
        tabCell = tr.insertCell(-1);
        tabCell.innerText = Math.round(playoffOddsSortArray[i].playoffOdds*10000)/100 + "%";
    }



    ////////////////////////////////////////////////////////
    // TOP SCORES AND CLOSEST MATCHUP TABLES
    ////////////////////////////////////////////////////////

    // Get the data for the tables
    topScoresArray = []
    closestMatchupArray = []
    for(var i = 0; i < seasonDataYear.games.length; i++) {
        topScoresArray.push({
            "owner":seasonDataYear.games[i].awayTeam, 
            "score":seasonDataYear.games[i].awayPoints,
            "week":seasonDataYear.games[i].week
        })
        topScoresArray.push({
            "owner":seasonDataYear.games[i].homeTeam, 
            "score":seasonDataYear.games[i].homePoints,
            "week":seasonDataYear.games[i].week
        })
        if(seasonDataYear.games[i].awayPoints > seasonDataYear.games[i].homePoints) {
            closestMatchupArray.push({
                "winner":seasonDataYear.games[i].awayTeam, 
                "loser":seasonDataYear.games[i].homeTeam,
                "score":seasonDataYear.games[i].awayPoints.toString() + " vs. " + seasonDataYear.games[i].homePoints.toString(),
                "diff":Math.round((seasonDataYear.games[i].awayPoints - seasonDataYear.games[i].homePoints)*100)/100,
                "week":seasonDataYear.games[i].week
            })
        } else {
            closestMatchupArray.push({
                "winner":seasonDataYear.games[i].homeTeam, 
                "loser":seasonDataYear.games[i].awayTeam,
                "score":seasonDataYear.games[i].homePoints.toString() + " vs. " + seasonDataYear.games[i].awayPoints.toString(),
                "diff":Math.round((seasonDataYear.games[i].homePoints - seasonDataYear.games[i].awayPoints)*100)/100,
                "week":seasonDataYear.games[i].week
            })
        }
    }

    // Sort the data
    closestMatchupArray.sort(function(a,b) {
        return a.diff - b.diff
    });
    topScoresArray.sort(function(a,b) {
        return b.score - a.score
    });

    // Get the top scores table element and remove rows
    tableBody = document.getElementById("topScoresTableBody");
    while(tableBody != null && tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Fill in the top scores table
    for(var i = 0; i < topScoresArray.length; i++) {
        tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerText = i+1;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "20%";
        if(topScoresArray[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerText = topScoresArray[i].owner;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "30%";
        if(topScoresArray[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerText = topScoresArray[i].score;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "30%";
        if(topScoresArray[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerText = topScoresArray[i].week;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "20%";
        if(topScoresArray[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
    }

    // Get the matchup differences table and remove rows
    tableBody = document.getElementById("closestMatchupsTableBody");
    while(tableBody != null && tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Fill in the matchup differences table
    for(var i = 0; i < closestMatchupArray.length; i++) {
        tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerText = i+1;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "8%";
        if(closestMatchupArray[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerText = closestMatchupArray[i].winner;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "22%";
        if(closestMatchupArray[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerText = closestMatchupArray[i].loser;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "22%";
        if(closestMatchupArray[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerText = closestMatchupArray[i].score;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "30%";
        if(closestMatchupArray[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerText = closestMatchupArray[i].diff;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "9%";
        if(closestMatchupArray[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerText = closestMatchupArray[i].week;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "9%";
        if(closestMatchupArray[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
    }



    ////////////////////////////////////////////////////////
    // EXPECTED WINS TABLE
    ////////////////////////////////////////////////////////

    // Get expected wins table and remove existing rows
    tableBody = document.getElementById("expectedWinsTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get expected wins data and sort
    sortArray = []
    seasonDataYear.standings.forEach(function(team,index2,array) {
        sortArray.push({
            "rank":team.rank, 
            "owner":team.owner, 
            "wins":Math.round(team.wins*100)/100, 
            "expWins":Math.round(team.expectedWins*100)/100, 
            "diff":Math.round((team.wins - team.expectedWins )*100)/100
        })
    })
    sortArray.sort(function(a,b) {
        return a.rank - b.rank
    });

    // Fill in expected wins table
    sortArray.forEach(function(team,index2,array) {
        tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.owner;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.rank;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.expWins;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.wins;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.diff;
    })



    ////////////////////////////////////////////////////////
    // SCHEDULE DIFFICULTY TABLE
    ////////////////////////////////////////////////////////

    // Get schedule difficulty table and remove existing rows
    tableBody = document.getElementById("scheduleDifficultyTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get schedule difficulty data and sort
    sortArray = []
    seasonDataYear.standings.forEach(function(team,index2,array) {
        sortArray.push({
            "rank":team.rank, 
            "owner":team.owner, 
            "wins":Math.round(team.wins*100)/100, 
            "oppWins":Math.round(team.oppWins*100)/100, 
            "diff":Math.round((team.wins - team.oppWins)*100)/100
        })
    })
    sortArray.sort(function(a,b) {
        return a.rank - b.rank
    });

    // Fill in schedule difficulty table
    sortArray.forEach(function(team,index2,array) {
        tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.owner;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.rank;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.oppWins;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.wins;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.diff;
    })



    ////////////////////////////////////////////////////////
    // POINTS BY POSITION TABLE
    ////////////////////////////////////////////////////////

    // Get points per position table and remove existing rows
    tableBody = document.getElementById("pointsPerPositionTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get points per position data and sort
    sortArray = []
    totalMin = 1000;
    totalMax = 0;
    qbMin = 1000;
    qbMax = 0;
    rbMin = 1000;
    rbMax = 0;
    wrMin = 1000;
    wrMax = 0;
    teMin = 1000;
    teMax = 0;
    opMin = 1000;
    opMax = 0;
    flexMin = 1000;
    flexMax = 0;
    kMin = 1000;
    kMax = 0;
    dstMin = 1000;
    dstMax = 0;
    seasonDataYear.standings.forEach(function(team,index2,array) {
        var sumTotal = 0;
        sortArray.push({
            "rank":team.rank, 
            "owner":team.owner, 
        })
        if ("QB" in team.pointsByPosition) {
            sumTotal += team.pointsByPosition.QB;
            sortArray[sortArray.length - 1].qb = Math.round(team.pointsByPosition.QB*100)/100;
            if (qbMin > team.pointsByPosition.QB) {
                qbMin = team.pointsByPosition.QB;
            }
            if (qbMax < team.pointsByPosition.QB) {
                qbMax = team.pointsByPosition.QB;
            }
        }
        else {
            sortArray[sortArray.length - 1].qb = "N/A";
        }
        if ("RB" in team.pointsByPosition) {
            sumTotal += team.pointsByPosition.RB;
            sortArray[sortArray.length - 1].rb = Math.round(team.pointsByPosition.RB*100)/100;
            if (rbMin > team.pointsByPosition.RB) {
                rbMin = team.pointsByPosition.RB;
            }
            if (rbMax < team.pointsByPosition.RB) {
                rbMax = team.pointsByPosition.RB;
            }
        }
        else {
            sortArray[sortArray.length - 1].rb = "N/A";
        }
        if ("WR" in team.pointsByPosition) {
            sumTotal += team.pointsByPosition.WR;
            sortArray[sortArray.length - 1].wr = Math.round(team.pointsByPosition.WR*100)/100;
            if (wrMin > team.pointsByPosition.WR) {
                wrMin = team.pointsByPosition.WR;
            }
            if (wrMax < team.pointsByPosition.WR) {
                wrMax = team.pointsByPosition.WR;
            }
        }
        else {
            sortArray[sortArray.length - 1].wr = "N/A";
        }
        if ("TE" in team.pointsByPosition) {
            sumTotal += team.pointsByPosition.TE;
            sortArray[sortArray.length - 1].te = Math.round(team.pointsByPosition.TE*100)/100;
            if (teMin > team.pointsByPosition.TE) {
                teMin = team.pointsByPosition.TE;
            }
            if (teMax < team.pointsByPosition.TE) {
                teMax = team.pointsByPosition.TE;
            }
        }
        else {
            sortArray[sortArray.length - 1].te = "N/A";
        }
        if ("FLEX" in team.pointsByPosition) {
            sumTotal += team.pointsByPosition.FLEX;
            sortArray[sortArray.length - 1].flex = Math.round(team.pointsByPosition.FLEX*100)/100;
            if (flexMin > team.pointsByPosition.FLEX) {
                flexMin = team.pointsByPosition.FLEX;
            }
            if (flexMax < team.pointsByPosition.FLEX) {
                flexMax = team.pointsByPosition.FLEX;
            }
        }
        else {
            sortArray[sortArray.length - 1].flex = "N/A";
        }
        if ("OP" in team.pointsByPosition) {
            sumTotal += team.pointsByPosition.OP;
            sortArray[sortArray.length - 1].op = Math.round(team.pointsByPosition.OP*100)/100;
            if (opMin > team.pointsByPosition.OP) {
                opMin = team.pointsByPosition.OP;
            }
            if (opMax < team.pointsByPosition.OP) {
                opMax = team.pointsByPosition.OP;
            }
        }
        else {
            sortArray[sortArray.length - 1].op = "N/A";
        }
        if ("K" in team.pointsByPosition) {
            sumTotal += team.pointsByPosition.K;
            sortArray[sortArray.length - 1].k = Math.round(team.pointsByPosition.K*100)/100;
            if (kMin > team.pointsByPosition.K) {
                kMin = team.pointsByPosition.K;
            }
            if (kMax < team.pointsByPosition.K) {
                kMax = team.pointsByPosition.K;
            }
        }
        else {
            sortArray[sortArray.length - 1].k = "N/A";
        }
        if ("DST" in team.pointsByPosition) {
            sumTotal += team.pointsByPosition.DST;
            sortArray[sortArray.length - 1].dst = Math.round(team.pointsByPosition.DST*100)/100;
            if (dstMin > team.pointsByPosition.DST) {
                dstMin = team.pointsByPosition.DST;
            }
            if (dstMax < team.pointsByPosition.DST) {
                dstMax = team.pointsByPosition.DST;
            }
        }
        else {
            sortArray[sortArray.length - 1].dst = "N/A";
        }

        sortArray[sortArray.length - 1].total = Math.round(sumTotal*100)/100;
        if (totalMin > sortArray[sortArray.length - 1].total) {
            totalMin = sortArray[sortArray.length - 1].total;
        }
        if (totalMax < sortArray[sortArray.length - 1].total) {
            totalMax = sortArray[sortArray.length - 1].total;
        }
    })
    sortArray.sort(function(a,b) {
        return a.rank - b.rank
    });

    // Fill in points per position table
    totalMin = Math.round(totalMin*100)/100;
    totalMax = Math.round(totalMax*100)/100;
    qbMin = Math.round(qbMin*100)/100;
    qbMax = Math.round(qbMax*100)/100;
    rbMin = Math.round(rbMin*100)/100;
    rbMax = Math.round(rbMax*100)/100;
    wrMin = Math.round(wrMin*100)/100;
    wrMax = Math.round(wrMax*100)/100;
    teMin = Math.round(teMin*100)/100;
    teMax = Math.round(teMax*100)/100;
    opMin = Math.round(opMin*100)/100;
    opMax = Math.round(opMax*100)/100;
    flexMin = Math.round(flexMin*100)/100;
    flexMax = Math.round(flexMax*100)/100;
    kMin = Math.round(kMin*100)/100;
    kMax = Math.round(kMax*100)/100;
    dstMin = Math.round(dstMin*100)/100;
    dstMax = Math.round(dstMax*100)/100;

    sortArray.forEach(function(team,index2,array) {
        tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.owner;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.rank;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.total;
        if(team.total != "N/A") {
            percentage = (team.total - totalMin)/(totalMax - totalMin);
            green = 0;
            red = 0;
            if(percentage == 0.50){
                green = 255.0;
                red = 255.0;
            } else if (percentage < 0.50){
                green = 255.0 * percentage/0.50;
                red = 255.0;
            } else {
                green = 255.0;
                red = 255.0 * (1.00 - percentage)/0.50;
            }
            tabCell.style.backgroundColor = "rgb(" + red + ", " + green + ", 0)"; 
        }
        tabCell.style.color = "black";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.qb;
        if(team.qb != "N/A") {
            percentage = (team.qb - qbMin)/(qbMax - qbMin);
            green = 0;
            red = 0;
            if(percentage == 0.50){
                green = 255.0;
                red = 255.0;
            } else if (percentage < 0.50){
                green = 255.0 * percentage/0.50;
                red = 255.0;
            } else {
                green = 255.0;
                red = 255.0 * (1.00 - percentage)/0.50;
            }
            tabCell.style.backgroundColor = "rgb(" + red + ", " + green + ", 0)"; 
        }
        tabCell.style.color = "black";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.rb;
        if(team.rb != "N/A") {
            percentage = (team.rb - rbMin)/(rbMax - rbMin);
            green = 0;
            red = 0;
            if(percentage == 0.50){
                green = 255.0;
                red = 255.0;
            } else if (percentage < 0.50){
                green = 255.0 * percentage/0.50;
                red = 255.0;
            } else {
                green = 255.0;
                red = 255.0 * (1.00 - percentage)/0.50;
            }
            tabCell.style.backgroundColor = "rgb(" + red + ", " + green + ", 0)"; 
        }
        tabCell.style.color = "black";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.wr;
        if(team.wr != "N/A") {
            percentage = (team.wr - wrMin)/(wrMax - wrMin);
            green = 0;
            red = 0;
            if(percentage == 0.50){
                green = 255.0;
                red = 255.0;
            } else if (percentage < 0.50){
                green = 255.0 * percentage/0.50;
                red = 255.0;
            } else {
                green = 255.0;
                red = 255.0 * (1.00 - percentage)/0.50;
            }
            tabCell.style.backgroundColor = "rgb(" + red + ", " + green + ", 0)"; 
        }
        tabCell.style.color = "black";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.te;
        if(team.te != "N/A") {
            percentage = (team.te - teMin)/(teMax - teMin);
            green = 0;
            red = 0;
            if(percentage == 0.50){
                green = 255.0;
                red = 255.0;
            } else if (percentage < 0.50){
                green = 255.0 * percentage/0.50;
                red = 255.0;
            } else {
                green = 255.0;
                red = 255.0 * (1.00 - percentage)/0.50;
            }
            tabCell.style.backgroundColor = "rgb(" + red + ", " + green + ", 0)"; 
        }
        tabCell.style.color = "black";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.op;
        if(team.op != "N/A") {
            percentage = (team.op - opMin)/(opMax - opMin);
            green = 0;
            red = 0;
            if(percentage == 0.50){
                green = 255.0;
                red = 255.0;
            } else if (percentage < 0.50){
                green = 255.0 * percentage/0.50;
                red = 255.0;
            } else {
                green = 255.0;
                red = 255.0 * (1.00 - percentage)/0.50;
            }
            tabCell.style.backgroundColor = "rgb(" + red + ", " + green + ", 0)"; 
        }
        tabCell.style.color = "black";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.flex;
        if(team.flex != "N/A") {
            percentage = (team.flex - flexMin)/(flexMax - flexMin);
            green = 0;
            red = 0;
            if(percentage == 0.50){
                green = 255.0;
                red = 255.0;
            } else if (percentage < 0.50){
                green = 255.0 * percentage/0.50;
                red = 255.0;
            } else {
                green = 255.0;
                red = 255.0 * (1.00 - percentage)/0.50;
            }
            tabCell.style.backgroundColor = "rgb(" + red + ", " + green + ", 0)"; 
        }
        tabCell.style.color = "black";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.k;
        if(team.k != "N/A") {
            percentage = (team.k - kMin)/(kMax - kMin);
            green = 0;
            red = 0;
            if(percentage == 0.50){
                green = 255.0;
                red = 255.0;
            } else if (percentage < 0.50){
                green = 255.0 * percentage/0.50;
                red = 255.0;
            } else {
                green = 255.0;
                red = 255.0 * (1.00 - percentage)/0.50;
            }
            tabCell.style.backgroundColor = "rgb(" + red + ", " + green + ", 0)"; 
        }
        tabCell.style.color = "black";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = team.dst;
        if(team.dst != "N/A") {
            percentage = (team.dst - dstMin)/(dstMax - dstMin);
            green = 0;
            red = 0;
            if(percentage == 0.50){
                green = 255.0;
                red = 255.0;
            } else if (percentage < 0.50){
                green = 255.0 * percentage/0.50;
                red = 255.0;
            } else {
                green = 255.0;
                red = 255.0 * (1.00 - percentage)/0.50;
            }
            tabCell.style.backgroundColor = "rgb(" + red + ", " + green + ", 0)"; 
        }
        tabCell.style.color = "black";
    })



    ////////////////////////////////////////////////////////
    // MATCHUP SCATTER PLOT
    ////////////////////////////////////////////////////////

    // Get matchup scatter plot pulldown and clear any entries
    var selectObj = document.getElementById("team-matchupCharts");
    while(selectObj.hasChildNodes()) {
        selectObj.removeChild(selectObj.firstChild);
    }

    // Fill in scatter plot matchup drawdown
    for (var i = 0; i<numberTeams; i++){
        var opt = document.createElement('option');
        opt.value = i;
        opt.innerHTML = seasonDataYear.standings[i].owner;
        selectObj.appendChild(opt);
        if(seasonDataYear.standings[i].rank == 1){
            selectObj.selectedIndex = i;
        }
    }

    // Get score list for all teams, sort, and get median
    var scoreList = []
    for (var i = 0; i<numberTeams; i++){
        for(var j = 0; j < seasonDataYear.standings[i].scores.length; j++){
            scoreList.push(seasonDataYear.standings[i].scores[j])
        }
    }
    scoreList.sort(function(a,b){
        return a-b;
    });
    median = Math.floor(scoreList.length / 2);
    
    if (scoreList.length % 2){
        median = scoreList[median];
    } else {
        median = (scoreList[median - 1] + scoreList[median]) / 2.0;
    }

    // Get score range
    scoreRange = Math.max(median - scoreList[0],scoreList[scoreList.length - 1] - median);
    scoreRange = Math.floor(scoreRange/5.0 + 0.000000001) * 5 + 5;

    // Fill in initial chart with highest rank individual
    loadMatchupChart();
    


    ////////////////////////////////////////////////////////
    // TOP SCORES/WEEK BY POSITION TABLE AND DRAWDOWN
    ////////////////////////////////////////////////////////

    // Get positions pull down and clear
    selectObj = document.getElementById("positions");
    while(selectObj.hasChildNodes()) {
        selectObj.removeChild(selectObj.firstChild);
    }

    // Fill in pull down with applicable positions
    if("QB" in seasonDataYear.positionalPerformances) {
        var opt = document.createElement('option');
        opt.value = 0;
        opt.innerHTML = "Quarterback";
        selectObj.appendChild(opt);
    }
    if("RB" in seasonDataYear.positionalPerformances) {
        var opt = document.createElement('option');
        opt.value = 1;
        opt.innerHTML = "Running Back";
        selectObj.appendChild(opt);
    }
    if("WR" in seasonDataYear.positionalPerformances) {
        var opt = document.createElement('option');
        opt.value = 2;
        opt.innerHTML = "Wide Receiver";
        selectObj.appendChild(opt);
    }
    if("TE" in seasonDataYear.positionalPerformances) {
        var opt = document.createElement('option');
        opt.value = 3;
        opt.innerHTML = "Tight End";
        selectObj.appendChild(opt);
    }
    if("K" in seasonDataYear.positionalPerformances) {
        var opt = document.createElement('option');
        opt.value = 4;
        opt.innerHTML = "Kicker";
        selectObj.appendChild(opt);
    }
    if("DST" in seasonDataYear.positionalPerformances) {
        var opt = document.createElement('option');
        opt.value = 5;
        opt.innerHTML = "Defense/Special Teams";
        selectObj.appendChild(opt);
    }
    selectObj.selectedIndex = 0;

    // Load position data with QB
    loadPositionalPerformances()

}


/* FUNCTION: radioChange
*
* Called whenver the season/year radio button is updated.
* Calls 'updatePage' at end to update all page items as appropriate
*
*/
function radioChange() {

    // Get radio buttons
    var radios = document.getElementsByName('season-select');

    // Determine the value selected and update the 'pageYear' variable and then update page
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            pageYear = radios[i].value;
            updatePage();
            break;
        }
    }
}


/* FUNCTION: loadScheduleTable
*
* Updates the table next to the ranking by week chart based on what team is selected in the chart.
* Requires the team index (ID) to correctly operate.
*
*/
function loadScheduleTable(ID) {

    // Get the table and clear all rows
    var tableBody = document.getElementById("positionalTrendsTable");
    while(tableBody != null && tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Update the header to show whose schedule it is
    var header = document.getElementById("positionalTrendsTableHeader");
    header.innerText = seasonDataYear.standings[ID].owner.concat(" Schedule  (click line point)");

    // Update the table rows
    for(var i = 0; i < seasonDataYear.standings[ID].scores.length; i++) {
        var score = seasonDataYear.standings[ID].scores[i];
        var oppScore = seasonDataYear.standings[ID].oppScores[i];
        var oppID = seasonDataYear.standings[ID].oppID[i];
        var tr = tableBody.insertRow(-1);  
        var tabCell = tr.insertCell(-1);
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.innerHTML = i + 1;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = seasonDataYear.standings[oppID].owner;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = score;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = oppScore;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell = tr.insertCell(-1);
        if (score + oppScore < 0.000000001) {
            tabCells.innerHTML = "";  
        } else if (score < oppScore) {
            tabCell.innerHTML = "Loss";  
        } else {
            tabCell.innerHTML = "Win";  
        }
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
    }
}


/* FUNCTION: loadMatchupChart
*
* Load the matchup scatter plot based on the selected team.
* On load, defaults to the highest ranked team.
*
*/
function loadMatchupChart() {

    // Gets the value from the team pull down
    var e = document.getElementById("team-matchupCharts");
    var user = e.value;

    // Create scatter plot data
    var lossData = [];
    var winData = [];
    for(var j = 0; j < seasonDataYear.standings[user].scores.length; j++){
        if(seasonDataYear.standings[user].scores[j] > seasonDataYear.standings[user].oppScores[j]){
            winData.push({'x':seasonDataYear.standings[user].oppScores[j] - median,'y':seasonDataYear.standings[user].scores[j] - median})
        } else {
            lossData.push({'x':seasonDataYear.standings[user].oppScores[j] - median,'y':seasonDataYear.standings[user].scores[j] - median})
        }
    }

    // Get chart element
    graph = document.getElementById("matchupChartCanvas");
    
    // Clear all data/destroy if needed (not first load)
    if (typeof matchupChart !== 'undefined'){
        matchupChart.destroy();
    }

    // Create graph
    matchupChart = new Chart(graph, {
        type: 'scatter',
        data: {
            datasets: [{
                label: 'Wins',
                data: winData,
                borderColor: 'rgb(0, 255, 0)',
                backgroundColor: 'rgb(0, 255, 0)'
            },
            {
                label: 'Losses',
                data: lossData,
                borderColor: 'rgb(255, 0, 0)',
                backgroundColor: 'rgb(255, 0, 0)',
            },
            {
                label: 'Diag',
                data: [{'x':-scoreRange,'y':-scoreRange},{'x':scoreRange,'y':scoreRange}],
                borderColor: 'rgb(0, 0, 0)',
                backgroundColor: 'rgb(0, 0, 0)',
                pointRadius: 0,
                fill: false,
                showLine: true
            },{
                label: 'Unlucky Loss',
                data: [{'x':0,'y':0},{'x':scoreRange,'y':scoreRange}],
                borderColor: 'rgb(255, 0, 0, 0.1)',
                backgroundColor: 'rgb(255, 0, 0, 0.1)',
                pointRadius: 0,
                showLine: true
            },{
                label: 'Lucky Win',
                data: [{'x':-scoreRange,'y':-scoreRange},{'x':0,'y':0}],
                borderColor: 'rgb(0, 255, 0, 0.1)',
                backgroundColor: 'rgb(0, 255, 0, 0.1)',
                pointRadius: 0,
                showLine: true
            }]
        },
        options: {
            legend: {
                display: false
            },             
            scales: {
                xAxes: [{
                    ticks: {
                        min: -scoreRange,
                        max: scoreRange
                    },
                    scaleLabel : {
                        display : true,
                        labelString : "Opp. Score From Median",
                        fontStyle : 'bold',
                        fontSize : 14
                    }
        
                }],
                yAxes: [{
                    ticks: {
                        min: -scoreRange,
                        max: scoreRange
                    },
                    scaleLabel : {
                        display : true,
                        labelString : "Owner Score From Median",
                        fontStyle : 'bold',
                        fontSize : 14
                    }
                }]
            },
            tooltips: {
                enabled: true,
                mode: 'single',
                callbacks: {
                    title: function(tooltipItems, data) {
                        if (tooltipItems[0].xLabel == 0 && tooltipItems[0].yLabel == 0){
                            return "Median Score";
                        }
                        for(var i = 0; i < seasonDataYear.standings[user].scores.length; i++){
                            if(Math.abs(seasonDataYear.standings[user].scores[i] - median - tooltipItems[0].yLabel) < 0.0001 && Math.abs(seasonDataYear.standings[user].oppScores[i] - median - tooltipItems[0].xLabel) < 0.0001) {
                                var week = i + 1;
                                if(tooltipItems[0].yLabel < tooltipItems[0].xLabel) {
                                    return "Week " + week + " loss to " + seasonDataYear.standings[seasonDataYear.standings[user].oppID[i]].owner
                                } else {
                                    return "Week " + week + " win against " + seasonDataYear.standings[seasonDataYear.standings[user].oppID[i]].owner
                                }
                            }
                        }
                    },
                    label: function(tooltipItems, data) {
                        if (tooltipItems.xLabel == 0 && tooltipItems.yLabel == 0){
                            return median;
                        }
                        for(var i = 0; i < seasonDataYear.standings[user].scores.length; i++){
                            if(Math.abs(seasonDataYear.standings[user].scores[i] - median - tooltipItems.yLabel) < 0.0001 && Math.abs(seasonDataYear.standings[user].oppScores[i] - median - tooltipItems.xLabel) < 0.0001) {
                                return seasonDataYear.standings[user].scores[i] + " vs. " + seasonDataYear.standings[user].oppScores[i]
                            }
                        }
                    }
                }
            }
        }
    })
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
        positionData = seasonDataYear.positionalPerformances['QB'];
    }else if (position == 1) {
        positionData = seasonDataYear.positionalPerformances['RB'];
    }else if (position == 2) {
        positionData = seasonDataYear.positionalPerformances['WR'];
    }else if (position == 3) {
        positionData = seasonDataYear.positionalPerformances['TE'];
    }else if (position == 4) {
        positionData = seasonDataYear.positionalPerformances['K'];
    }else if (position == 5) {
        positionData = seasonDataYear.positionalPerformances['DST'];
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
        tabCell.style.width = "8%";
        if(positionData[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = positionData[i].name;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "36%";
        if(positionData[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = positionData[i].score;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "12%";
        if(positionData[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = positionData[i].owner;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "25%";
        if(positionData[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = positionData[i].status;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "11%";
        if(positionData[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = positionData[i].week;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "8%";
        if(positionData[i].week == numberWeeks) tabCell.style.backgroundColor = "#ffd500";
    }
}