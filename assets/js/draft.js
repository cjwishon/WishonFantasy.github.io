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
var pageYear
var draftData
var tableData
var ownerCount
var ownerNames

// Chart elements to track
var pointsPerPositionBarChart;
var pointsPerPositionPieChart;
var playersByNFLTeamChart;
var draftOrderChart;
var playerSpendingChart;
var spendVsExpectedCanvas;

// Color schemes
var colorScheme = [];
var color8 = [];
var color10 = ['#f9ca24','#f0932b','#eb4d4b','#6ab04c','#c7ecee','#22a6b3','#be2edd','#4834d4','#130f40','#535c68'];
var color12 = [];
var color14 = [];
var color16 = [];

/* FUNCTION: seasonChange
*
* Called whenver the season/year radio button is updated.
* Calls 'updatePage' at end to update all page items as appropriate
*
*/
function seasonChange() {

    // Get radio buttons
    var radios = document.getElementsByName('season-select');

    // Determine the value selected and update the 'pageYear' variable and then update page
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            pageYear = radios[i].value;

            // Get data from firebase and update page
            return firebase.database().ref('/draftData/' + pageYear).once('value').then((snapshot) => {
                draftData = snapshot.val();
                updatePage()
            });
        }
    }
}

/* FUNCTION: loadPlayoffs
*
* Called when the page loads and pulls in the firebase data
* Calls 'updatePage' at end to update all page items as appropriate
*
*/
function loadDraftStats() {

    draftData = []

    // Get radio buttons
    var radios = document.getElementsByName('season-select');

    // Determine the value selected and update the 'pageYear' variable and then update page
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            pageYear = radios[i].value;
            break;
        }
    }

    // Get data from firebase and update page
    return firebase.database().ref('/draftData/' + pageYear).once('value').then((snapshot) => {
        draftData = snapshot.val();
        updatePage()
    });

}

function updatePage() {
    console.log()
    console.log(pageYear)
    console.log(draftData)



    

    // Initialize listing of count of players by NFL team
    if(pageYear == 2019){
        nflTeamsPicks = {
            "ARI": {'amount': 0, 'picks': []},
            "ATL": {'amount': 0, 'picks': []},
            "BAL": {'amount': 0, 'picks': []},
            "BUF": {'amount': 0, 'picks': []},
            "CAR": {'amount': 0, 'picks': []},
            "CHI": {'amount': 0, 'picks': []},
            "CIN": {'amount': 0, 'picks': []},
            "CLE": {'amount': 0, 'picks': []},
            "DAL": {'amount': 0, 'picks': []},
            "DEN": {'amount': 0, 'picks': []},
            "DET": {'amount': 0, 'picks': []},
            "GB": {'amount': 0, 'picks': []},
            "HOU": {'amount': 0, 'picks': []},
            "IND": {'amount': 0, 'picks': []},
            "JAX": {'amount': 0, 'picks': []},
            "KC": {'amount': 0, 'picks': []},
            "LAC": {'amount': 0, 'picks': []},
            "LAR": {'amount': 0, 'picks': []},
            "OAK": {'amount': 0, 'picks': []},
            "MIA": {'amount': 0, 'picks': []},
            "MIN": {'amount': 0, 'picks': []},
            "NE": {'amount': 0, 'picks': []},
            "NO": {'amount': 0, 'picks': []},
            "NYG": {'amount': 0, 'picks': []},
            "NYJ": {'amount': 0, 'picks': []},
            "PHI": {'amount': 0, 'picks': []},
            "PIT": {'amount': 0, 'picks': []},
            "SEA": {'amount': 0, 'picks': []},
            "SF": {'amount': 0, 'picks': []},
            "TB": {'amount': 0, 'picks': []},
            "TEN": {'amount': 0, 'picks': []},
            "WAS": {'amount': 0, 'picks': []}
        };
    } else {
        nflTeamsPicks = {
            "ARI": {'amount': 0, 'picks': []},
            "ATL": {'amount': 0, 'picks': []},
            "BAL": {'amount': 0, 'picks': []},
            "BUF": {'amount': 0, 'picks': []},
            "CAR": {'amount': 0, 'picks': []},
            "CHI": {'amount': 0, 'picks': []},
            "CIN": {'amount': 0, 'picks': []},
            "CLE": {'amount': 0, 'picks': []},
            "DAL": {'amount': 0, 'picks': []},
            "DEN": {'amount': 0, 'picks': []},
            "DET": {'amount': 0, 'picks': []},
            "GB": {'amount': 0, 'picks': []},
            "HOU": {'amount': 0, 'picks': []},
            "IND": {'amount': 0, 'picks': []},
            "JAX": {'amount': 0, 'picks': []},
            "KC": {'amount': 0, 'picks': []},
            "LAC": {'amount': 0, 'picks': []},
            "LAR": {'amount': 0, 'picks': []},
            "LV": {'amount': 0, 'picks': []},
            "MIA": {'amount': 0, 'picks': []},
            "MIN": {'amount': 0, 'picks': []},
            "NE": {'amount': 0, 'picks': []},
            "NO": {'amount': 0, 'picks': []},
            "NYG": {'amount': 0, 'picks': []},
            "NYJ": {'amount': 0, 'picks': []},
            "PHI": {'amount': 0, 'picks': []},
            "PIT": {'amount': 0, 'picks': []},
            "SEA": {'amount': 0, 'picks': []},
            "SF": {'amount': 0, 'picks': []},
            "TB": {'amount': 0, 'picks': []},
            "TEN": {'amount': 0, 'picks': []},
            "WAS": {'amount': 0, 'picks': []}
        };
    }
    

    // Get list of all fantasy team owners
    tableData = [];
    ownerCount = 0;
    ownerNames = []
    nominatorNames = []
    for(var i = 1; i < draftData.length; i++){
        var found = false;
        for(var j = 0; j < ownerCount; j++){
            if(tableData[j]['owner'] == draftData[i].winner){
                found = true;
                break;
            }
        }
        if(!found){
            ownerNames.push(draftData[i].winner);
            tableData.push({
                'owner': draftData[i].winner,
                'picks': [],
                'nominations': [],
                'totalSpend': 0,
                'expSpend': 0,
                'spentByPosition': {
                    'QB': {'amount': 0, 'players': []},
                    'RB': {'amount': 0, 'players': []},
                    'WR': {'amount': 0, 'players': []},
                    'TE': {'amount': 0, 'players': []},
                    'K': {'amount': 0, 'players': []},
                    'DST': {'amount': 0, 'players': []}
                },
                'nflTeamPicks': []
            })
            ownerCount += 1
        }

        var found = false;
        for(var j = 0; j < ownerCount; j++){
            if(nominatorNames[j] == draftData[i].nominator){
                found = true;
                break;
            }
        }
        if(!found){
            nominatorNames.push(draftData[i].nominator);
        }
    }

    // Set color scheme
    if(ownerCount == 8) {
        colorScheme = color8;
    } else if (ownerCount == 10) {
        colorScheme = color10;
    } else if (ownerCount == 12) {
        colorScheme = color12;
    } else if (ownerCount == 14) {
        colorScheme = color14;
    } else if (ownerCount == 16) {
        colorScheme = color16;
    } 


    // Loop through all picks and fill in data for use in charts
   for(var i = 1; i < draftData.length; i++){

        if(draftData[i]['position'] != "K" && draftData[i]['position'] != "DST") {
            nflTeamsPicks[draftData[i]['nflTeam']]['amount'] += draftData[i]['price'];
            nflTeamsPicks[draftData[i]['nflTeam']]['picks'].push([draftData[i]['fullName'], draftData[i]['price'], draftData[i]['position']])
        }

        for(var j = 0; j < ownerCount; j++){
            if(tableData[j]['owner'] == draftData[i]['winner']) {
                tableData[j]['totalSpend'] += draftData[i]['price'];
                tableData[j]['expSpend'] += parseInt(draftData[i]['expPrice']);
                var found = false;
                for(var k = 0; k < tableData[j]['nflTeamPicks'].length; k++){
                    if(tableData[j]['nflTeamPicks'][k][0] == draftData[i]['nflTeam']){
                        tableData[j]['nflTeamPicks'][k][1].push(draftData[i]['fullName']);
                        found = true;
                    }
                }
                if(!found){
                    tableData[j]['nflTeamPicks'].push([draftData[i]['nflTeam'],[draftData[i]['fullName']]]);
                }
                tableData[j]['spentByPosition'][draftData[i]['position']]['amount'] += draftData[i]['price'];
                tableData[j]['spentByPosition'][draftData[i]['position']]['players'].push([draftData[i]['fullName'],draftData[i]['price']])

                tableData[j]['picks'].push(draftData[i]);
            }
            if(tableData[j]['owner'] == draftData[i]['nominator']) {
                tableData[j]['nominations'].push(draftData[i]);
            }
        }
    }

    // Sort player in position by dollar amount
    for(var i = 0; i < ownerCount; i++){ 

        // Sort (high to low)
        tableData[i]['spentByPosition']['QB']['players'].sort(function(a,b) {
            return b[1] - a[1]
        });
        tableData[i]['spentByPosition']['RB']['players'].sort(function(a,b) {
            return b[1] - a[1]
        });
        tableData[i]['spentByPosition']['WR']['players'].sort(function(a,b) {
            return b[1] - a[1]
        });
        tableData[i]['spentByPosition']['TE']['players'].sort(function(a,b) {
            return b[1] - a[1]
        });
        tableData[i]['spentByPosition']['K']['players'].sort(function(a,b) {
            return b[1] - a[1]
        });
        tableData[i]['spentByPosition']['DST']['players'].sort(function(a,b) {
            return b[1] - a[1]
        });

    }

    // Sort NFL team players
    for(var i in nflTeamsPicks) {
        // Sort (high to low)
        nflTeamsPicks[i]['picks'].sort(function(a,b) {
            return b[1] - a[1]
        });
    }

    console.log(tableData)

    // Amount spent by position charts
    var chartData = [];
    chartData.push([])
    for(var i = 0; i < ownerCount; i++){
        chartData[0].push(tableData[i]['spentByPosition']['QB']['amount'])
    }
    chartData.push([])
    for(var i = 0; i < ownerCount; i++){
        chartData[1].push(tableData[i]['spentByPosition']['RB']['amount'])
    }
    chartData.push([])
    for(var i = 0; i < ownerCount; i++){
        chartData[2].push(tableData[i]['spentByPosition']['WR']['amount'])
    }
    chartData.push([])
    for(var i = 0; i < ownerCount; i++){
        chartData[3].push(tableData[i]['spentByPosition']['TE']['amount'])
    }
    chartData.push([])
    for(var i = 0; i < ownerCount; i++){
        chartData[4].push(tableData[i]['spentByPosition']['K']['amount'])
    }
    chartData.push([])
    for(var i = 0; i < ownerCount; i++){
        chartData[5].push(tableData[i]['spentByPosition']['DST']['amount'])
    }

    // Create chart
    var graph = document.getElementById("pointsPerPositionBarChart");
    
    // Clear all data/destroy if needed (not first load)
    if (typeof pointsPerPositionBarChart != 'undefined'){
        pointsPerPositionBarChart.destroy();
    }

    pointsPerPositionBarChart = new Chart(graph, {
        type: 'bar',
        data: {
            labels: ownerNames,
            datasets: [{
                label: 'QB',
                data: chartData[0],
                borderColor: 'rgb(0, 0, 0)',
                backgroundColor: 'rgb(137, 49, 239)'
            },{
                label: 'RB',
                data: chartData[1],
                borderColor: 'rgb(0, 0, 0)',
                backgroundColor: 'rgb(242, 202, 25)',
            },{
                label: 'WR',
                data: chartData[2],
                borderColor: 'rgb(0, 0, 0)',
                backgroundColor: 'rgb(255, 0, 189)'
            },{
                label: 'TE',
                data: chartData[3],
                borderColor: 'rgb(0, 0, 0)',
                backgroundColor: 'rgb(0, 87, 233)'
            },{
                label: 'K',
                data: chartData[4],
                borderColor: 'rgb(0, 0, 0)',
                backgroundColor: 'rgb(135, 233, 17)'
            },{
                label: 'DST',
                data: chartData[5],
                borderColor: 'rgb(0, 0, 0)',
                backgroundColor: 'rgb(225, 24, 69)'            
            }]
        },
        options: {
            scales: {
                xAxes: [{
                    stacked: true,
                    scaleLabel : {
                        display : true,
                        labelString : "Fantasy Owner",
                        fontStyle : 'bold',
                        fontSize : 14
                    }
                }],
                yAxes: [{
                    stacked: true,
                    scaleLabel : {
                        display : true,
                        labelString : "Amount Spent ($)",
                        fontStyle : 'bold',
                        fontSize : 14
                    }
                }]
            }
        }
    })

    // Add function that loads a schedule based on selecting a line on the plot
    document.getElementById("pointsPerPositionBarChart").onclick = function(evt) {
        var activePoint = pointsPerPositionBarChart.getElementAtEvent(evt);
      
        // make sure click was on an actual point
        if (activePoint.length > 0) {

            loadPointsPerPositionPieChart(activePoint[0]._index)

        }
    };

    // Load the first fantasy players details into pie chart
    loadPointsPerPositionPieChart(0)






    // Create amount spent by nfl team chart
    var nflTeamchartData = [];
    for(var i in nflTeamsPicks){
        nflTeamchartData.push([i,nflTeamsPicks[i]['amount']])
    }

    // Sort (high to low)
    nflTeamchartData.sort(function(a,b) {
        return b[1] - a[1]
    });

    // Create chart
    var graph = document.getElementById("playersByNFLTeamChart");


    // Clear all data/destroy if needed (not first load)
    if (typeof playersByNFLTeamChart != 'undefined'){
        playersByNFLTeamChart.destroy();
    }

    playersByNFLTeamChart = new Chart(graph, {
        type: 'bar',
        data: {
            labels: nflTeamchartData.map(data => data[0]),
            datasets: [{
                data: nflTeamchartData.map(data => data[1]),
                borderColor: 'rgb(0, 0, 0)',
                backgroundColor: 'rgb(137, 49, 239)'
            }]
        },
        options: {
            legend: {
                display: false
            },    
            scales: {
                xAxes: [{
                    ticks: {
                        autoSkip: false,
                        maxRotation: 90,
                        minRotation: 90
                    },    
                    scaleLabel : {
                        display : true,
                        labelString : "Fantasy Owner",
                        fontStyle : 'bold',
                        fontSize : 14
                    }
                }],
                yAxes: [{
                    scaleLabel : {
                        display : true,
                        labelString : "Amount Spent ($)",
                        fontStyle : 'bold',
                        fontSize : 14
                    }
                }]
            }
        }
    })

    // Add function that loads a teams data based on what was selected in bar chart
    document.getElementById("playersByNFLTeamChart").onclick = function(evt) {
        var activePoint = playersByNFLTeamChart.getElementAtEvent(evt);
      
        // make sure click was on an actual point
        if (activePoint.length > 0) {

            loadPlayersOnNFLTeam(nflTeamchartData[activePoint[0]._index][0])

        }
    };

    // Load the first fantasy players details into pie chart
    loadPlayersOnNFLTeam(nflTeamchartData[0][0])






    // Create draft order chart/table
    //ownerNames
    var qbEntry = false;
    var rbEntry = false;
    var wrEntry = false;
    var teEntry = false;
    var kEntry = false;
    var dstEntry = false;
    chartData = []
    for(var i = 1; i < draftData.length; i++){

        // Fill in data
        var tempArray = []
        for(var j = 0; j < ownerCount; j++){
            if(nominatorNames[j] == draftData[i]['nominator']){
                tempArray.push(1)
            } else {
                tempArray.push(0)
            }
        }

        if(draftData[i]['position'] == "QB") {
            if(draftData[i]['nominator'] == draftData[i]['winner']){
                if(!qbEntry){
                    chartData.push({
                        label: "QB",
                        data: tempArray,
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgb(137, 49, 239)',
                        borderWidth: 4,
                        order: 1
                    })
                    qbEntry = true;
                } else {
                    chartData.push({
                        label: "DELETE",
                        data: tempArray,
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgb(137, 49, 239)',
                        borderWidth: 4,
                        order: 1
                    })
                }
            } else {
                chartData.push({
                    label: "DELETE",
                    data: tempArray,
                    borderColor: 'rgb(0, 0, 0)',
                    backgroundColor: 'rgb(137, 49, 239)',
                    borderWidth: 1,
                    order: 1
                })
            }
        } else if(draftData[i]['position'] == "RB") {
            if(draftData[i]['nominator'] == draftData[i]['winner']){
                if(!rbEntry){
                    chartData.push({
                        label: "RB",
                        data: tempArray,
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgb(242, 202, 25)',
                        borderWidth: 4,
                        order: 1
                    })
                    rbEntry = true;
                } else {
                    chartData.push({
                        label: "DELETE",
                        data: tempArray,
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgb(242, 202, 25)',
                        borderWidth: 4,
                        order: 1
                    })
                }
            } else {
                chartData.push({
                    label: "DELETE",
                    data: tempArray,
                    borderColor: 'rgb(0, 0, 0)',
                    backgroundColor: 'rgb(242, 202, 25)',
                    borderWidth: 1,
                    order: 1
                })
            }
        } else if(draftData[i]['position'] == "WR") {
            if(draftData[i]['nominator'] == draftData[i]['winner']){
                if(!wrEntry){
                    chartData.push({
                        label: "WR",
                        data: tempArray,
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgb(255, 0, 189)',
                        borderWidth: 4,
                        order: 1
                    })
                    wrEntry = true;
                } else {
                    chartData.push({
                        label: "DELETE",
                        data: tempArray,
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgb(255, 0, 189)',
                        borderWidth: 4,
                        order: 1
                    })
                }
            } else {
                chartData.push({
                    label: "DELETE",
                    data: tempArray,
                    borderColor: 'rgb(0, 0, 0)',
                    backgroundColor: 'rgb(255, 0, 189)',
                    borderWidth: 1,
                    order: 1
                })
            }
        } else if(draftData[i]['position'] == "TE") {
            if(draftData[i]['nominator'] == draftData[i]['winner']){
                if(!teEntry){
                    chartData.push({
                        label: "TE",
                        data: tempArray,
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgb(0, 87, 233)',
                        borderWidth: 4,
                        order: 1
                    })
                    teEntry = true;
                } else {
                    chartData.push({
                        label: "DELETE",
                        data: tempArray,
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgb(0, 87, 233)',
                        borderWidth: 4,
                        order: 1
                    })
                }
            } else {
                chartData.push({
                    label: "DELETE",
                    data: tempArray,
                    borderColor: 'rgb(0, 0, 0)',
                    backgroundColor: 'rgb(0, 87, 233)',
                    borderWidth: 1,
                    order: 1
                })
            }
        } else if(draftData[i]['position'] == "K") {
            if(draftData[i]['nominator'] == draftData[i]['winner']){
                if(!kEntry){
                    chartData.push({
                        label: "K",
                        data: tempArray,
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgb(135, 233, 17)',
                        borderWidth: 4,
                        order: 1
                    })
                    kEntry = true;
                } else {
                    chartData.push({
                        label: "DELETE",
                        data: tempArray,
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgb(135, 233, 17)',
                        borderWidth: 4,
                        order: 1
                    })
                }
            } else {
                chartData.push({
                    label: "DELETE",
                    data: tempArray,
                    borderColor: 'rgb(0, 0, 0)',
                    backgroundColor: 'rgb(135, 233, 17)',
                    borderWidth: 1,
                    order: 1
                })
            }
        } else if(draftData[i]['position'] == "DST") {
            if(draftData[i]['nominator'] == draftData[i]['winner']){
                if(!dstEntry){
                    chartData.push({
                        label: "DST",
                        data: tempArray,
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgb(225, 24, 69)',
                        borderWidth: 4,
                        order: 1
                    })
                    dstEntry = true;
                } else {
                    chartData.push({
                        label: "DELETE",
                        data: tempArray,
                        borderColor: 'rgb(0, 0, 0)',
                        backgroundColor: 'rgb(225, 24, 69)',
                        borderWidth: 4,
                        order: 1
                    })
                }
            } else {
                chartData.push({
                    label: "DELETE",
                    data: tempArray,
                    borderColor: 'rgb(0, 0, 0)',
                    backgroundColor: 'rgb(225, 24, 69)',
                    borderWidth: 1,
                    order: 1
                })
            }
        }
    }

    // Create chart
    var graph = document.getElementById("draftOrderChart");
    
    // Clear all data/destroy if needed (not first load)
    if (typeof draftOrderChart != 'undefined'){
        draftOrderChart.destroy();
    }

    draftOrderChart = new Chart(graph, {
        type: 'bar',
        data: {
            labels: nominatorNames,
            datasets: chartData
        },
        options: {
            legend: {
                labels: {
                    filter: function(item, chart) {
                        // Logic to remove a particular legend item goes here
                        return !item.text.includes("DELETE");
                    }
                },
                display: true
            },
            scales: {
                xAxes: [{
                    stacked: true,
                    scaleLabel : {
                        display : true,
                        labelString : "Fantasy Owner",
                        fontStyle : 'bold',
                        fontSize : 14
                    }
                }],
                yAxes: [{
                    stacked: true,
                    scaleLabel : {
                        display : true,
                        labelString : "Round",
                        fontStyle : 'bold',
                        fontSize : 14
                    }
                }]
            },
            tooltips: {
                enabled: true,
                callbacks: {
                    label: function(tooltipItems, data) {

                        return draftData[tooltipItems.datasetIndex+1]['fullName'].concat(": $").concat(draftData[tooltipItems.datasetIndex+1]['price'])
                    }
                }
            }
        }
    })


    // Add function that loads a teams data based on what was selected in bar chart
    document.getElementById("draftOrderChart").onclick = function(evt) {
        var activePoint = draftOrderChart.getElementAtEvent(evt);
      
        // make sure click was on an actual point
        if (activePoint.length > 0) {

            loadPlayersNominated(nominatorNames[activePoint[0]._index])

        }
    };
    loadPlayersNominated(nominatorNames[0])






    // MONEY SPENT TREND CHART

    chartData = [];
    var xAxis = [];
    for(var i in ownerNames) {
        chartData.push([])
    }
    for(var i = 1; i < draftData.length; i++){
        xAxis.push(i)
        xAxis.push(i)
        for(var j = 0; j < ownerCount; j++){
            if(ownerNames[j] == draftData[i]['winner']) {
                if(i == 1) {
                    
                    chartData[j].push(parseInt(draftData[i]['price']))
                } else {
                    //console.log(chartData[j][i-2])
                    chartData[j].push(chartData[j][i-2] + parseInt(draftData[i]['price']))
                }
            } else {
                if(i == 1) {
                    chartData[j].push(0)
                } else {
                    chartData[j].push(chartData[j][i-2])
                }
            }
        }
    }
    

    

    for(var i = draftData.length - 2; i > 0; i--){
        for(var j in ownerNames) {
            chartData[j].splice(i, 0, chartData[j][i-1]);
        }
    }
    for(var i in ownerNames){
        chartData[i].splice(0, 0, 0);
    }
 
    // Create chart
    var graph = document.getElementById("playerSpendingChart");
 
 
    // Clear all data/destroy if needed (not first load)
    if (typeof playerSpendingChart != 'undefined'){
        playerSpendingChart.destroy();
    }

    // Create dataset
    var datasetsData = []
    for(var i = 0; i < ownerCount; i++){
        var dataPoints = []
        for(var j = 0; j < xAxis.length; j++){
            dataPoints.push({x:xAxis[j],y:chartData[i][j]})
        }
        datasetsData.push({
            "label": ownerNames[i],
            "data": dataPoints,
            "fill": false,
            "lineTension": 0,
            'borderColor': colorScheme[i],
            'fillColor': colorScheme[i],
            showLine: true,
            pointRadius: 0,
            hitRadius: 5
        })
    }

    console.log(datasetsData)
 
    playerSpendingChart = new Chart(graph, {
        type: 'scatter',
        data: {
            datasets: datasetsData
        },
        options: {
            scales: {
                xAxes: [{
                    ticks: {
                        min: 1,
                        max: draftData.length                    },
                    scaleLabel : {
                        display : true,
                        labelString : "Pick Number",
                        fontStyle : 'bold',
                        fontSize : 14
                    }
                }],
                yAxes: [{
                    scaleLabel : {
                        display : true,
                        labelString : "Amount Spent ($)",
                        fontStyle : 'bold',
                        fontSize : 14
                    }
                }]
            },
            tooltips: {
                enabled: false,
            }
        }
    })

    
    // Add function that loads a teams data based on what was selected in line chart
    document.getElementById("playerSpendingChart").onclick = function(evt) {
        var activePoint = playerSpendingChart.getElementAtEvent(evt);
       
        // make sure click was on an actual point
        if (activePoint.length > 0) {
            loadplayerSpendingTable(ownerNames[activePoint[0]._datasetIndex])
        }
    };
 
    // Load the first fantasy players details into table
    loadplayerSpendingTable(ownerNames[0])






    // load first beersheets chart
    changePosition()







    // Create beersheets table
    var localTableData = []
    for(var i = 0; i < ownerCount; i++){
        localTableData.push({
            'owner': tableData[i]['owner'],
            'spend': tableData[i]['totalSpend'],
            'expSpend': tableData[i]['expSpend'],
            'diff': tableData[i]['expSpend'] - tableData[i]['totalSpend'],
            'best': [-100000,""],
            'worst': [100000,""]
        })
        for(var j = 0; j < tableData[i]['picks'].length; j++){
            var diff = parseInt(tableData[i]['picks'][j]['expPrice']) - parseInt(tableData[i]['picks'][j]['price'])
            if(diff > localTableData[i]['best'][0]) {
                localTableData[i]['best'][0] = diff;
                localTableData[i]['best'][1] = tableData[i]['picks'][j]['fullName'];
            }
            if(diff < localTableData[i]['worst'][0]) {
                localTableData[i]['worst'][0] = diff;
                localTableData[i]['worst'][1] = tableData[i]['picks'][j]['fullName'];
            }
        }
    }

    // Sort (high to low)
    localTableData.sort(function(a,b) {
        return b['diff'] - a['diff']
    });

    // Load into table

    // Gets table element and clears rows
    var tableBody = document.getElementById("spendVsExpectedFantasyTeamTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Loads rows into table
    for(var i = 0; i < localTableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        var tabCell = tr.insertCell(-1);
        tabCell.innerHTML = i+1;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = localTableData[i]['owner'];
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = "$".concat(localTableData[i]['spend']);
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = "$".concat(localTableData[i]['expSpend']);
        tabCell = tr.insertCell(-1);
        if(localTableData[i]['diff'] < 0) tabCell.innerHTML = "-$".concat(Math.abs(localTableData[i]['diff']).toString())
        else tabCell.innerHTML = "$".concat(Math.abs(localTableData[i]['diff']).toString())
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = localTableData[i]['best'][1].concat(" $").concat(localTableData[i]['best'][0].toString());
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = localTableData[i]['worst'][1].concat(" -$").concat(Math.abs(localTableData[i]['worst'][0]).toString());
    }





    // Create beersheets table
    var localTableData = []
    for(var i = 0; i < ownerCount; i++){
        localTableData.push({
            'owner': tableData[i]['owner'],
            'favTeam': "",
            'quantity': 0,
            'players': []
        })
        for(var j = 0; j < tableData[i]['nflTeamPicks'].length; j++){
            if(tableData[i]['nflTeamPicks'][j][1].length > localTableData[i]['quantity']) {
                localTableData[i]['quantity'] = tableData[i]['nflTeamPicks'][j][1].length;
                localTableData[i]['favTeam'] = tableData[i]['nflTeamPicks'][j][0];
                localTableData[i]['players'] = tableData[i]['nflTeamPicks'][j][1];
            } else if(tableData[i]['nflTeamPicks'][j][1].length == localTableData[i]['quantity']) {
                localTableData[i]['favTeam'] = localTableData[i]['favTeam'].concat(", ").concat(tableData[i]['nflTeamPicks'][j][0])
            }
        }
    }

    // Sort (high to low)
    localTableData.sort(function(a,b) {
        return b['quantity'] - a['quantity']
    });

    // Load into table

    // Gets table element and clears rows
    var tableBody = document.getElementById("nflTeamByOwnerTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Loads rows into table
    for(var i = 0; i < localTableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        var tabCell = tr.insertCell(-1);
        tabCell.innerHTML = localTableData[i]['owner'];
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = localTableData[i]['favTeam'];
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = localTableData[i]['quantity'];
        tabCell = tr.insertCell(-1);
        var playerList = localTableData[i]['players'][0]
        for(var j = 1; j < localTableData[i]['players'].length; j++){
            playerList = playerList.concat(", ").concat(localTableData[i]['players'][j])
        }
        tabCell.innerHTML = playerList;
    }







    // Load raw pick listing
    // Gets table element and clears rows
    var tableBody = document.getElementById("draftHistoryTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Loads rows into table
    for(var i = 1; i < draftData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        var tabCell = tr.insertCell(-1);
        tabCell.innerHTML = i;
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "10%";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = draftData[i]['fullName'];
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "30%";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = draftData[i]['position'];
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "10%";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = draftData[i]['winner'];
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "20%";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = "$".concat(draftData[i]['price']);
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "10%";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = "$".concat(draftData[i]['lowPrice']).concat(" - $").concat(draftData[i]['expPrice']).concat(" - $").concat(draftData[i]['highPrice'])
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell.style.width = "20%";
        
    }

}


function loadPointsPerPositionPieChart(ID) {

    // Update the header to show whose schedule it is
    var header = document.getElementById("pointsPerPositionPieChartHeader");
    header.innerText = tableData[ID]['owner'].concat(" Breakdown (Click bar for diff. owner)");



    // Create chart
    var graph = document.getElementById("pointsPerPositionPieChart");
    
    // Clear all data/destroy if needed (not first load)
    if (typeof pointsPerPositionPieChart != 'undefined'){
        pointsPerPositionPieChart.destroy();
    }

    pointsPerPositionPieChart = new Chart(graph, {
        type: 'doughnut',
        data: {
            labels: ["QB","RB","WR","TE","K","DST"],
            datasets: [{
                label: tableData[ID]['owner'].concat(" Breakdown"),
                data: [tableData[ID]['spentByPosition']['QB']['amount'],
                tableData[ID]['spentByPosition']['RB']['amount'],
                tableData[ID]['spentByPosition']['WR']['amount'],
                tableData[ID]['spentByPosition']['TE']['amount'],
                tableData[ID]['spentByPosition']['K']['amount'],
                tableData[ID]['spentByPosition']['DST']['amount']],
                backgroundColor: ['rgb(137, 49, 239)','rgb(242, 202, 25)','rgb(255, 0, 189)','rgb(0, 87, 233)','rgb(135, 233, 17)','rgb(225, 24, 69)'],
                hoverOffset: 4
            }]
        },
        options: {
            tooltips: {
                enabled: true,
                callbacks: {
                    label: function(tooltipItems, data) {
                        if(tooltipItems.index == 0){
                            return "QB: $".concat(tableData[ID]['spentByPosition']['QB']['amount'])
                        } else if(tooltipItems.index == 1){
                            return "RB: $".concat(tableData[ID]['spentByPosition']['RB']['amount'])
                        } else if(tooltipItems.index == 2){
                            return "WR: $".concat(tableData[ID]['spentByPosition']['WR']['amount'])
                        } else if(tooltipItems.index == 3){
                            return "TE: $".concat(tableData[ID]['spentByPosition']['TE']['amount'])
                        } else if(tooltipItems.index == 4){
                            return "K: $".concat(tableData[ID]['spentByPosition']['K']['amount'])
                        } else if(tooltipItems.index == 5){
                            return "DST: $".concat(tableData[ID]['spentByPosition']['DST']['amount'])
                        }
                    },
                    afterLabel: function(tooltipItems, data) {
                        if(tooltipItems.index == 0){
                            if(tableData[ID]['spentByPosition']['QB']['players'].length > 0){
                                var returnString = "$".concat(tableData[ID]['spentByPosition']['QB']['players'][0][1]).concat(" ").concat(tableData[ID]['spentByPosition']['QB']['players'][0][0].toString())
                                for(var i = 1; i < tableData[ID]['spentByPosition']['QB']['players'].length; i++) {
                                    returnString = returnString.concat("\n").concat("$").concat(tableData[ID]['spentByPosition']['QB']['players'][i][1]).concat(" ").concat(tableData[ID]['spentByPosition']['QB']['players'][i][0].toString())
                                }
                            } 
                            return returnString
                        } else if(tooltipItems.index == 1){
                            if(tableData[ID]['spentByPosition']['RB']['players'].length > 0){
                                var returnString = "$".concat(tableData[ID]['spentByPosition']['RB']['players'][0][1]).concat(" ").concat(tableData[ID]['spentByPosition']['RB']['players'][0][0].toString())
                                for(var i = 1; i < tableData[ID]['spentByPosition']['RB']['players'].length; i++) {
                                    returnString = returnString.concat("\n").concat("$").concat(tableData[ID]['spentByPosition']['RB']['players'][i][1]).concat(" ").concat(tableData[ID]['spentByPosition']['RB']['players'][i][0].toString())
                                }
                            }
                            return returnString
                        } else if(tooltipItems.index == 2){
                            if(tableData[ID]['spentByPosition']['WR']['players'].length > 0){
                                var returnString = "$".concat(tableData[ID]['spentByPosition']['WR']['players'][0][1]).concat(" ").concat(tableData[ID]['spentByPosition']['WR']['players'][0][0].toString())
                                for(var i = 1; i < tableData[ID]['spentByPosition']['WR']['players'].length; i++) {
                                    returnString = returnString.concat("\n").concat("$").concat(tableData[ID]['spentByPosition']['WR']['players'][i][1]).concat(" ").concat(tableData[ID]['spentByPosition']['WR']['players'][i][0].toString())
                                }
                            }
                            return returnString
                        } else if(tooltipItems.index == 3){
                            if(tableData[ID]['spentByPosition']['TE']['players'].length > 0){
                                var returnString = "$".concat(tableData[ID]['spentByPosition']['TE']['players'][0][1]).concat(" ").concat(tableData[ID]['spentByPosition']['TE']['players'][0][0].toString())
                                for(var i = 1; i < tableData[ID]['spentByPosition']['TE']['players'].length; i++) {
                                    returnString = returnString.concat("\n").concat("$").concat(tableData[ID]['spentByPosition']['TE']['players'][i][1]).concat(" ").concat(tableData[ID]['spentByPosition']['TE']['players'][i][0].toString())
                                }
                            }
                            return returnString
                        } else if(tooltipItems.index == 4){
                            if(tableData[ID]['spentByPosition']['K']['players'].length > 0){
                                var returnString = "$".concat(tableData[ID]['spentByPosition']['K']['players'][0][1]).concat(" ").concat(tableData[ID]['spentByPosition']['K']['players'][0][0].toString())
                                for(var i = 1; i < tableData[ID]['spentByPosition']['K']['players'].length; i++) {
                                    returnString = returnString.concat("\n").concat("$").concat(tableData[ID]['spentByPosition']['K']['players'][i][1]).concat(" ").concat(tableData[ID]['spentByPosition']['K']['players'][i][0].toString())
                                }
                            }
                            return returnString
                        } else if(tooltipItems.index == 5){
                            if(tableData[ID]['spentByPosition']['DST']['players'].length > 0){
                                var returnString = "$".concat(tableData[ID]['spentByPosition']['DST']['players'][0][1]).concat(" ").concat(tableData[ID]['spentByPosition']['DST']['players'][0][0].toString())
                                for(var i = 1; i < tableData[ID]['spentByPosition']['DST']['players'].length; i++) {
                                    returnString = returnString.concat("\n").concat("$").concat(tableData[ID]['spentByPosition']['DST']['players'][i][1]).concat(" ").concat(tableData[ID]['spentByPosition']['DST']['players'][i][0].toString())
                                }
                            }
                            return returnString
                        }
                    }
                }
            }
        }
    })

}

function loadPlayersOnNFLTeam(TEAM){
    
    // Update the header to show what nfl team was selected
    var header = document.getElementById("playersByNFLTeamTableHeader");
    header.innerText = TEAM.concat(" Players (Click bar for diff. team)");

    // Gets table element and clears rows
    var tableBody = document.getElementById("playersByNFLTeamTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Loads rows into table
    for(var i = 0; i < nflTeamsPicks[TEAM]['picks'].length; i++) {
        tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = nflTeamsPicks[TEAM]['picks'][i][0];
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = nflTeamsPicks[TEAM]['picks'][i][2];
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = "$".concat(nflTeamsPicks[TEAM]['picks'][i][1].toString());
        tabCell.style.paddingTop = "0.25em";
        tabCell.style.paddingBottom = "0.25em";
    }

}

function loadPlayersNominated(TEAM){
    // Update the header to show what nfl team was selected
    var header = document.getElementById("draftOrderTableHeader");
    header.innerText = TEAM.concat(" Nominations (Click bar for diff. nominating owner)");

    // Gets table element and clears rows
    var tableBody = document.getElementById("draftOrderTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Loads rows into table
    for(var i = 1; i < draftData.length; i++) {
        if(TEAM == draftData[i]['nominator']){
            tr = tableBody.insertRow(-1);  
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = i;
            tabCell.style.paddingTop = "0.25em";
            tabCell.style.paddingBottom = "0.25em";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = draftData[i]['fullName'];
            tabCell.style.paddingTop = "0.25em";
            tabCell.style.paddingBottom = "0.25em";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = draftData[i]['price'];
            tabCell.style.paddingTop = "0.25em";
            tabCell.style.paddingBottom = "0.25em";
            if(draftData[i]['nominator'] == draftData[i]['winner']) {
                tabCell = tr.insertCell(-1);
                tabCell.innerHTML = "YES";
                tabCell.style.paddingTop = "0.25em";
                tabCell.style.paddingBottom = "0.25em";
            } else {
                tabCell = tr.insertCell(-1);
                tabCell.innerHTML = "";
                tabCell.style.paddingTop = "0.25em";
                tabCell.style.paddingBottom = "0.25em";
            }
        }
    }
}

function loadplayerSpendingTable(TEAM){
    // Update the header to show what nfl team was selected
    var header = document.getElementById("playerSpendingTableHeader");
    header.innerText = TEAM.concat(" Players Selected (Click point for different owner)");

    // Gets table element and clears rows
    var tableBody = document.getElementById("playerSpendingTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Loads rows into table
    for(var i = 1; i < draftData.length; i++) {
        if(TEAM == draftData[i]['winner']){
            tr = tableBody.insertRow(-1);  
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = i;
            tabCell.style.paddingTop = "0.25em";
            tabCell.style.paddingBottom = "0.25em";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = draftData[i]['fullName'];
            tabCell.style.paddingTop = "0.25em";
            tabCell.style.paddingBottom = "0.25em";
            tabCell = tr.insertCell(-1);
            tabCell.innerHTML = draftData[i]['price'];
            tabCell.style.paddingTop = "0.25em";
            tabCell.style.paddingBottom = "0.25em";
        }
    }
}

function changePosition() {

    // Gets position value from the pulldown
    var e = document.getElementById("spendVsExpectedSelect");
    var position = e.value;

    var labels = []
    var dataPoints = []
    var maxValue = 0
    for(var i = 1; i < draftData.length; i++){
        if(draftData[i]['position'] == position){
            labels.push(draftData[i]['fullName'])
            dataPoints.push({x:draftData[i]['expPrice'],y:draftData[i]['price']})
            maxValue = Math.max(Math.max(maxValue,draftData[i]['expPrice']),draftData[i]['price'])
        }
    }

    maxValue = Math.ceil(maxValue/5 + 0.001)*5


    // Create chart
    var graph = document.getElementById("spendVsExpectedCanvas");
 
 
    // Clear all data/destroy if needed (not first load)
    if (typeof spendVsExpectedCanvas != 'undefined'){
        spendVsExpectedCanvas.destroy();
    }
 
    spendVsExpectedCanvas = new Chart(graph, {
        type: 'scatter',
        data: {
            datasets: [{
                "label": labels,
                "data": dataPoints,
                "fill": true,
                "lineTension": 0,
                'borderColor': "red",
                'fillColor': "red",
                showLine: false,
                pointRadius: 3,
                hitRadius: 5
            },{
                "data": [{
                    x: -1,
                    y: -1
                  }, {
                    x: 1000,
                    y: 1000
                  }],
                "fill": false,
                "lineTension": 0,
                'borderColor': "black",
                'fillColor': "black",
                showLine: true,
                pointRadius: 0,
                hitRadius: 0
            }]
        },
        options: {
            legend: {
                display: false
            },
            scales: {
                xAxes: [{
                    ticks: {
                        min: 0,
                        max: maxValue
                    },
                    scaleLabel : {
                        display : true,
                        labelString : "Beersheets Exp. $",
                        fontStyle : 'bold',
                        fontSize : 14
                    }
                }],
                yAxes: [{
                    ticks: {
                        min: 0,
                        max: maxValue
                    },
                    scaleLabel : {
                        display : true,
                        labelString : "Paid $",
                        fontStyle : 'bold',
                        fontSize : 14
                    }
                }]
            },
            tooltips: {
                enabled: true,
                callbacks: {
                    label: function(tooltipItem, data) {
                        return labels[tooltipItem.index];
                    },
                    afterLabel: function(tooltipItem, data) {
                        return "Paid $".concat(tooltipItem.value).concat("\nExpected $").concat(tooltipItem.label);
                    }
                }    
            }
        }
    })





}

