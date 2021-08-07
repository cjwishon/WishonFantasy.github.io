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
var superlativeData;

// Color schemes
var gold = "#fad766"
var silver = "#dadada"
var bronze = "#e6bf99"


/* FUNCTION: loadSeasonStats
*
* Initialization function on page load
*
*/
function loadSuperlatives() {

    var radios = document.getElementsByName('season-select');

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            pageYear = radios[i].value;
            break;
        }
    }

    return firebase.database().ref('/superlativeData/' + pageYear.toString()).once('value').then((snapshot) => {
        superlativeData = snapshot.val();
        updatePage()
    });
}


/* FUNCTION: updatePage
*
* Updates all of the charts/tables/forms on the page.
* Called whenever the year/season radio button is updated (and on page load).
*
*/
function updatePage() {

    // Variables for use in each table
    var tableData = [];
    var tableBody;

    ////////////////////////////////////////////////////////
    // POINTS FOR, POINTS AGAINST, AND TD POINTS
    ////////////////////////////////////////////////////////

    // POINTS FOR

    // Clear Table
    tableBody = document.getElementById("pointsFor");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get Data
    tableData = [];
    for(var i = 0; i < superlativeData.length; i++) {
        tableData.push({
            'owner': superlativeData[i].owner,
            'value': superlativeData[i].pointsFor
        })
    }

    // Sort (high to low)
    tableData.sort(function(a,b) {
        return b.value - a.value
    });

    // Load into table
    for(var i = 0; i < tableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].owner;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].value;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
    }

    // POINTS AGAINST

    // Clear Table
    tableBody = document.getElementById("pointsAgainst");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get Data
    tableData = [];
    for(var i = 0; i < superlativeData.length; i++) {
        tableData.push({
            'owner': superlativeData[i].owner,
            'value': superlativeData[i].pointsAgainst
        })
    }

    // Sort (low to high)
    tableData.sort(function(a,b) {
        return a.value - b.value
    });

    // Load into table
    for(var i = 0; i < tableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].owner;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].value;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
    }

    // TD POINTS

    // Clear Table
    tableBody = document.getElementById("tdPoints");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get Data
    tableData = [];
    for(var i = 0; i < superlativeData.length; i++) {
        tableData.push({
            'owner': superlativeData[i].owner,
            'value': superlativeData[i].tdPoints
        })
    }

    // Sort (high to low)
    tableData.sort(function(a,b) {
        return b.value - a.value
    });

    // Load into table
    for(var i = 0; i < tableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].owner;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].value;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
    }



    ////////////////////////////////////////////////////////
    // YARD POINTS, KDST POINTS, AND NEGATIVE POINTS
    ////////////////////////////////////////////////////////

    // YARD POINTS

    // Clear Table
    tableBody = document.getElementById("yardPoints");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get Data
    tableData = [];
    for(var i = 0; i < superlativeData.length; i++) {
        tableData.push({
            'owner': superlativeData[i].owner,
            'value': Math.round(superlativeData[i].yardPoints*100)/100
        })
    }

    // Sort (high to low)
    tableData.sort(function(a,b) {
        return b.value - a.value
    });

    // Load into table
    for(var i = 0; i < tableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].owner;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].value;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
    }

    // KDST POINTS

    // Clear Table
    tableBody = document.getElementById("dstkPoints");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get Data
    tableData = [];
    for(var i = 0; i < superlativeData.length; i++) {
        tableData.push({
            'owner': superlativeData[i].owner,
            'value': superlativeData[i].dstKPoints
        })
    }

    // Sort (high to low)
    tableData.sort(function(a,b) {
        return b.value - a.value
    });

    // Load into table
    for(var i = 0; i < tableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].owner;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].value;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
    }

    // NEGATIVE POINTS

    // Clear Table
    tableBody = document.getElementById("negativePoints");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get Data
    tableData = [];
    for(var i = 0; i < superlativeData.length; i++) {
        tableData.push({
            'owner': superlativeData[i].owner,
            'value': superlativeData[i].negativePoints
        })
    }

     // Sort (high to low)
     tableData.sort(function(a,b) {
        return b.value - a.value
    });

    // Load into table
    for(var i = 0; i < tableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].owner;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].value;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
    }



    ////////////////////////////////////////////////////////
    // ADD/DROPS, ROSTER MOVES, AND BEST BALL
    ////////////////////////////////////////////////////////

    // ADD/DROPS

    // Clear Table
    tableBody = document.getElementById("addDrops");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get Data
    tableData = [];
    for(var i = 0; i < superlativeData.length; i++) {
        tableData.push({
            'owner': superlativeData[i].owner,
            'value': superlativeData[i].addDrops
        })
    }

    // Sort (high to low)
    tableData.sort(function(a,b) {
        return b.value - a.value
    });

    // Load into table
    for(var i = 0; i < tableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].owner;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].value;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
    }

    // ROSTER MOVES

    // Clear Table
    tableBody = document.getElementById("rosterMoves");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get Data
    tableData = [];
    for(var i = 0; i < superlativeData.length; i++) {
        tableData.push({
            'owner': superlativeData[i].owner,
            'value': superlativeData[i].rosterMoves
        })
    }

    // Sort (high to low)
    tableData.sort(function(a,b) {
        return b.value - a.value
    });

    // Load into table
    for(var i = 0; i < tableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].owner;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].value;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
    }

    // BEST BALL

    // Clear Table
    tableBody = document.getElementById("bestBallPoints");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get Data
    tableData = [];
    for(var i = 0; i < superlativeData.length; i++) {
        tableData.push({
            'owner': superlativeData[i].owner,
            'value': Math.round(superlativeData[i].bestBallPoints*100)/100
        })
    }

     // Sort (high to low)
     tableData.sort(function(a,b) {
        return b.value - a.value
    });

    // Load into table
    for(var i = 0; i < tableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].owner;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].value;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
    }



    ////////////////////////////////////////////////////////
    // DRAFTED PLAYERS ON ROSTER, ABOVE AVE OPP, MISSED WEEKS
    ////////////////////////////////////////////////////////

    // DRAFTED PLAYERS ON ROSTER

    // Clear Table
    tableBody = document.getElementById("draftOnRoster");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get Data
    tableData = [];
    for(var i = 0; i < superlativeData.length; i++) {
        tableData.push({
            'owner': superlativeData[i].owner,
            'value': superlativeData[i].draftedPlayersStillOnRoster
        })
    }

    // Sort (high to low)
    tableData.sort(function(a,b) {
        return b.value - a.value
    });

    // Load into table
    for(var i = 0; i < tableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].owner;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].value;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
    }

    // ABOVE AVE OPP

    // Clear Table
    tableBody = document.getElementById("aboveAveOpponents");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get Data
    tableData = [];
    for(var i = 0; i < superlativeData.length; i++) {
        tableData.push({
            'owner': superlativeData[i].owner,
            'value': superlativeData[i].opponentAboveAverageWeeks
        })
    }

    // Sort (low to high)
    tableData.sort(function(a,b) {
        return a.value - b.value
    });

    // Load into table
    for(var i = 0; i < tableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].owner;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].value;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
    }

    // MISSED WEEKS

    // Clear Table
    tableBody = document.getElementById("missedWeeks");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get Data
    tableData = [];
    for(var i = 0; i < superlativeData.length; i++) {
        tableData.push({
            'owner': superlativeData[i].owner,
            'value': superlativeData[i].missedWeeks
        })
    }

     // Sort (low to high)
    tableData.sort(function(a,b) {
        return a.value - b.value
    });

    // Load into table
    for(var i = 0; i < tableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].owner;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].value;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
    }



    ////////////////////////////////////////////////////////
    // POINTS FROM DRAFTED PLAYERS AND WAIVER WIRE POINTS
    ////////////////////////////////////////////////////////

    // POINTS FROM DRAFTED PLAYERS

    // Clear Table
    tableBody = document.getElementById("draftedPoints");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get Data
    tableData = [];
    for(var i = 0; i < superlativeData.length; i++) {
        tableData.push({
            'owner': superlativeData[i].owner,
            'value': Math.round(superlativeData[i].draftedPoints*100)/100
        })
    }

    // Sort (high to low)
    tableData.sort(function(a,b) {
        return b.value - a.value
    });

    // Load into table
    for(var i = 0; i < tableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].owner;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].value;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
    }

    // WAIVER WIRE POINTS

    // Clear Table
    tableBody = document.getElementById("waiverWirePoints");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Get Data
    tableData = [];
    for(var i = 0; i < superlativeData.length; i++) {
        tableData.push({
            'owner': superlativeData[i].owner,
            'value': Math.round(superlativeData[i].waiverWirePoints*100)/100
        })
    }

    // Sort (high to low)
    tableData.sort(function(a,b) {
        return b.value - a.value
    });

    // Load into table
    for(var i = 0; i < tableData.length; i++) {
        var tr = tableBody.insertRow(-1);  
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].owner;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
        tabCell = tr.insertCell(-1);
        tabCell.innerHTML = tableData[i].value;
        if(i == 0) tabCell.style.backgroundColor = gold;
        if(i == 1) tabCell.style.backgroundColor = silver;
        if(i == 2) tabCell.style.backgroundColor = bronze;
    }


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
            loadSuperlatives();
            break;
        }
    }
}