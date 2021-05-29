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
var nflTeamRawData;
var tableData;
var offense;
var rawStats;
var fantasyPoints;
var weeks;


/* FUNCTION: loadNFLTeamData
*
* Initialization function on page load
*
*/
function loadNFLTeamData() {

    // Reset values
    offense = false;
    rawStats = false;
    fantasyPoints = false;
    weeks = 16;

    var radio = document.getElementsByName('type-select');
    if (radio[0].checked) {
        offense = true;
    }

    radio = document.getElementsByName('relative-select');
    if (radio[0].checked) {
        rawStats = true;
    }

    radio = document.getElementsByName('stats-select');
    if (radio[0].checked) {
        fantasyPoints = true;
    }

    var pulldown = document.getElementById("weeks");
    weeks = pulldown.value;

    return firebase.database().ref('/nflTeamData').once('value').then((snapshot) => {
        nflTeamRawData = snapshot.val();
        updateTable()
    });
}


/* FUNCTION: updateTable
*
* Updates the table on the page.
* Called whenever the radio button/pulldown is updated (and on page load).
*
*/
function updateTable() {

    // Clear table data as we need an update
    tableData = [];

    // Loop through teams and add an entry for each nfl team
    for(var i = 0; i < Object.keys(nflTeamRawData).length; i++) {
        tableData.push({
            'team':Object.keys(nflTeamRawData)[i],
            'tableData': {}
        })
    }

    // Load data based on offense/defense
    if(offense){

        //Load data based on fantasy points or nfl stats
        if (fantasyPoints) {

            // Load data based on full or relative stats
            if (rawStats) {

                // Initialize column min/max
                var totalMin = 10000.0;
                var totalMax = -10000.0;
                var qbMin = 10000.0;
                var qbMax = -10000.0;
                var rbMin = 10000.0;
                var rbMax = -10000.0;
                var wrMin = 10000.0;
                var wrMax = -10000.0;
                var teMin = 10000.0;
                var teMax = -10000.0;
                var kMin = 10000.0;
                var kMax = -10000.0;
                var dstMin = 10000.0;
                var dstMax = -10000.0;

                // Load data
                for(var index in tableData) {

                    var team = tableData[index];

                    var nflTeam = team['team'];
                    var tempData = {
                        'totalPoints': 0,
                        'qbPoints': 0,
                        'rbPoints': 0,
                        'wrPoints': 0,
                        'tePoints': 0,
                        'kPoints': 0,
                        'dstPoints': 0
                    };

                    var weekCount = 0;
                    var counter = 0;
                    while (weekCount < weeks){
                        if(nflTeamRawData[nflTeam]['opponent'][counter] != "BYE"){
                            tempData['qbPoints'] += nflTeamRawData[nflTeam]['points'][counter]['qbPoints'];
                            tempData['rbPoints'] += nflTeamRawData[nflTeam]['points'][counter]['rbPoints'];
                            tempData['wrPoints'] += nflTeamRawData[nflTeam]['points'][counter]['wrPoints'];
                            tempData['tePoints'] += nflTeamRawData[nflTeam]['points'][counter]['tePoints'];
                            tempData['kPoints'] += nflTeamRawData[nflTeam]['points'][counter]['kPoints'];
                            tempData['dstPoints'] += nflTeamRawData[nflTeam]['points'][counter]['dstPoints'];
                            weekCount += 1;
                        }
                        counter += 1;
                    }

                    // Reset to get average
                    tempData['qbPoints'] = tempData['qbPoints'] / weeks;
                    tempData['rbPoints'] = tempData['rbPoints'] / weeks;
                    tempData['wrPoints'] = tempData['wrPoints'] / weeks;
                    tempData['tePoints'] = tempData['tePoints'] / weeks;
                    tempData['kPoints'] = tempData['kPoints'] / weeks;
                    tempData['dstPoints'] = tempData['dstPoints'] / weeks;

                    // Sum
                    tempData['totalPoints'] = tempData['qbPoints'] + tempData['rbPoints'] + tempData['wrPoints'] + tempData['tePoints'] + tempData['kPoints'] + tempData['dstPoints'];

                    // Round
                    tempData['totalPoints'] = Math.round(tempData['totalPoints'] * 100)/100;
                    tempData['qbPoints'] = Math.round(tempData['qbPoints'] * 100)/100;
                    tempData['rbPoints'] = Math.round(tempData['rbPoints'] * 100)/100;
                    tempData['wrPoints'] = Math.round(tempData['wrPoints'] * 100)/100;
                    tempData['tePoints'] = Math.round(tempData['tePoints'] * 100)/100;
                    tempData['kPoints'] = Math.round(tempData['kPoints'] * 100)/100;
                    tempData['dstPoints'] = Math.round(tempData['dstPoints'] * 100)/100;

                    // Check min/max
                    if(tempData['totalPoints'] > totalMax) totalMax = tempData['totalPoints'];
                    if(tempData['totalPoints'] < totalMin) totalMin = tempData['totalPoints'];
                    if(tempData['qbPoints'] > qbMax) qbMax = tempData['qbPoints'];
                    if(tempData['qbPoints'] < qbMin) qbMin = tempData['qbPoints'];
                    if(tempData['rbPoints'] > rbMax) rbMax = tempData['rbPoints'];
                    if(tempData['rbPoints'] < rbMin) rbMin = tempData['rbPoints'];
                    if(tempData['wrPoints'] > wrMax) wrMax = tempData['wrPoints'];
                    if(tempData['wrPoints'] < wrMin) wrMin = tempData['wrPoints'];
                    if(tempData['tePoints'] > teMax) teMax = tempData['tePoints'];
                    if(tempData['tePoints'] < teMin) teMin = tempData['tePoints'];
                    if(tempData['kPoints'] > kMax) kMax = tempData['kPoints'];
                    if(tempData['kPoints'] < kMin) kMin = tempData['kPoints'];
                    if(tempData['dstPoints'] > dstMax) dstMax = tempData['dstPoints'];
                    if(tempData['dstPoints'] < dstMin) dstMin = tempData['dstPoints'];

                    // Set in storage
                    team['tableData'] = tempData;
                }

                // Sort (high to low)
                tableData.sort(function(a,b) {
                    return b['tableData']['totalPoints'] - a['tableData']['totalPoints']
                });

                // Add table header

                // Get the table HEADER element and empty the data
                var tableHeader = document.getElementById("tableHead");
                while(tableHeader != null && tableHeader.hasChildNodes()) {
                    tableHeader.removeChild(tableHeader.firstChild);
                }

                // Fill in the table HEADER
                var tr = tableHeader.insertRow(-1);  
                var th = document.createElement("TH");
                th.innerHTML = "Team";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Total Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "QB Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "RB Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "WR Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "TE Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "K Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "DST Points";
                tr.appendChild(th);

                // Add the table body
                
                // Get the table BODY element and empty the data
                var tableBody = document.getElementById("tableBody");
                while(tableBody != null && tableBody.hasChildNodes()) {
                    tableBody.removeChild(tableBody.firstChild);
                }

                // Fill in the table BODY
                var middle;
                var value;
                for(var index in tableData) {
                    var tr = tableBody.insertRow(-1);  
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['team'];
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['totalPoints'];
                    middle = (totalMax + totalMin)/2;
                    value = tableData[index]['tableData']['totalPoints']
                    if(value > middle) tabCell.style.backgroundColor = "rgba(" + Math.round((totalMax - value)/(totalMax - middle)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - totalMin)/(middle - totalMin)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['qbPoints'];
                    middle = (qbMax + qbMin)/2;
                    value = tableData[index]['tableData']['qbPoints']
                    if(value > middle) tabCell.style.backgroundColor = "rgba(" + Math.round((qbMax - value)/(qbMax - middle)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - qbMin)/(middle - qbMin)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['rbPoints'];
                    middle = (rbMax + rbMin)/2;
                    value = tableData[index]['tableData']['rbPoints']
                    if(value > middle) tabCell.style.backgroundColor = "rgba(" + Math.round((rbMax - value)/(rbMax - middle)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - rbMin)/(middle - rbMin)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['wrPoints'];
                    middle = (wrMax + wrMin)/2;
                    value = tableData[index]['tableData']['wrPoints']
                    if(value > middle) tabCell.style.backgroundColor = "rgba(" + Math.round((wrMax - value)/(wrMax - middle)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - wrMin)/(middle - wrMin)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['tePoints'];
                    middle = (teMax + teMin)/2;
                    value = tableData[index]['tableData']['tePoints']
                    if(value > middle) tabCell.style.backgroundColor = "rgba(" + Math.round((teMax - value)/(teMax - middle)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - teMin)/(middle - teMin)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['kPoints'];
                    middle = (kMax + kMin)/2;
                    value = tableData[index]['tableData']['kPoints']
                    if(value > middle) tabCell.style.backgroundColor = "rgba(" + Math.round((kMax - value)/(kMax - middle)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - kMin)/(middle - kMin)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['dstPoints'];
                    middle = (dstMax + dstMin)/2;
                    value = tableData[index]['tableData']['dstPoints']
                    if(value > middle) tabCell.style.backgroundColor = "rgba(" + Math.round((dstMax - value)/(dstMax - middle)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - dstMin)/(middle - dstMin)*255) + ", 0, 0.5)"; 
                }
                
                var entireTable = document.getElementById("tableEntire");
                sorttable.makeSortable(entireTable);

            } else {
                // Initialize column min/max
                var totalMin = 10000.0;
                var totalMax = -10000.0;
                var qbMin = 10000.0;
                var qbMax = -10000.0;
                var rbMin = 10000.0;
                var rbMax = -10000.0;
                var wrMin = 10000.0;
                var wrMax = -10000.0;
                var teMin = 10000.0;
                var teMax = -10000.0;
                var kMin = 10000.0;
                var kMax = -10000.0;
                var dstMin = 10000.0;
                var dstMax = -10000.0;

                // Load data
                for(var index in tableData) {

                    var team = tableData[index];

                    var nflTeam = team['team'];
                    var tempData = {
                        'totalPoints': 0,
                        'qbPoints': 0,
                        'rbPoints': 0,
                        'wrPoints': 0,
                        'tePoints': 0,
                        'kPoints': 0,
                        'dstPoints': 0
                    };

                    var weekCount = 0;
                    var counter = 0;
                    

                    while (weekCount < weeks){
                        if(nflTeamRawData[nflTeam]['opponent'][counter] != "BYE"){
                            var opponent = nflTeamRawData[nflTeam]['opponent'][counter]

                            var oppWeekCount = 0;
                            var oppCounter = 0;
                            var denominator = 0;
                            var qbSum = 0;
                            var rbSum = 0;
                            var wrSum = 0;
                            var teSum = 0;
                            var kSum = 0;
                            var dstSum = 0;
                            while (oppWeekCount < weeks){
                                if(nflTeamRawData[opponent]['opponent'][oppCounter] != "BYE"){
                                    if(nflTeamRawData[opponent]['opponent'][oppCounter] != nflTeam) {
                                        qbSum += nflTeamRawData[opponent]['points'][oppCounter]['qbPoints'];
                                        rbSum += nflTeamRawData[opponent]['points'][oppCounter]['rbPoints'];
                                        wrSum += nflTeamRawData[opponent]['points'][oppCounter]['wrPoints'];
                                        teSum += nflTeamRawData[opponent]['points'][oppCounter]['tePoints'];
                                        kSum += nflTeamRawData[opponent]['points'][oppCounter]['kPoints'];
                                        dstSum += nflTeamRawData[opponent]['points'][oppCounter]['dstPoints'];
                                        denominator += 1;
                                    }
                                    oppWeekCount += 1;
                                }
                                oppCounter += 1;
                            }

                            tempData['qbPoints'] += nflTeamRawData[nflTeam]['points'][counter]['qbPoints'] - (qbSum/denominator);
                            tempData['rbPoints'] += nflTeamRawData[nflTeam]['points'][counter]['rbPoints'] - (rbSum/denominator);
                            tempData['wrPoints'] += nflTeamRawData[nflTeam]['points'][counter]['wrPoints'] - (wrSum/denominator);
                            tempData['tePoints'] += nflTeamRawData[nflTeam]['points'][counter]['tePoints'] - (teSum/denominator);
                            tempData['kPoints'] += nflTeamRawData[nflTeam]['points'][counter]['kPoints'] - (kSum/denominator);
                            tempData['dstPoints'] += nflTeamRawData[nflTeam]['points'][counter]['dstPoints'] - (dstSum/denominator);
                            weekCount += 1;
                        }
                        counter += 1;
                    }

                    // Reset to get average
                    tempData['qbPoints'] = tempData['qbPoints'] / weeks;
                    tempData['rbPoints'] = tempData['rbPoints'] / weeks;
                    tempData['wrPoints'] = tempData['wrPoints'] / weeks;
                    tempData['tePoints'] = tempData['tePoints'] / weeks;
                    tempData['kPoints'] = tempData['kPoints'] / weeks;
                    tempData['dstPoints'] = tempData['dstPoints'] / weeks;

                    // Sum
                    tempData['totalPoints'] = tempData['qbPoints'] + tempData['rbPoints'] + tempData['wrPoints'] + tempData['tePoints'] + tempData['kPoints'] + tempData['dstPoints'];

                    // Round
                    tempData['totalPoints'] = Math.round(tempData['totalPoints'] * 100)/100;
                    tempData['qbPoints'] = Math.round(tempData['qbPoints'] * 100)/100;
                    tempData['rbPoints'] = Math.round(tempData['rbPoints'] * 100)/100;
                    tempData['wrPoints'] = Math.round(tempData['wrPoints'] * 100)/100;
                    tempData['tePoints'] = Math.round(tempData['tePoints'] * 100)/100;
                    tempData['kPoints'] = Math.round(tempData['kPoints'] * 100)/100;
                    tempData['dstPoints'] = Math.round(tempData['dstPoints'] * 100)/100;

                    // Check min/max
                    if(tempData['totalPoints'] > totalMax) totalMax = tempData['totalPoints'];
                    if(tempData['totalPoints'] < totalMin) totalMin = tempData['totalPoints'];
                    if(tempData['qbPoints'] > qbMax) qbMax = tempData['qbPoints'];
                    if(tempData['qbPoints'] < qbMin) qbMin = tempData['qbPoints'];
                    if(tempData['rbPoints'] > rbMax) rbMax = tempData['rbPoints'];
                    if(tempData['rbPoints'] < rbMin) rbMin = tempData['rbPoints'];
                    if(tempData['wrPoints'] > wrMax) wrMax = tempData['wrPoints'];
                    if(tempData['wrPoints'] < wrMin) wrMin = tempData['wrPoints'];
                    if(tempData['tePoints'] > teMax) teMax = tempData['tePoints'];
                    if(tempData['tePoints'] < teMin) teMin = tempData['tePoints'];
                    if(tempData['kPoints'] > kMax) kMax = tempData['kPoints'];
                    if(tempData['kPoints'] < kMin) kMin = tempData['kPoints'];
                    if(tempData['dstPoints'] > dstMax) dstMax = tempData['dstPoints'];
                    if(tempData['dstPoints'] < dstMin) dstMin = tempData['dstPoints'];

                    // Set in storage
                    team['tableData'] = tempData;
                }

                // Sort (high to low)
                tableData.sort(function(a,b) {
                    return b['tableData']['totalPoints'] - a['tableData']['totalPoints']
                });

                // Add table header

                // Get the table HEADER element and empty the data
                var tableHeader = document.getElementById("tableHead");
                while(tableHeader != null && tableHeader.hasChildNodes()) {
                    tableHeader.removeChild(tableHeader.firstChild);
                }

                // Fill in the table HEADER
                var tr = tableHeader.insertRow(-1);  
                var th = document.createElement("TH");
                th.innerHTML = "Team";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Total Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "QB Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "RB Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "WR Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "TE Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "K Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "DST Points";
                tr.appendChild(th);

                // Add the table body
                
                // Get the table BODY element and empty the data
                var tableBody = document.getElementById("tableBody");
                while(tableBody != null && tableBody.hasChildNodes()) {
                    tableBody.removeChild(tableBody.firstChild);
                }

                // Fill in the table BODY
                var value;
                for(var index in tableData) {
                    var tr = tableBody.insertRow(-1);  
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['team'];
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['totalPoints'];
                    value = tableData[index]['tableData']['totalPoints']
                    if(value > 0) tabCell.style.backgroundColor = "rgba(" + Math.round((totalMax - value)/(totalMax - 0)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - totalMin)/(0 - totalMin)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['qbPoints'];
                    value = tableData[index]['tableData']['qbPoints']
                    if(value > 0) tabCell.style.backgroundColor = "rgba(" + Math.round((qbMax - value)/(qbMax - 0)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - qbMin)/(0 - qbMin)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['rbPoints'];
                    value = tableData[index]['tableData']['rbPoints']
                    if(value > 0) tabCell.style.backgroundColor = "rgba(" + Math.round((rbMax - value)/(rbMax - 0)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - rbMin)/(0 - rbMin)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['wrPoints'];
                    value = tableData[index]['tableData']['wrPoints']
                    if(value > 0) tabCell.style.backgroundColor = "rgba(" + Math.round((wrMax - value)/(wrMax - 0)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - wrMin)/(0 - wrMin)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['tePoints'];
                    value = tableData[index]['tableData']['tePoints']
                    if(value > 0) tabCell.style.backgroundColor = "rgba(" + Math.round((teMax - value)/(teMax - 0)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - teMin)/(0 - teMin)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['kPoints'];
                    value = tableData[index]['tableData']['kPoints']
                    if(value > 0) tabCell.style.backgroundColor = "rgba(" + Math.round((kMax - value)/(kMax - 0)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - kMin)/(0 - kMin)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['dstPoints'];
                    value = tableData[index]['tableData']['dstPoints']
                    if(value > 0) tabCell.style.backgroundColor = "rgba(" + Math.round((dstMax - value)/(dstMax - 0)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - dstMin)/(0 - dstMin)*255) + ", 0, 0.5)"; 
                }
                
                var entireTable = document.getElementById("tableEntire");
                sorttable.makeSortable(entireTable);
            }

        } else {

            // Load data based on full or relative stats
            if (rawStats) {

                // Initialize column min/max
                var minYards = 10000.0;
                var maxYards = -10000.0;
                var minRushYards = 10000.0;
                var maxRushYards = -10000.0;
                var minRecYards = 10000.0;
                var maxRecYards = -10000.0;
                var minTDs = 10000.0;
                var maxTDs = -10000.0;
                var minRushTDs = 10000.0;
                var maxRushTDs = -10000.0;
                var minRecTDs = 10000.0;
                var maxRecTDs = -10000.0;

                // Load data
                for(var index in tableData) {

                    var team = tableData[index];

                    var nflTeam = team['team'];
                    var tempData = {
                        'yards': 0,
                        'rushYards': 0,
                        'recYards': 0,
                        'tds': 0,
                        'rushTDs': 0,
                        'recTDs': 0                    };

                    var weekCount = 0;
                    var counter = 0;
                    while (weekCount < weeks){
                        if(nflTeamRawData[nflTeam]['opponent'][counter] != "BYE"){
                            tempData['yards'] += nflTeamRawData[nflTeam]['points'][counter]['yards'];
                            tempData['rushYards'] += nflTeamRawData[nflTeam]['points'][counter]['rushingYards'];
                            tempData['recYards'] += nflTeamRawData[nflTeam]['points'][counter]['passingYards'];
                            tempData['tds'] += nflTeamRawData[nflTeam]['points'][counter]['tds'];
                            tempData['rushTDs'] += nflTeamRawData[nflTeam]['points'][counter]['rushingTDs'];
                            tempData['recTDs'] += nflTeamRawData[nflTeam]['points'][counter]['passingTDs'];
                            weekCount += 1;
                        }
                        counter += 1;
                    }

                    // Reset to get average
                    tempData['yards'] = tempData['yards'] / weeks;
                    tempData['rushYards'] = tempData['rushYards'] / weeks;
                    tempData['recYards'] = tempData['recYards'] / weeks;
                    tempData['tds'] = tempData['tds'] / weeks;
                    tempData['rushTDs'] = tempData['rushTDs'] / weeks;
                    tempData['recTDs'] = tempData['recTDs'] / weeks;

                    // Round
                    tempData['yards'] = Math.round(tempData['yards'] * 100)/100;
                    tempData['rushYards'] = Math.round(tempData['rushYards'] * 100)/100;
                    tempData['recYards'] = Math.round(tempData['recYards'] * 100)/100;
                    tempData['tds'] = Math.round(tempData['tds'] * 100)/100;
                    tempData['rushTDs'] = Math.round(tempData['rushTDs'] * 100)/100;
                    tempData['recTDs'] = Math.round(tempData['recTDs'] * 100)/100;

                    // Check min/max
                    if(tempData['yards'] > maxYards) maxYards = tempData['yards'];
                    if(tempData['yards'] < minYards) minYards = tempData['yards'];
                    if(tempData['rushYards'] > maxRushYards) maxRushYards = tempData['rushYards'];
                    if(tempData['rushYards'] < minRushYards) minRushYards = tempData['rushYards'];
                    if(tempData['recYards'] > maxRecYards) maxRecYards = tempData['recYards'];
                    if(tempData['recYards'] < minRecYards) minRecYards = tempData['recYards'];
                    if(tempData['tds'] > maxTDs) maxTDs = tempData['tds'];
                    if(tempData['tds'] < minTDs) minTDs = tempData['tds'];
                    if(tempData['rushTDs'] > maxRushTDs) maxRushTDs = tempData['rushTDs'];
                    if(tempData['rushTDs'] < minRushTDs) minRushTDs = tempData['rushTDs'];
                    if(tempData['recTDs'] > maxRecTDs) maxRecTDs = tempData['recTDs'];
                    if(tempData['recTDs'] < minRecTDs) minRecTDs = tempData['recTDs'];

                    // Set in storage
                    team['tableData'] = tempData;
                }

                // Sort (high to low)
                tableData.sort(function(a,b) {
                    return b['tableData']['yards'] - a['tableData']['yards']
                });

                // Add table header

                // Get the table HEADER element and empty the data
                var tableHeader = document.getElementById("tableHead");
                while(tableHeader != null && tableHeader.hasChildNodes()) {
                    tableHeader.removeChild(tableHeader.firstChild);
                }

                // Fill in the table HEADER
                var tr = tableHeader.insertRow(-1);  
                var th = document.createElement("TH");
                th.innerHTML = "Team";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Total Yards";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rush Yards";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rec. Yards";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Touchdowns";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rush TDs";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rec. TDs";
                tr.appendChild(th);

                // Add the table body
                
                // Get the table BODY element and empty the data
                var tableBody = document.getElementById("tableBody");
                while(tableBody != null && tableBody.hasChildNodes()) {
                    tableBody.removeChild(tableBody.firstChild);
                }

                // Fill in the table BODY
                var middle;
                var value;
                for(var index in tableData) {
                    var tr = tableBody.insertRow(-1);  
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['team'];
                                        
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['yards'];
                    middle = (maxYards + minYards)/2;
                    value = tableData[index]['tableData']['yards']
                    if(value > middle) tabCell.style.backgroundColor = "rgba(" + Math.round((maxYards - value)/(maxYards - middle)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - minYards)/(middle - minYards)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['rushYards'];
                    middle = (maxRushYards + minRushYards)/2;
                    value = tableData[index]['tableData']['rushYards']
                    if(value > middle) tabCell.style.backgroundColor = "rgba(" + Math.round((maxRushYards - value)/(maxRushYards - middle)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - minRushYards)/(middle - minRushYards)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['recYards'];
                    middle = (maxRecYards + minRecYards)/2;
                    value = tableData[index]['tableData']['recYards']
                    if(value > middle) tabCell.style.backgroundColor = "rgba(" + Math.round((maxRecYards - value)/(maxRecYards - middle)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - minRecYards)/(middle - minRecYards)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['tds'];
                    middle = (maxTDs + minTDs)/2;
                    value = tableData[index]['tableData']['tds']
                    if(value > middle) tabCell.style.backgroundColor = "rgba(" + Math.round((maxTDs - value)/(maxTDs - middle)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - minTDs)/(middle - minTDs)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['rushTDs'];
                    middle = (maxRushTDs + minRushTDs)/2;
                    value = tableData[index]['tableData']['rushTDs']
                    if(value > middle) tabCell.style.backgroundColor = "rgba(" + Math.round((maxRushTDs - value)/(maxRushTDs - middle)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - minRushTDs)/(middle - minRushTDs)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['recTDs'];
                    middle = (maxRecTDs + minRecTDs)/2;
                    value = tableData[index]['tableData']['recTDs']
                    if(value > middle) tabCell.style.backgroundColor = "rgba(" + Math.round((maxRecTDs - value)/(maxRecTDs - middle)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - minRecTDs)/(middle - minRecTDs)*255) + ", 0, 0.5)"; 
                }
                
                var entireTable = document.getElementById("tableEntire");
                sorttable.makeSortable(entireTable);

            } else {

                // Initialize column min/max
                var minYards = 10000.0;
                var maxYards = -10000.0;
                var minRushYards = 10000.0;
                var maxRushYards = -10000.0;
                var minRecYards = 10000.0;
                var maxRecYards = -10000.0;
                var minTDs = 10000.0;
                var maxTDs = -10000.0;
                var minRushTDs = 10000.0;
                var maxRushTDs = -10000.0;
                var minRecTDs = 10000.0;
                var maxRecTDs = -10000.0;

                // Load data
                for(var index in tableData) {

                    var team = tableData[index];

                    var nflTeam = team['team'];
                    var tempData = {
                        'yards': 0,
                        'rushYards': 0,
                        'recYards': 0,
                        'tds': 0,
                        'rushTDs': 0,
                        'recTDs': 0                    
                    };

                    var weekCount = 0;
                    var counter = 0;
                    while (weekCount < weeks){
                        if(nflTeamRawData[nflTeam]['opponent'][counter] != "BYE"){

                            var opponent = nflTeamRawData[nflTeam]['opponent'][counter]

                            var oppWeekCount = 0;
                            var oppCounter = 0;
                            var denominator = 0;
                            var yardSum = 0;
                            var rushYardSum = 0;
                            var recYardSum = 0;
                            var tdSum = 0;
                            var rushTDSum = 0;
                            var recTDSum = 0;
                            while (oppWeekCount < weeks){
                                if(nflTeamRawData[opponent]['opponent'][oppCounter] != "BYE"){
                                    if(nflTeamRawData[opponent]['opponent'][oppCounter] != nflTeam) {
                                        yardSum += nflTeamRawData[opponent]['points'][oppCounter]['yards'];
                                        rushYardSum += nflTeamRawData[opponent]['points'][oppCounter]['rushingYards'];
                                        recYardSum += nflTeamRawData[opponent]['points'][oppCounter]['passingYards'];
                                        tdSum += nflTeamRawData[opponent]['points'][oppCounter]['tds'];
                                        rushTDSum += nflTeamRawData[opponent]['points'][oppCounter]['rushingTDs'];
                                        recTDSum += nflTeamRawData[opponent]['points'][oppCounter]['passingTDs'];
                                        denominator += 1;
                                    }
                                    oppWeekCount += 1;
                                }
                                oppCounter += 1;
                            }

                            tempData['yards'] += nflTeamRawData[nflTeam]['points'][counter]['yards'] - (yardSum/denominator);
                            tempData['rushYards'] += nflTeamRawData[nflTeam]['points'][counter]['rushingYards'] - (rushYardSum/denominator);
                            tempData['recYards'] += nflTeamRawData[nflTeam]['points'][counter]['passingYards'] - (recYardSum/denominator);
                            tempData['tds'] += nflTeamRawData[nflTeam]['points'][counter]['tds'] - (tdSum/denominator);
                            tempData['rushTDs'] += nflTeamRawData[nflTeam]['points'][counter]['rushingTDs'] - (rushTDSum/denominator);
                            tempData['recTDs'] += nflTeamRawData[nflTeam]['points'][counter]['passingTDs'] - (recTDSum/denominator);
                            weekCount += 1;
                        }
                        counter += 1;
                    }

                    // Reset to get average
                    tempData['yards'] = tempData['yards'] / weeks;
                    tempData['rushYards'] = tempData['rushYards'] / weeks;
                    tempData['recYards'] = tempData['recYards'] / weeks;
                    tempData['tds'] = tempData['tds'] / weeks;
                    tempData['rushTDs'] = tempData['rushTDs'] / weeks;
                    tempData['recTDs'] = tempData['recTDs'] / weeks;

                    // Round
                    tempData['yards'] = Math.round(tempData['yards'] * 100)/100;
                    tempData['rushYards'] = Math.round(tempData['rushYards'] * 100)/100;
                    tempData['recYards'] = Math.round(tempData['recYards'] * 100)/100;
                    tempData['tds'] = Math.round(tempData['tds'] * 100)/100;
                    tempData['rushTDs'] = Math.round(tempData['rushTDs'] * 100)/100;
                    tempData['recTDs'] = Math.round(tempData['recTDs'] * 100)/100;

                    // Check min/max
                    if(tempData['yards'] > maxYards) maxYards = tempData['yards'];
                    if(tempData['yards'] < minYards) minYards = tempData['yards'];
                    if(tempData['rushYards'] > maxRushYards) maxRushYards = tempData['rushYards'];
                    if(tempData['rushYards'] < minRushYards) minRushYards = tempData['rushYards'];
                    if(tempData['recYards'] > maxRecYards) maxRecYards = tempData['recYards'];
                    if(tempData['recYards'] < minRecYards) minRecYards = tempData['recYards'];
                    if(tempData['tds'] > maxTDs) maxTDs = tempData['tds'];
                    if(tempData['tds'] < minTDs) minTDs = tempData['tds'];
                    if(tempData['rushTDs'] > maxRushTDs) maxRushTDs = tempData['rushTDs'];
                    if(tempData['rushTDs'] < minRushTDs) minRushTDs = tempData['rushTDs'];
                    if(tempData['recTDs'] > maxRecTDs) maxRecTDs = tempData['recTDs'];
                    if(tempData['recTDs'] < minRecTDs) minRecTDs = tempData['recTDs'];

                    // Set in storage
                    team['tableData'] = tempData;
                }

                // Sort (high to low)
                tableData.sort(function(a,b) {
                    return b['tableData']['yards'] - a['tableData']['yards']
                });

                // Add table header

                // Get the table HEADER element and empty the data
                var tableHeader = document.getElementById("tableHead");
                while(tableHeader != null && tableHeader.hasChildNodes()) {
                    tableHeader.removeChild(tableHeader.firstChild);
                }

                // Fill in the table HEADER
                var tr = tableHeader.insertRow(-1);  
                var th = document.createElement("TH");
                th.innerHTML = "Team";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Total Yards";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rush Yards";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rec. Yards";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Touchdowns";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rush TDs";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rec. TDs";
                tr.appendChild(th);

                // Add the table body
                
                // Get the table BODY element and empty the data
                var tableBody = document.getElementById("tableBody");
                while(tableBody != null && tableBody.hasChildNodes()) {
                    tableBody.removeChild(tableBody.firstChild);
                }

                // Fill in the table BODY
                var middle;
                var value;
                for(var index in tableData) {
                    var tr = tableBody.insertRow(-1);  
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['team'];
                                        
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['yards'];
                    value = tableData[index]['tableData']['yards']
                    if(value > 0) tabCell.style.backgroundColor = "rgba(" + Math.round((maxYards - value)/(maxYards - 0)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - minYards)/(0 - minYards)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['rushYards'];
                    value = tableData[index]['tableData']['rushYards']
                    if(value > 0) tabCell.style.backgroundColor = "rgba(" + Math.round((maxRushYards - value)/(maxRushYards - 0)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - minRushYards)/(0 - minRushYards)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['recYards'];
                    value = tableData[index]['tableData']['recYards']
                    if(value > 0) tabCell.style.backgroundColor = "rgba(" + Math.round((maxRecYards - value)/(maxRecYards - 0)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - minRecYards)/(0 - minRecYards)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['tds'];
                    value = tableData[index]['tableData']['tds']
                    if(value > 0) tabCell.style.backgroundColor = "rgba(" + Math.round((maxTDs - value)/(maxTDs - 0)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - minTDs)/(0 - minTDs)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['rushTDs'];
                    value = tableData[index]['tableData']['rushTDs']
                    if(value > 0) tabCell.style.backgroundColor = "rgba(" + Math.round((maxRushTDs - value)/(maxRushTDs - 0)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - minRushTDs)/(0 - minRushTDs)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['recTDs'];
                    value = tableData[index]['tableData']['recTDs']
                    if(value > 0) tabCell.style.backgroundColor = "rgba(" + Math.round((maxRecTDs - value)/(maxRecTDs - 0)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((value - minRecTDs)/(0 - minRecTDs)*255) + ", 0, 0.5)"; 
                }
                
                var entireTable = document.getElementById("tableEntire");
                sorttable.makeSortable(entireTable);
            }

        }

    } else {

        //Load data based on fantasy points or nfl stats
        if (fantasyPoints) {

            // Load data based on full or relative stats
            if (rawStats) {

                // Initialize column min/max
                var totalMin = 10000.0;
                var totalMax = -10000.0;
                var qbMin = 10000.0;
                var qbMax = -10000.0;
                var rbMin = 10000.0;
                var rbMax = -10000.0;
                var wrMin = 10000.0;
                var wrMax = -10000.0;
                var teMin = 10000.0;
                var teMax = -10000.0;
                var kMin = 10000.0;
                var kMax = -10000.0;
                var dstMin = 10000.0;
                var dstMax = -10000.0;

                // Load data
                for(var index in tableData) {

                    var team = tableData[index];

                    var nflTeam = team['team'];
                    var tempData = {
                        'totalPoints': 0,
                        'qbPoints': 0,
                        'rbPoints': 0,
                        'wrPoints': 0,
                        'tePoints': 0,
                        'kPoints': 0,
                        'dstPoints': 0
                    };

                    var weekCount = 0;
                    var counter = 0;
                    while (weekCount < weeks){
                        if(nflTeamRawData[nflTeam]['opponent'][counter] != "BYE"){
                            var opponent = nflTeamRawData[nflTeam]['opponent'][counter];
                            tempData['qbPoints'] += nflTeamRawData[opponent]['points'][counter]['qbPoints'];
                            tempData['rbPoints'] += nflTeamRawData[opponent]['points'][counter]['rbPoints'];
                            tempData['wrPoints'] += nflTeamRawData[opponent]['points'][counter]['wrPoints'];
                            tempData['tePoints'] += nflTeamRawData[opponent]['points'][counter]['tePoints'];
                            tempData['kPoints'] += nflTeamRawData[opponent]['points'][counter]['kPoints'];
                            tempData['dstPoints'] += nflTeamRawData[opponent]['points'][counter]['dstPoints'];
                            weekCount += 1;
                        }
                        counter += 1;
                    }

                    // Reset to get average
                    tempData['qbPoints'] = tempData['qbPoints'] / weeks;
                    tempData['rbPoints'] = tempData['rbPoints'] / weeks;
                    tempData['wrPoints'] = tempData['wrPoints'] / weeks;
                    tempData['tePoints'] = tempData['tePoints'] / weeks;
                    tempData['kPoints'] = tempData['kPoints'] / weeks;
                    tempData['dstPoints'] = tempData['dstPoints'] / weeks;

                    // Sum
                    tempData['totalPoints'] = tempData['qbPoints'] + tempData['rbPoints'] + tempData['wrPoints'] + tempData['tePoints'] + tempData['kPoints'] + tempData['dstPoints'];

                    // Round
                    tempData['totalPoints'] = Math.round(tempData['totalPoints'] * 100)/100;
                    tempData['qbPoints'] = Math.round(tempData['qbPoints'] * 100)/100;
                    tempData['rbPoints'] = Math.round(tempData['rbPoints'] * 100)/100;
                    tempData['wrPoints'] = Math.round(tempData['wrPoints'] * 100)/100;
                    tempData['tePoints'] = Math.round(tempData['tePoints'] * 100)/100;
                    tempData['kPoints'] = Math.round(tempData['kPoints'] * 100)/100;
                    tempData['dstPoints'] = Math.round(tempData['dstPoints'] * 100)/100;

                    // Check min/max
                    if(tempData['totalPoints'] > totalMax) totalMax = tempData['totalPoints'];
                    if(tempData['totalPoints'] < totalMin) totalMin = tempData['totalPoints'];
                    if(tempData['qbPoints'] > qbMax) qbMax = tempData['qbPoints'];
                    if(tempData['qbPoints'] < qbMin) qbMin = tempData['qbPoints'];
                    if(tempData['rbPoints'] > rbMax) rbMax = tempData['rbPoints'];
                    if(tempData['rbPoints'] < rbMin) rbMin = tempData['rbPoints'];
                    if(tempData['wrPoints'] > wrMax) wrMax = tempData['wrPoints'];
                    if(tempData['wrPoints'] < wrMin) wrMin = tempData['wrPoints'];
                    if(tempData['tePoints'] > teMax) teMax = tempData['tePoints'];
                    if(tempData['tePoints'] < teMin) teMin = tempData['tePoints'];
                    if(tempData['kPoints'] > kMax) kMax = tempData['kPoints'];
                    if(tempData['kPoints'] < kMin) kMin = tempData['kPoints'];
                    if(tempData['dstPoints'] > dstMax) dstMax = tempData['dstPoints'];
                    if(tempData['dstPoints'] < dstMin) dstMin = tempData['dstPoints'];

                    // Set in storage
                    team['tableData'] = tempData;
                }

                // Sort (low to high)
                tableData.sort(function(a,b) {
                    return a['tableData']['totalPoints'] - b['tableData']['totalPoints']
                });

                // Add table header

                // Get the table HEADER element and empty the data
                var tableHeader = document.getElementById("tableHead");
                while(tableHeader != null && tableHeader.hasChildNodes()) {
                    tableHeader.removeChild(tableHeader.firstChild);
                }

                // Fill in the table HEADER
                var tr = tableHeader.insertRow(-1);  
                var th = document.createElement("TH");
                th.innerHTML = "Team";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Total Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "QB Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "RB Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "WR Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "TE Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "K Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "DST Points";
                tr.appendChild(th);

                // Add the table body
                
                // Get the table BODY element and empty the data
                var tableBody = document.getElementById("tableBody");
                while(tableBody != null && tableBody.hasChildNodes()) {
                    tableBody.removeChild(tableBody.firstChild);
                }

                // Fill in the table BODY
                var middle;
                var value;
                for(var index in tableData) {
                    var tr = tableBody.insertRow(-1);  
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['team'];
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['totalPoints'];
                    middle = (totalMax + totalMin)/2;
                    value = tableData[index]['tableData']['totalPoints']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - totalMin)/(middle - totalMin)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((totalMax - value)/(totalMax - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['qbPoints'];
                    middle = (qbMax + qbMin)/2;
                    value = tableData[index]['tableData']['qbPoints']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - qbMin)/(middle - qbMin)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((qbMax - value)/(qbMax - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['rbPoints'];
                    middle = (rbMax + rbMin)/2;
                    value = tableData[index]['tableData']['rbPoints']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - rbMin)/(middle - rbMin)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((rbMax - value)/(rbMax - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['wrPoints'];
                    middle = (wrMax + wrMin)/2;
                    value = tableData[index]['tableData']['wrPoints']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - wrMin)/(middle - wrMin)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((wrMax - value)/(wrMax - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['tePoints'];
                    middle = (teMax + teMin)/2;
                    value = tableData[index]['tableData']['tePoints']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - teMin)/(middle - teMin)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((teMax - value)/(teMax - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['kPoints'];
                    middle = (kMax + kMin)/2;
                    value = tableData[index]['tableData']['kPoints']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - kMin)/(middle - kMin)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((kMax - value)/(kMax - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['dstPoints'];
                    middle = (dstMax + dstMin)/2;
                    value = tableData[index]['tableData']['dstPoints']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - dstMin)/(middle - dstMin)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((dstMax - value)/(dstMax - middle)*255) + ", 0, 0.5)"; 
                }
                
                var entireTable = document.getElementById("tableEntire");
                sorttable.makeSortable(entireTable);

            } else {

                // Initialize column min/max
                var totalMin = 10000.0;
                var totalMax = -10000.0;
                var qbMin = 10000.0;
                var qbMax = -10000.0;
                var rbMin = 10000.0;
                var rbMax = -10000.0;
                var wrMin = 10000.0;
                var wrMax = -10000.0;
                var teMin = 10000.0;
                var teMax = -10000.0;
                var kMin = 10000.0;
                var kMax = -10000.0;
                var dstMin = 10000.0;
                var dstMax = -10000.0;

                // Load data
                for(var index in tableData) {

                    var team = tableData[index];

                    var nflTeam = team['team'];
                    var tempData = {
                        'totalPoints': 0,
                        'qbPoints': 0,
                        'rbPoints': 0,
                        'wrPoints': 0,
                        'tePoints': 0,
                        'kPoints': 0,
                        'dstPoints': 0
                    };

                    var weekCount = 0;
                    var counter = 0;
                    while (weekCount < weeks){
                        if(nflTeamRawData[nflTeam]['opponent'][counter] != "BYE"){

                            var opponent = nflTeamRawData[nflTeam]['opponent'][counter]

                            var oppWeekCount = 0;
                            var oppCounter = 0;
                            var denominator = 0;
                            var qbSum = 0;
                            var rbSum = 0;
                            var wrSum = 0;
                            var teSum = 0;
                            var kSum = 0;
                            var dstSum = 0;
                            while (oppWeekCount < weeks){
                                var opponent2 = nflTeamRawData[opponent]['opponent'][oppCounter];
                                if(opponent2 != "BYE"){
                                    if(opponent2 != nflTeam) {
                                        qbSum += nflTeamRawData[opponent2]['points'][oppCounter]['qbPoints'];
                                        rbSum += nflTeamRawData[opponent2]['points'][oppCounter]['rbPoints'];
                                        wrSum += nflTeamRawData[opponent2]['points'][oppCounter]['wrPoints'];
                                        teSum += nflTeamRawData[opponent2]['points'][oppCounter]['tePoints'];
                                        kSum += nflTeamRawData[opponent2]['points'][oppCounter]['kPoints'];
                                        dstSum += nflTeamRawData[opponent2]['points'][oppCounter]['dstPoints'];
                                        denominator += 1;
                                    }
                                    oppWeekCount += 1;
                                }
                                oppCounter += 1;
                            }

                            tempData['qbPoints'] += nflTeamRawData[opponent]['points'][counter]['qbPoints'] - (qbSum/denominator);
                            tempData['rbPoints'] += nflTeamRawData[opponent]['points'][counter]['rbPoints'] - (rbSum/denominator);
                            tempData['wrPoints'] += nflTeamRawData[opponent]['points'][counter]['wrPoints'] - (wrSum/denominator);
                            tempData['tePoints'] += nflTeamRawData[opponent]['points'][counter]['tePoints'] - (teSum/denominator);
                            tempData['kPoints'] += nflTeamRawData[opponent]['points'][counter]['kPoints'] - (kSum/denominator);
                            tempData['dstPoints'] += nflTeamRawData[opponent]['points'][counter]['dstPoints'] - (dstSum/denominator);
                            weekCount += 1;
                        }
                        counter += 1;
                    }

                    // Reset to get average
                    tempData['qbPoints'] = tempData['qbPoints'] / weeks;
                    tempData['rbPoints'] = tempData['rbPoints'] / weeks;
                    tempData['wrPoints'] = tempData['wrPoints'] / weeks;
                    tempData['tePoints'] = tempData['tePoints'] / weeks;
                    tempData['kPoints'] = tempData['kPoints'] / weeks;
                    tempData['dstPoints'] = tempData['dstPoints'] / weeks;

                    // Sum
                    tempData['totalPoints'] = tempData['qbPoints'] + tempData['rbPoints'] + tempData['wrPoints'] + tempData['tePoints'] + tempData['kPoints'] + tempData['dstPoints'];

                    // Round
                    tempData['totalPoints'] = Math.round(tempData['totalPoints'] * 100)/100;
                    tempData['qbPoints'] = Math.round(tempData['qbPoints'] * 100)/100;
                    tempData['rbPoints'] = Math.round(tempData['rbPoints'] * 100)/100;
                    tempData['wrPoints'] = Math.round(tempData['wrPoints'] * 100)/100;
                    tempData['tePoints'] = Math.round(tempData['tePoints'] * 100)/100;
                    tempData['kPoints'] = Math.round(tempData['kPoints'] * 100)/100;
                    tempData['dstPoints'] = Math.round(tempData['dstPoints'] * 100)/100;

                    // Check min/max
                    if(tempData['totalPoints'] > totalMax) totalMax = tempData['totalPoints'];
                    if(tempData['totalPoints'] < totalMin) totalMin = tempData['totalPoints'];
                    if(tempData['qbPoints'] > qbMax) qbMax = tempData['qbPoints'];
                    if(tempData['qbPoints'] < qbMin) qbMin = tempData['qbPoints'];
                    if(tempData['rbPoints'] > rbMax) rbMax = tempData['rbPoints'];
                    if(tempData['rbPoints'] < rbMin) rbMin = tempData['rbPoints'];
                    if(tempData['wrPoints'] > wrMax) wrMax = tempData['wrPoints'];
                    if(tempData['wrPoints'] < wrMin) wrMin = tempData['wrPoints'];
                    if(tempData['tePoints'] > teMax) teMax = tempData['tePoints'];
                    if(tempData['tePoints'] < teMin) teMin = tempData['tePoints'];
                    if(tempData['kPoints'] > kMax) kMax = tempData['kPoints'];
                    if(tempData['kPoints'] < kMin) kMin = tempData['kPoints'];
                    if(tempData['dstPoints'] > dstMax) dstMax = tempData['dstPoints'];
                    if(tempData['dstPoints'] < dstMin) dstMin = tempData['dstPoints'];

                    // Set in storage
                    team['tableData'] = tempData;
                }

                // Sort (low to high)
                tableData.sort(function(a,b) {
                    return a['tableData']['totalPoints'] - b['tableData']['totalPoints']
                });

                // Add table header

                // Get the table HEADER element and empty the data
                var tableHeader = document.getElementById("tableHead");
                while(tableHeader != null && tableHeader.hasChildNodes()) {
                    tableHeader.removeChild(tableHeader.firstChild);
                }

                // Fill in the table HEADER
                var tr = tableHeader.insertRow(-1);  
                var th = document.createElement("TH");
                th.innerHTML = "Team";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Total Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "QB Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "RB Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "WR Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "TE Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "K Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "DST Points";
                tr.appendChild(th);

                // Add the table body
                
                // Get the table BODY element and empty the data
                var tableBody = document.getElementById("tableBody");
                while(tableBody != null && tableBody.hasChildNodes()) {
                    tableBody.removeChild(tableBody.firstChild);
                }

                // Fill in the table BODY
                var middle;
                var value;
                for(var index in tableData) {
                    var tr = tableBody.insertRow(-1);  
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['team'];
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['totalPoints'];
                    middle = (totalMax + totalMin)/2;
                    value = tableData[index]['tableData']['totalPoints']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - totalMin)/(middle - totalMin)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((totalMax - value)/(totalMax - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['qbPoints'];
                    middle = (qbMax + qbMin)/2;
                    value = tableData[index]['tableData']['qbPoints']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - qbMin)/(middle - qbMin)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((qbMax - value)/(qbMax - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['rbPoints'];
                    middle = (rbMax + rbMin)/2;
                    value = tableData[index]['tableData']['rbPoints']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - rbMin)/(middle - rbMin)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((rbMax - value)/(rbMax - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['wrPoints'];
                    middle = (wrMax + wrMin)/2;
                    value = tableData[index]['tableData']['wrPoints']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - wrMin)/(middle - wrMin)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((wrMax - value)/(wrMax - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['tePoints'];
                    middle = (teMax + teMin)/2;
                    value = tableData[index]['tableData']['tePoints']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - teMin)/(middle - teMin)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((teMax - value)/(teMax - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['kPoints'];
                    middle = (kMax + kMin)/2;
                    value = tableData[index]['tableData']['kPoints']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - kMin)/(middle - kMin)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((kMax - value)/(kMax - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['dstPoints'];
                    middle = (dstMax + dstMin)/2;
                    value = tableData[index]['tableData']['dstPoints']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - dstMin)/(middle - dstMin)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((dstMax - value)/(dstMax - middle)*255) + ", 0, 0.5)"; 
                }
                
                var entireTable = document.getElementById("tableEntire");
                sorttable.makeSortable(entireTable);

            }

        } else {

            // Load data based on full or relative stats
            if (rawStats) {

                // Initialize column min/max
                var minYards = 10000.0;
                var maxYards = -10000.0;
                var minRushYards = 10000.0;
                var maxRushYards = -10000.0;
                var minRecYards = 10000.0;
                var maxRecYards = -10000.0;
                var minTDs = 10000.0;
                var maxTDs = -10000.0;
                var minRushTDs = 10000.0;
                var maxRushTDs = -10000.0;
                var minRecTDs = 10000.0;
                var maxRecTDs = -10000.0;

                // Load data
                for(var index in tableData) {

                    var team = tableData[index];

                    var nflTeam = team['team'];
                    var tempData = {
                        'yards': 0,
                        'rushYards': 0,
                        'recYards': 0,
                        'tds': 0,
                        'rushTDs': 0,
                        'recTDs': 0                    };

                    var weekCount = 0;
                    var counter = 0;
                    while (weekCount < weeks){
                        var opponent = nflTeamRawData[nflTeam]['opponent'][counter];
                        if(opponent != "BYE"){
                            tempData['yards'] += nflTeamRawData[opponent]['points'][counter]['yards'];
                            tempData['rushYards'] += nflTeamRawData[opponent]['points'][counter]['rushingYards'];
                            tempData['recYards'] += nflTeamRawData[opponent]['points'][counter]['passingYards'];
                            tempData['tds'] += nflTeamRawData[opponent]['points'][counter]['tds'];
                            tempData['rushTDs'] += nflTeamRawData[opponent]['points'][counter]['rushingTDs'];
                            tempData['recTDs'] += nflTeamRawData[opponent]['points'][counter]['passingTDs'];
                            weekCount += 1;
                        }
                        counter += 1;
                    }

                    // Reset to get average
                    tempData['yards'] = tempData['yards'] / weeks;
                    tempData['rushYards'] = tempData['rushYards'] / weeks;
                    tempData['recYards'] = tempData['recYards'] / weeks;
                    tempData['tds'] = tempData['tds'] / weeks;
                    tempData['rushTDs'] = tempData['rushTDs'] / weeks;
                    tempData['recTDs'] = tempData['recTDs'] / weeks;

                    // Round
                    tempData['yards'] = Math.round(tempData['yards'] * 100)/100;
                    tempData['rushYards'] = Math.round(tempData['rushYards'] * 100)/100;
                    tempData['recYards'] = Math.round(tempData['recYards'] * 100)/100;
                    tempData['tds'] = Math.round(tempData['tds'] * 100)/100;
                    tempData['rushTDs'] = Math.round(tempData['rushTDs'] * 100)/100;
                    tempData['recTDs'] = Math.round(tempData['recTDs'] * 100)/100;

                    // Check min/max
                    if(tempData['yards'] > maxYards) maxYards = tempData['yards'];
                    if(tempData['yards'] < minYards) minYards = tempData['yards'];
                    if(tempData['rushYards'] > maxRushYards) maxRushYards = tempData['rushYards'];
                    if(tempData['rushYards'] < minRushYards) minRushYards = tempData['rushYards'];
                    if(tempData['recYards'] > maxRecYards) maxRecYards = tempData['recYards'];
                    if(tempData['recYards'] < minRecYards) minRecYards = tempData['recYards'];
                    if(tempData['tds'] > maxTDs) maxTDs = tempData['tds'];
                    if(tempData['tds'] < minTDs) minTDs = tempData['tds'];
                    if(tempData['rushTDs'] > maxRushTDs) maxRushTDs = tempData['rushTDs'];
                    if(tempData['rushTDs'] < minRushTDs) minRushTDs = tempData['rushTDs'];
                    if(tempData['recTDs'] > maxRecTDs) maxRecTDs = tempData['recTDs'];
                    if(tempData['recTDs'] < minRecTDs) minRecTDs = tempData['recTDs'];

                    // Set in storage
                    team['tableData'] = tempData;
                }

                // Sort (low to high)
                tableData.sort(function(a,b) {
                    return a['tableData']['yards'] - b['tableData']['yards']
                });

                // Add table header

                // Get the table HEADER element and empty the data
                var tableHeader = document.getElementById("tableHead");
                while(tableHeader != null && tableHeader.hasChildNodes()) {
                    tableHeader.removeChild(tableHeader.firstChild);
                }

                // Fill in the table HEADER
                var tr = tableHeader.insertRow(-1);  
                var th = document.createElement("TH");
                th.innerHTML = "Team";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Total Yards";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rush Yards";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rec. Yards";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Touchdowns";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rush TDs";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rec. TDs";
                tr.appendChild(th);

                // Add the table body
                
                // Get the table BODY element and empty the data
                var tableBody = document.getElementById("tableBody");
                while(tableBody != null && tableBody.hasChildNodes()) {
                    tableBody.removeChild(tableBody.firstChild);
                }

                // Fill in the table BODY
                var middle;
                var value;
                for(var index in tableData) {
                    var tr = tableBody.insertRow(-1);  
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['team'];
                                        
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['yards'];
                    middle = (maxYards + minYards)/2;
                    value = tableData[index]['tableData']['yards']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - minYards)/(middle - minYards)*255)  + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxYards - value)/(maxYards - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['rushYards'];
                    middle = (maxRushYards + minRushYards)/2;
                    value = tableData[index]['tableData']['rushYards']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - minRushYards)/(middle - minRushYards)*255)  + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxRushYards - value)/(maxRushYards - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['recYards'];
                    middle = (maxRecYards + minRecYards)/2;
                    value = tableData[index]['tableData']['recYards']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - minRecYards)/(middle - minRecYards)*255)  + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxRecYards - value)/(maxRecYards - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['tds'];
                    middle = (maxTDs + minTDs)/2;
                    value = tableData[index]['tableData']['tds']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - minTDs)/(middle - minTDs)*255)  + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxTDs - value)/(maxTDs - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['rushTDs'];
                    middle = (maxRushTDs + minRushTDs)/2;
                    value = tableData[index]['tableData']['rushTDs']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - minRushTDs)/(middle - minRushTDs)*255)  + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxRushTDs - value)/(maxRushTDs - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['recTDs'];
                    middle = (maxRecTDs + minRecTDs)/2;
                    value = tableData[index]['tableData']['recTDs']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - minRecTDs)/(middle - minRecTDs)*255)  + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxRecTDs - value)/(maxRecTDs - middle)*255) + ", 0, 0.5)"; 
                }
                
                var entireTable = document.getElementById("tableEntire");
                sorttable.makeSortable(entireTable);

            } else {

                // Initialize column min/max
                var minYards = 10000.0;
                var maxYards = -10000.0;
                var minRushYards = 10000.0;
                var maxRushYards = -10000.0;
                var minRecYards = 10000.0;
                var maxRecYards = -10000.0;
                var minTDs = 10000.0;
                var maxTDs = -10000.0;
                var minRushTDs = 10000.0;
                var maxRushTDs = -10000.0;
                var minRecTDs = 10000.0;
                var maxRecTDs = -10000.0;

                // Load data
                for(var index in tableData) {

                    var team = tableData[index];

                    var nflTeam = team['team'];
                    var tempData = {
                        'yards': 0,
                        'rushYards': 0,
                        'recYards': 0,
                        'tds': 0,
                        'rushTDs': 0,
                        'recTDs': 0                    
                    };

                    var weekCount = 0;
                    var counter = 0;
                    while (weekCount < weeks){
                        var opponent = nflTeamRawData[nflTeam]['opponent'][counter];
                        if(opponent != "BYE"){

                            var oppWeekCount = 0;
                            var oppCounter = 0;
                            var denominator = 0;
                            var yardSum = 0;
                            var rushYardSum = 0;
                            var recYardSum = 0;
                            var tdSum = 0;
                            var rushTDSum = 0;
                            var recTDSum = 0;
                            while (oppWeekCount < weeks){
                                var opponent2 = nflTeamRawData[opponent]['opponent'][oppCounter]
                                if(opponent2 != "BYE"){
                                    if(opponent2 != nflTeam) {
                                        yardSum += nflTeamRawData[opponent2]['points'][oppCounter]['yards'];
                                        rushYardSum += nflTeamRawData[opponent2]['points'][oppCounter]['rushingYards'];
                                        recYardSum += nflTeamRawData[opponent2]['points'][oppCounter]['passingYards'];
                                        tdSum += nflTeamRawData[opponent2]['points'][oppCounter]['tds'];
                                        rushTDSum += nflTeamRawData[opponent2]['points'][oppCounter]['rushingTDs'];
                                        recTDSum += nflTeamRawData[opponent2]['points'][oppCounter]['passingTDs'];
                                        denominator += 1;
                                    }
                                    oppWeekCount += 1;
                                }
                                oppCounter += 1;
                            }

                            tempData['yards'] += nflTeamRawData[opponent]['points'][counter]['yards'] - (yardSum/denominator);
                            tempData['rushYards'] += nflTeamRawData[opponent]['points'][counter]['rushingYards'] - (rushYardSum/denominator);
                            tempData['recYards'] += nflTeamRawData[opponent]['points'][counter]['passingYards'] - (recYardSum/denominator);
                            tempData['tds'] += nflTeamRawData[opponent]['points'][counter]['tds'] - (tdSum/denominator);
                            tempData['rushTDs'] += nflTeamRawData[opponent]['points'][counter]['rushingTDs'] - (rushTDSum/denominator);
                            tempData['recTDs'] += nflTeamRawData[opponent]['points'][counter]['passingTDs'] - (recTDSum/denominator);
                            weekCount += 1;
                        }
                        counter += 1;
                    }

                    // Reset to get average
                    tempData['yards'] = tempData['yards'] / weeks;
                    tempData['rushYards'] = tempData['rushYards'] / weeks;
                    tempData['recYards'] = tempData['recYards'] / weeks;
                    tempData['tds'] = tempData['tds'] / weeks;
                    tempData['rushTDs'] = tempData['rushTDs'] / weeks;
                    tempData['recTDs'] = tempData['recTDs'] / weeks;

                    // Round
                    tempData['yards'] = Math.round(tempData['yards'] * 100)/100;
                    tempData['rushYards'] = Math.round(tempData['rushYards'] * 100)/100;
                    tempData['recYards'] = Math.round(tempData['recYards'] * 100)/100;
                    tempData['tds'] = Math.round(tempData['tds'] * 100)/100;
                    tempData['rushTDs'] = Math.round(tempData['rushTDs'] * 100)/100;
                    tempData['recTDs'] = Math.round(tempData['recTDs'] * 100)/100;

                    // Check min/max
                    if(tempData['yards'] > maxYards) maxYards = tempData['yards'];
                    if(tempData['yards'] < minYards) minYards = tempData['yards'];
                    if(tempData['rushYards'] > maxRushYards) maxRushYards = tempData['rushYards'];
                    if(tempData['rushYards'] < minRushYards) minRushYards = tempData['rushYards'];
                    if(tempData['recYards'] > maxRecYards) maxRecYards = tempData['recYards'];
                    if(tempData['recYards'] < minRecYards) minRecYards = tempData['recYards'];
                    if(tempData['tds'] > maxTDs) maxTDs = tempData['tds'];
                    if(tempData['tds'] < minTDs) minTDs = tempData['tds'];
                    if(tempData['rushTDs'] > maxRushTDs) maxRushTDs = tempData['rushTDs'];
                    if(tempData['rushTDs'] < minRushTDs) minRushTDs = tempData['rushTDs'];
                    if(tempData['recTDs'] > maxRecTDs) maxRecTDs = tempData['recTDs'];
                    if(tempData['recTDs'] < minRecTDs) minRecTDs = tempData['recTDs'];

                    // Set in storage
                    team['tableData'] = tempData;
                }

                // Sort (low to high)
                tableData.sort(function(a,b) {
                    return a['tableData']['yards'] - b['tableData']['yards']
                });

                // Add table header

                // Get the table HEADER element and empty the data
                var tableHeader = document.getElementById("tableHead");
                while(tableHeader != null && tableHeader.hasChildNodes()) {
                    tableHeader.removeChild(tableHeader.firstChild);
                }

                // Fill in the table HEADER
                var tr = tableHeader.insertRow(-1);  
                var th = document.createElement("TH");
                th.innerHTML = "Team";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Total Yards";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rush Yards";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rec. Yards";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Touchdowns";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rush TDs";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Rec. TDs";
                tr.appendChild(th);

                // Add the table body
                
                // Get the table BODY element and empty the data
                var tableBody = document.getElementById("tableBody");
                while(tableBody != null && tableBody.hasChildNodes()) {
                    tableBody.removeChild(tableBody.firstChild);
                }

                // Fill in the table BODY
                var middle;
                var value;
                for(var index in tableData) {
                    var tr = tableBody.insertRow(-1);  
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['team'];
                                        
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['yards'];
                    middle = (maxYards + minYards)/2;
                    value = tableData[index]['tableData']['yards']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - minYards)/(middle - minYards)*255)  + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxYards - value)/(maxYards - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['rushYards'];
                    middle = (maxRushYards + minRushYards)/2;
                    value = tableData[index]['tableData']['rushYards']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - minRushYards)/(middle - minRushYards)*255)  + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxRushYards - value)/(maxRushYards - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['recYards'];
                    middle = (maxRecYards + minRecYards)/2;
                    value = tableData[index]['tableData']['recYards']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - minRecYards)/(middle - minRecYards)*255)  + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxRecYards - value)/(maxRecYards - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['tds'];
                    middle = (maxTDs + minTDs)/2;
                    value = tableData[index]['tableData']['tds']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - minTDs)/(middle - minTDs)*255)  + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxTDs - value)/(maxTDs - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['rushTDs'];
                    middle = (maxRushTDs + minRushTDs)/2;
                    value = tableData[index]['tableData']['rushTDs']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - minRushTDs)/(middle - minRushTDs)*255)  + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxRushTDs - value)/(maxRushTDs - middle)*255) + ", 0, 0.5)"; 
                    
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[index]['tableData']['recTDs'];
                    middle = (maxRecTDs + minRecTDs)/2;
                    value = tableData[index]['tableData']['recTDs']
                    if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - minRecTDs)/(middle - minRecTDs)*255)  + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxRecTDs - value)/(maxRecTDs - middle)*255) + ", 0, 0.5)"; 
                }
                
                var entireTable = document.getElementById("tableEntire");
                sorttable.makeSortable(entireTable);

            }

        }

    }
}


/* FUNCTION: flipOffDef
*
* Called whenver the offense/defense radio button is updated.
* Calls 'updateTable' at end to update all page items as appropriate
*
*/
function flipOffDef() {

    // Reset values
    offense = false;

    // Get buttons/pulldown
    var radio = document.getElementsByName('type-select');

    // Check value and update if necessary
    if (radio[0].checked) {
        offense = true;
    }

    // Update the data table
    updateTable()
}

/* FUNCTION: flipRawRelative
*
* Called whenver the raw stats/relative stats radio button is updated.
* Calls 'updateTable' at end to update all page items as appropriate
*
*/
function flipRawRelative() {

    // Reset values
    rawStats = false;

    // Get buttons/pulldown
    var radio = document.getElementsByName('relative-select');

    // Check value and update if necessary
    if (radio[0].checked) {
        rawStats = true;
    }

    // Update the data table
    updateTable()
}

/* FUNCTION: flipFantasyBasic
*
* Called whenver the fantasy/basic stats radio button is updated.
* Calls 'updateTable' at end to update all page items as appropriate
*
*/
function flipFantasyBasic() {

    // Reset values
    fantasyPoints = false;

    // Get buttons/pulldown
    var radio = document.getElementsByName('stats-select');

    // Check value and update if necessary
    if (radio[0].checked) {
        fantasyPoints = true;
    }

    // Update the data table
    updateTable()
}

/* FUNCTION: changeWeekCount
*
* Called whenver the weeks count pulldown is updated.
* Calls 'updateTable' at end to update all page items as appropriate
*
*/
function changeWeekCount() {

    // Check and update pulldown value
    var pulldown = document.getElementById("weeks");
    weeks = pulldown.value;

    // Update the data table
    updateTable()
}