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
var nflPlayerRawData;
var tableData;
var weeks;
var average;
var weeksRequired;
var position;
var statType;

/* FUNCTION: loadNFLPlayerData
*
* Initialization function on page load
*
*/
function loadNFLPlayerData() {

    // Get data from pulldowns
    var pulldown = document.getElementById("weeks");
    weeks = pulldown.value;
    pulldown = document.getElementById("weeksRequired");
    weeksRequired = pulldown.value;
    pulldown = document.getElementById("positions");
    position = pulldown.value;

    // Get data from radio buttons
    average = false;
    var radio = document.getElementsByName('total-select');
    if (radio[0].checked) {
        average = true;
    }

    // Initialize Stat Type
    statType = "Passing";
    
    
    
    



    // Get data from firebase and update the table
    return firebase.database().ref('/nflPlayerData').once('value').then((snapshot) => {
        nflPlayerRawData = snapshot.val();

        // Add fantasy team to the data and round fantasy points
        for(var i in nflPlayerRawData['players']) {
            nflPlayerRawData['players'][i]['fantasyOwner'] = "";
            for(var j = 0; j < nflPlayerRawData['players'][i]['Points'].length; j++){
                nflPlayerRawData['players'][i]['Points'][j]['FantasyPoints'] = Math.round(nflPlayerRawData['players'][i]['Points'][j]['FantasyPoints']*100)/100;
            }
        }

        var espnData = fetch('https://fantasy.espn.com/apis/v3/games/ffl/seasons/' + nflPlayerRawData['fantasyYear'] + '/segments/0/leagues/' + 1774020 + '?view=mRoster&view=mTeam').then(response => response.json());
        espnData = MakeQuerablePromise(espnData)
        
        espnData.then(data => {
            for(var i = 0; i < data['teams'].length; i++){
                var name = "";
                for(var j = 0; j < data['members'].length; j++) {
                    if(data['members'][j]['id'] == data['teams'][i]["primaryOwner"]) {
                        name = data['members'][j]['firstName'].toUpperCase()[0] + ". " + data['members'][j]['lastName'].charAt(0).toUpperCase() + data['members'][j]['lastName'].slice(1);
                        break;
                    }
                }

                for(var j = 0; j < data['teams'][i]['roster']['entries'].length; j++){
                    if(data['teams'][i]['roster']['entries'][j]['playerId'] in nflPlayerRawData['players']) nflPlayerRawData['players'][data['teams'][i]['roster']['entries'][j]['playerId']]['fantasyOwner'] = name;
                }

            }
            updateDataTable()
        });
        
    });

}


function MakeQuerablePromise(promise) {
    // Don't modify any promise that has been already modified.
    if (promise.isResolved) return promise;

    // Set initial state
    var isPending = true;
    var isRejected = false;
    var isFulfilled = false;

    // Observe the promise, saving the fulfillment in a closure scope.
    var result = promise.then(
        function(v) {
            isFulfilled = true;
            isPending = false;
            return v; 
        }, 
        function(e) {
            isRejected = true;
            isPending = false;
            throw e; 
        }
    );

    result.isFulfilled = function() { return isFulfilled; };
    result.isPending = function() { return isPending; };
    result.isRejected = function() { return isRejected; };
    return result;
}

/* FUNCTION: updateTable
*
* Updates the table on the page.
* Called whenever the radio button/pulldown is updated (and on page load).
*
*/
function updateDataTable() {
    
    // Reset data
    tableData = []

    // Load data into table
    if (position == "QB" || position == "SUPERFLEX"){
        for(var i in nflPlayerRawData['players']){
            var player = nflPlayerRawData['players'][i]
            if(player['Position'] == "QB"){
                var GamesPlayed = 0;
                var FantasyPoints = 0;
                var PassAttemptsTotal = 0;
                var PassAttemptsInside10 = 0;
                var Completions = 0;
                var PassYards = 0;
                var PassTDs = 0;
                var CarriesTotal = 0;
                var CarriesInside10 = 0;
                var RushYards = 0;
                var RushTDs = 0;
                var great = 0;
                var good = 0;
                var bust = 0;
                for(var j = 0; j < weeks; j++) {
                    if(player['Points'][j]['GamePlayed']) {
                        GamesPlayed += 1;
                        FantasyPoints += player['Points'][j]['FantasyPoints'];
                        PassAttemptsTotal += player['Points'][j]['PassAttemptsTotal'];
                        PassAttemptsInside10 += player['Points'][j]['PassAttemptsInside10'];
                        Completions += player['Points'][j]['Completions'];
                        PassYards += player['Points'][j]['PassYards'];
                        PassTDs += player['Points'][j]['PassTDs'];
                        CarriesTotal += player['Points'][j]['CarriesTotal'];
                        CarriesInside10 += player['Points'][j]['CarriesInside10'];
                        RushYards += player['Points'][j]['RushYards'];
                        RushTDs += player['Points'][j]['RushTDs'];
                        if(player['Points'][j]['FantasyPoints'] > 26.999999) great += 1
                        if(player['Points'][j]['FantasyPoints'] > 20.999999) good += 1
                        if(player['Points'][j]['FantasyPoints'] <= 14.999999) bust += 1
                    }
                }
                if(GamesPlayed > 0){
                    tableData.push({
                        "Name": player['Name'],
                        "NFLTeam": player['NFLTeam'],
                        "FantasyOwner": player['fantasyOwner'],
                        "GamesPlayed": GamesPlayed,
                        "FantasyPoints": FantasyPoints, 
                        "PPG": FantasyPoints/GamesPlayed, 
                        "PassAttemptsTotal": PassAttemptsTotal, 
                        "PassAttemptsInside10": PassAttemptsInside10, 
                        "Completions": Completions, 
                        "PassYards": PassYards, 
                        "PassTDs": PassTDs, 
                        "CarriesTotal": CarriesTotal, 
                        "CarriesInside10": CarriesInside10, 
                        "RushYards": RushYards,
                        "RushTDs": RushTDs,
                        "Great": Math.round(great/GamesPlayed*1000)/10,
                        "Good": Math.round(good/GamesPlayed*1000)/10,
                        "Bust": Math.round(bust/GamesPlayed*1000)/10
                    })
                }
            }
        }
    }
    if (position == "RB" || position == "FLEX" || position == "SUPERFLEX"){
        for(var i in nflPlayerRawData['players']){
            var player = nflPlayerRawData['players'][i]
            if(player['Position'] == "RB"){
                var GamesPlayed = 0;
                var FantasyPoints = 0;
                var TargetsTotal = 0;
                var TargetsInside10 = 0;
                var Catches = 0;
                var RecYards = 0;
                var RecTDs = 0;
                var CarriesTotal = 0;
                var CarriesInside10 = 0;
                var RushYards = 0;
                var RushTDs = 0;
                var great = 0;
                var good = 0;
                var bust = 0;
                for(var j = 0; j < weeks; j++) {
                    if(player['Points'][j]['GamePlayed']) {
                        GamesPlayed += 1;
                        FantasyPoints += player['Points'][j]['FantasyPoints'];
                        TargetsTotal += player['Points'][j]['TargetsTotal'];
                        TargetsInside10 += player['Points'][j]['TargetsInside10'];
                        Catches += player['Points'][j]['Catches'];
                        RecYards += player['Points'][j]['RecYards'];
                        RecTDs += player['Points'][j]['RecTDs'];
                        CarriesTotal += player['Points'][j]['CarriesTotal'];
                        CarriesInside10 += player['Points'][j]['CarriesInside10'];
                        RushYards += player['Points'][j]['RushYards'];
                        RushTDs += player['Points'][j]['RushTDs'];
                        if(player['Points'][j]['FantasyPoints'] > 20.999999) great += 1
                        if(player['Points'][j]['FantasyPoints'] > 10.999999) good += 1
                        if(player['Points'][j]['FantasyPoints'] <= 6.999999) bust += 1
                    }
                }
                if(GamesPlayed > 0){
                    tableData.push({
                        "Name": player['Name'],
                        "NFLTeam": player['NFLTeam'],
                        "FantasyOwner": player['fantasyOwner'],
                        "GamesPlayed": GamesPlayed,
                        "FantasyPoints": FantasyPoints, 
                        "PPG": FantasyPoints/GamesPlayed, 
                        "TargetsTotal": TargetsTotal, 
                        "TargetsInside10": TargetsInside10, 
                        "Catches": Catches, 
                        "RecYards": RecYards, 
                        "RecTDs": RecTDs, 
                        "CarriesTotal": CarriesTotal, 
                        "CarriesInside10": CarriesInside10, 
                        "RushYards": RushYards,
                        "RushTDs": RushTDs,
                        "Great": Math.round(great/GamesPlayed*1000)/10,
                        "Good": Math.round(good/GamesPlayed*1000)/10,
                        "Bust": Math.round(bust/GamesPlayed*1000)/10
                    })
                }
            }
        }
    }
    if (position == "WR" || position == "FLEX" || position == "SUPERFLEX"){
        for(var i in nflPlayerRawData['players']){
            var player = nflPlayerRawData['players'][i]
            if(player['Position'] == "WR"){
                var GamesPlayed = 0;
                var FantasyPoints = 0;
                var TargetsTotal = 0;
                var TargetsInside10 = 0;
                var Catches = 0;
                var RecYards = 0;
                var RecTDs = 0;
                var CarriesTotal = 0;
                var CarriesInside10 = 0;
                var RushYards = 0;
                var RushTDs = 0;
                var great = 0;
                var good = 0;
                var bust = 0;
                for(var j = 0; j < weeks; j++) {
                    if(player['Points'][j]['GamePlayed']) {
                        GamesPlayed += 1;
                        FantasyPoints += player['Points'][j]['FantasyPoints'];
                        TargetsTotal += player['Points'][j]['TargetsTotal'];
                        TargetsInside10 += player['Points'][j]['TargetsInside10'];
                        Catches += player['Points'][j]['Catches'];
                        RecYards += player['Points'][j]['RecYards'];
                        RecTDs += player['Points'][j]['RecTDs'];
                        CarriesTotal += player['Points'][j]['CarriesTotal'];
                        CarriesInside10 += player['Points'][j]['CarriesInside10'];
                        RushYards += player['Points'][j]['RushYards'];
                        RushTDs += player['Points'][j]['RushTDs'];
                        if(player['Points'][j]['FantasyPoints'] > 19.999999) great += 1
                        if(player['Points'][j]['FantasyPoints'] > 11.999999) good += 1
                        if(player['Points'][j]['FantasyPoints'] <= 7.999999) bust += 1
                    }
                }
                if(GamesPlayed > 0){
                    tableData.push({
                        "Name": player['Name'],
                        "NFLTeam": player['NFLTeam'],
                        "FantasyOwner": player['fantasyOwner'],
                        "GamesPlayed": GamesPlayed,
                        "FantasyPoints": FantasyPoints, 
                        "PPG": FantasyPoints/GamesPlayed, 
                        "TargetsTotal": TargetsTotal, 
                        "TargetsInside10": TargetsInside10, 
                        "Catches": Catches, 
                        "RecYards": RecYards, 
                        "RecTDs": RecTDs, 
                        "CarriesTotal": CarriesTotal, 
                        "CarriesInside10": CarriesInside10, 
                        "RushYards": RushYards,
                        "RushTDs": RushTDs,
                        "Great": Math.round(great/GamesPlayed*1000)/10,
                        "Good": Math.round(good/GamesPlayed*1000)/10,
                        "Bust": Math.round(bust/GamesPlayed*1000)/10
                    })
                }
            }
        }
    }
    if (position == "TE" || position == "FLEX" || position == "SUPERFLEX"){
        for(var i in nflPlayerRawData['players']){
            var player = nflPlayerRawData['players'][i]
            if(player['Position'] == "TE"){
                var GamesPlayed = 0;
                var FantasyPoints = 0;
                var TargetsTotal = 0;
                var TargetsInside10 = 0;
                var Catches = 0;
                var RecYards = 0;
                var RecTDs = 0;
                var CarriesTotal = 0;
                var CarriesInside10 = 0;
                var RushYards = 0;
                var RushTDs = 0;
                var great = 0;
                var good = 0;
                var bust = 0;
                for(var j = 0; j < weeks; j++) {
                    if(player['Points'][j]['GamePlayed']) {
                        GamesPlayed += 1;
                        FantasyPoints += player['Points'][j]['FantasyPoints'];
                        TargetsTotal += player['Points'][j]['TargetsTotal'];
                        TargetsInside10 += player['Points'][j]['TargetsInside10'];
                        Catches += player['Points'][j]['Catches'];
                        RecYards += player['Points'][j]['RecYards'];
                        RecTDs += player['Points'][j]['RecTDs'];
                        CarriesTotal += player['Points'][j]['CarriesTotal'];
                        CarriesInside10 += player['Points'][j]['CarriesInside10'];
                        RushYards += player['Points'][j]['RushYards'];
                        RushTDs += player['Points'][j]['RushTDs'];
                        if(player['Points'][j]['FantasyPoints'] > 14.999999) great += 1
                        if(player['Points'][j]['FantasyPoints'] > 9.999999) good += 1
                        if(player['Points'][j]['FantasyPoints'] <= 6.999999) bust += 1
                    }
                }
                if(GamesPlayed > 0){
                    tableData.push({
                        "Name": player['Name'],
                        "NFLTeam": player['NFLTeam'],
                        "FantasyOwner": player['fantasyOwner'],
                        "GamesPlayed": GamesPlayed,
                        "FantasyPoints": FantasyPoints, 
                        "PPG": FantasyPoints/GamesPlayed, 
                        "TargetsTotal": TargetsTotal, 
                        "TargetsInside10": TargetsInside10, 
                        "Catches": Catches, 
                        "RecYards": RecYards, 
                        "RecTDs": RecTDs, 
                        "CarriesTotal": CarriesTotal, 
                        "CarriesInside10": CarriesInside10, 
                        "RushYards": RushYards,
                        "RushTDs": RushTDs,
                        "Great": Math.round(great/GamesPlayed*1000)/10,
                        "Good": Math.round(good/GamesPlayed*1000)/10,
                        "Bust": Math.round(bust/GamesPlayed*1000)/10
                    })
                }
            }
        }
    }
    if (position == "K"){
        for(var i in nflPlayerRawData['players']){
            var player = nflPlayerRawData['players'][i]
            if(player['Position'] == "K"){
                var GamesPlayed = 0;
                var FantasyPoints = 0;
                var FGsMade = 0;
                var FGsMissed = 0;
                var ExtraPoints = 0;
                var great = 0;
                var good = 0;
                var bust = 0;
                for(var j = 0; j < weeks; j++) {
                    if(player['Points'][j]['GamePlayed']) {
                        GamesPlayed += 1;
                        FantasyPoints += player['Points'][j]['FantasyPoints'];
                        FGsMade += player['Points'][j]['FGsMade'];
                        FGsMissed += player['Points'][j]['FGsMissed'];
                        ExtraPoints += player['Points'][j]['ExtraPoints'];
                        if(player['Points'][j]['FantasyPoints'] > 14.999999) great += 1
                        if(player['Points'][j]['FantasyPoints'] > 9.999999) good += 1
                        if(player['Points'][j]['FantasyPoints'] <= 4.999999) bust += 1
                    }
                }
                if(GamesPlayed > 0){
                    tableData.push({
                        "Name": player['Name'],
                        "NFLTeam": player['NFLTeam'],
                        "FantasyOwner": player['fantasyOwner'],
                        "GamesPlayed": GamesPlayed,
                        "FantasyPoints": FantasyPoints,
                        "PPG": FantasyPoints/GamesPlayed, 
                        "FGsMade": FGsMade,
                        "FGsMissed": FGsMissed,
                        "ExtraPoints": ExtraPoints,
                        "Great": Math.round(great/GamesPlayed*1000)/10,
                        "Good": Math.round(good/GamesPlayed*1000)/10,
                        "Bust": Math.round(bust/GamesPlayed*1000)/10
                    })
                }
            }
        }
    }
    if (position == "DST"){
        for(var i in nflPlayerRawData['players']){
            var player = nflPlayerRawData['players'][i]
            if(player['Position'] == "DST"){
                var GamesPlayed = 0;
                var FantasyPoints = 0;
                var TDs = 0;
                var Sacks = 0;
                var Ints = 0;
                var Fumbles = 0;
                var great = 0;
                var good = 0;
                var bust = 0;
                for(var j = 0; j < weeks; j++) {
                    if(player['Points'][j]['GamePlayed']) {
                        GamesPlayed += 1;
                        FantasyPoints += player['Points'][j]['FantasyPoints'];
                        TDs += player['Points'][j]['TDs'];
                        Sacks += player['Points'][j]['Sacks'];
                        Ints += player['Points'][j]['Ints'];
                        Fumbles += player['Points'][j]['Fumbles'];
                        if(player['Points'][j]['FantasyPoints'] > 11.999999) great += 1
                        if(player['Points'][j]['FantasyPoints'] > 7.999999) good += 1
                        if(player['Points'][j]['FantasyPoints'] <= 3.999999) bust += 1
                    }
                }
                if(GamesPlayed > 0){
                    tableData.push({
                        "Name": player['Name'],
                        "NFLTeam": player['NFLTeam'],
                        "FantasyOwner": player['fantasyOwner'],
                        "GamesPlayed": GamesPlayed,
                        "FantasyPoints": FantasyPoints,
                        "PPG": FantasyPoints/GamesPlayed, 
                        "TDs": TDs,
                        "Sacks": Sacks,
                        "Ints": Ints,
                        "Fumbles": Fumbles,
                        "Great": Math.round(great/GamesPlayed*1000)/10,
                        "Good": Math.round(good/GamesPlayed*1000)/10,
                        "Bust": Math.round(bust/GamesPlayed*1000)/10
                    })
                }
            }
        }
    }

    // Call to update table on page
    updateTable()

}


function updateTable() {
    console.log(tableData)

    // Sort (high to low) depending on what is being plotted
    if(average){
        tableData.sort(function(a,b) {
            return b['PPG'] - a['PPG']
        });
    } else {
        tableData.sort(function(a,b) {
            return b['FantasyPoints'] - a['FantasyPoints']
        });
    }
    

    // Get elements and clear
    var tableHeader = document.getElementById("tableHead");
    while(tableHeader != null && tableHeader.hasChildNodes()) {
        tableHeader.removeChild(tableHeader.firstChild);
    }

    var tableBody = document.getElementById("tableBody");
    while(tableBody != null && tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }


    if(position == "QB"){

        if(statType == "Passing") {

            // Fill in the table HEADER
            var tr = tableHeader.insertRow(-1);  
            var th = document.createElement("TH");
            th.innerHTML = "Name";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Team";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Fantasy Owner";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Games Played";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Fantasy Points";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Pass Attempts";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Pass Attempts\n(Inside 10)";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Completions";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Passing Yards";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Passing TDs";
            tr.appendChild(th);

            // Fill in table body
            if(average) {
                for(var i = 0; i < tableData.length; i++){
                    if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                        tr = tableBody.insertRow(-1);  
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Name'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['NFLTeam'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['FantasyOwner'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['GamesPlayed'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['PPG']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['PassAttemptsTotal']/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['PassAttemptsInside10']/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['Completions']/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['PassYards']/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['PassTDs']/tableData[i]['GamesPlayed']*100)/100;
                    }
                }
            } else {
                for(var i = 0; i < tableData.length; i++){
                    if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                        tr = tableBody.insertRow(-1);  
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Name'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['NFLTeam'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['FantasyOwner'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['GamesPlayed'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['FantasyPoints']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['PassAttemptsTotal'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['PassAttemptsInside10'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Completions'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['PassYards'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['PassTDs'];
                    }
                }
            }

        } else if (statType == "Rushing") {

            // Fill in the table HEADER
            var tr = tableHeader.insertRow(-1);  
            var th = document.createElement("TH");
            th.innerHTML = "Name";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Team";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Fantasy Owner";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Games Played";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Fantasy Points";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Carries";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Carries\n(Inside 10)";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Rushing Yards";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Rushing TDs";
            tr.appendChild(th);

            // Fill in table body
            if(average) {
                for(var i = 0; i < tableData.length; i++){
                    if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                        tr = tableBody.insertRow(-1);  
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Name'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['NFLTeam'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['FantasyOwner'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['GamesPlayed'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['PPG']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['CarriesTotal']/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['CarriesInside10']/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['RushYards']/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['RushTDs']/tableData[i]['GamesPlayed']*100)/100;
                    }
                }
            } else {
                for(var i = 0; i < tableData.length; i++){
                    if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                        tr = tableBody.insertRow(-1);  
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Name'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['NFLTeam'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['FantasyOwner'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['GamesPlayed'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['FantasyPoints']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['CarriesTotal'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['CarriesInside10'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['RushYards'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['RushTDs'];
                    }
                }
            }

        } else if (statType == "Total") {

            // Fill in the table HEADER
            var tr = tableHeader.insertRow(-1);  
            var th = document.createElement("TH");
            th.innerHTML = "Name";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Team";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Fantasy Owner";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Games Played";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Fantasy Points";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Yards";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Opportunities\nInside 10";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "TDs";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Great %";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Good %";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Bust %";
            tr.appendChild(th);

            // Find maximimum game ratings
            maxGreat = 0
            maxGood = 0
            maxBust = 0
            for(var i = 0; i < tableData.length; i++){
                if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                    if(tableData[i]['Great'] > maxGreat) maxGreat = tableData[i]['Great'];
                    if(tableData[i]['Good'] > maxGood) maxGood = tableData[i]['Good'];
                    if(tableData[i]['Bust'] > maxBust) maxBust = tableData[i]['Bust'];
                }
            }

            // Fill in table body
            if(average) {
                for(var i = 0; i < tableData.length; i++){
                    if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                        tr = tableBody.insertRow(-1);  
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Name'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['NFLTeam'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['FantasyOwner'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['GamesPlayed'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['PPG']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round((tableData[i]['PassYards']+tableData[i]['RushYards'])/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round((tableData[i]['PassAttemptsInside10']+tableData[i]['CarriesInside10'])/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round((tableData[i]['PassTDs']+tableData[i]['RushTDs'])/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Great']
                        if(tableData[i]['Great'] > maxGreat/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGreat - tableData[i]['Great'])/(maxGreat/2)*255) + ", 255, 0, 0.5)"; 
                        else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Great'] - 0)/(maxGreat/2)*255) + ", 0, 0.5)";
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Good']
                        if(tableData[i]['Good'] > maxGood/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGood - tableData[i]['Good'])/(maxGood/2)*255) + ", 255, 0, 0.5)"; 
                        else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Good'] - 0)/(maxGood/2)*255) + ", 0, 0.5)";
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Bust']
                        if(tableData[i]['Bust'] > maxBust/2) tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxBust - tableData[i]['Bust'])/(maxBust/2)*255) + ", 0, 0.5)"; 
                        else tabCell.style.backgroundColor = "rgba(" + Math.round((tableData[i]['Bust'] - 0)/(maxBust/2)*255) + ", 255, 0, 0.5)";
                    }
                }
            } else {
                for(var i = 0; i < tableData.length; i++){
                    if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                        tr = tableBody.insertRow(-1);  
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Name'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['NFLTeam'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['FantasyOwner'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['GamesPlayed'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['FantasyPoints']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['PassYards']+tableData[i]['RushYards'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['PassAttemptsInside10']+tableData[i]['CarriesInside10'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['PassTDs']+tableData[i]['RushTDs'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Great']
                        if(tableData[i]['Great'] > maxGreat/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGreat - tableData[i]['Great'])/(maxGreat/2)*255) + ", 255, 0, 0.5)"; 
                        else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Great'] - 0)/(maxGreat/2)*255) + ", 0, 0.5)";
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Good']
                        if(tableData[i]['Good'] > maxGood/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGood - tableData[i]['Good'])/(maxGood/2)*255) + ", 255, 0, 0.5)"; 
                        else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Good'] - 0)/(maxGood/2)*255) + ", 0, 0.5)";
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Bust']
                        if(tableData[i]['Bust'] > maxBust/2) tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxBust - tableData[i]['Bust'])/(maxBust/2)*255) + ", 0, 0.5)"; 
                        else tabCell.style.backgroundColor = "rgba(" + Math.round((tableData[i]['Bust'] - 0)/(maxBust/2)*255) + ", 255, 0, 0.5)";
                    }
                }
            }

        }

    } else if (position == "RB" || position == "WR" || position == "TE" || position == "FLEX"){

        if(statType == "Receiving") {

            // Fill in the table HEADER
            var tr = tableHeader.insertRow(-1);  
            var th = document.createElement("TH");
            th.innerHTML = "Name";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Team";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Fantasy Owner";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Games Played";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Fantasy Points";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Targets";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Targets\n(Inside 10)";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Catches";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Receiving Yards";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Receiving TDs";
            tr.appendChild(th);

            // Fill in table body
            if(average) {
                for(var i = 0; i < tableData.length; i++){
                    if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                        tr = tableBody.insertRow(-1);  
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Name'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['NFLTeam'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['FantasyOwner'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['GamesPlayed'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['PPG']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['TargetsTotal']/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['TargetsInside10']/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['Catches']/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['RecYards']/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['RecTDs']/tableData[i]['GamesPlayed']*100)/100;
                    }
                }
            } else {
                for(var i = 0; i < tableData.length; i++){
                    if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                        tr = tableBody.insertRow(-1);  
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Name'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['NFLTeam'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['FantasyOwner'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['GamesPlayed'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['FantasyPoints']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['TargetsTotal'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['TargetsInside10'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Catches'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['RecYards'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['RecTDs'];
                    }
                }
            }

        } else if (statType == "Rushing") {

            // Fill in the table HEADER
            var tr = tableHeader.insertRow(-1);  
            var th = document.createElement("TH");
            th.innerHTML = "Name";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Team";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Fantasy Owner";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Games Played";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Fantasy Points";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Carries";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Carries\n(Inside 10)";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Rushing Yards";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Rushing TDs";
            tr.appendChild(th);

            // Fill in table body
            if(average) {
                for(var i = 0; i < tableData.length; i++){
                    if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                        tr = tableBody.insertRow(-1);  
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Name'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['NFLTeam'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['FantasyOwner'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['GamesPlayed'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['PPG']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['CarriesTotal']/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['CarriesInside10']/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['RushYards']/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['RushTDs']/tableData[i]['GamesPlayed']*100)/100;
                    }
                }
            } else {
                for(var i = 0; i < tableData.length; i++){
                    if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                        tr = tableBody.insertRow(-1);  
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Name'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['NFLTeam'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['FantasyOwner'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['GamesPlayed'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['FantasyPoints']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['CarriesTotal'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['CarriesInside10'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['RushYards'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['RushTDs'];
                    }
                }
            }

        } else if (statType == "Total") {

            // Fill in the table HEADER
            var tr = tableHeader.insertRow(-1);  
            var th = document.createElement("TH");
            th.innerHTML = "Name";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Team";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Fantasy Owner";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Games Played";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Fantasy Points";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Yards";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Opportunities\nInside 10";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "TDs";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Great %";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Good %";
            tr.appendChild(th);
            th = document.createElement("TH");
            th.innerHTML = "Bust %";
            tr.appendChild(th);

            // Find maximimum game ratings
            maxGreat = 0
            maxGood = 0
            maxBust = 0
            for(var i = 0; i < tableData.length; i++){
                if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                    if(tableData[i]['Great'] > maxGreat) maxGreat = tableData[i]['Great'];
                    if(tableData[i]['Good'] > maxGood) maxGood = tableData[i]['Good'];
                    if(tableData[i]['Bust'] > maxBust) maxBust = tableData[i]['Bust'];
                }
            }


            // Fill in table body
            if(average) {
                for(var i = 0; i < tableData.length; i++){
                    if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                        tr = tableBody.insertRow(-1);  
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Name'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['NFLTeam'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['FantasyOwner'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['GamesPlayed'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['PPG']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round((tableData[i]['RecYards']+tableData[i]['RushYards'])/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round((tableData[i]['TargetsInside10']+tableData[i]['CarriesInside10'])/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round((tableData[i]['RecTDs']+tableData[i]['RushTDs'])/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Great']
                        if(tableData[i]['Great'] > maxGreat/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGreat - tableData[i]['Great'])/(maxGreat/2)*255) + ", 255, 0, 0.5)"; 
                        else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Great'] - 0)/(maxGreat/2)*255) + ", 0, 0.5)";
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Good']
                        if(tableData[i]['Good'] > maxGood/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGood - tableData[i]['Good'])/(maxGood/2)*255) + ", 255, 0, 0.5)"; 
                        else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Good'] - 0)/(maxGood/2)*255) + ", 0, 0.5)";
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Bust']
                        if(tableData[i]['Bust'] > maxBust/2) tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxBust - tableData[i]['Bust'])/(maxBust/2)*255) + ", 0, 0.5)"; 
                        else tabCell.style.backgroundColor = "rgba(" + Math.round((tableData[i]['Bust'] - 0)/(maxBust/2)*255) + ", 255, 0, 0.5)";
                    }
                }
            } else {
                for(var i = 0; i < tableData.length; i++){
                    if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                        tr = tableBody.insertRow(-1);  
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Name'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['NFLTeam'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['FantasyOwner'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['GamesPlayed'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round(tableData[i]['FantasyPoints']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['RecYards']+tableData[i]['RushYards'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['TargetsInside10']+tableData[i]['CarriesInside10'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['RecTDs']+tableData[i]['RushTDs'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Great']
                        if(tableData[i]['Great'] > maxGreat/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGreat - tableData[i]['Great'])/(maxGreat/2)*255) + ", 255, 0, 0.5)"; 
                        else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Great'] - 0)/(maxGreat/2)*255) + ", 0, 0.5)";
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Good']
                        if(tableData[i]['Good'] > maxGood/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGood - tableData[i]['Good'])/(maxGood/2)*255) + ", 255, 0, 0.5)"; 
                        else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Good'] - 0)/(maxGood/2)*255) + ", 0, 0.5)";
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['Bust']
                        if(tableData[i]['Bust'] > maxBust/2) tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxBust - tableData[i]['Bust'])/(maxBust/2)*255) + ", 0, 0.5)"; 
                        else tabCell.style.backgroundColor = "rgba(" + Math.round((tableData[i]['Bust'] - 0)/(maxBust/2)*255) + ", 255, 0, 0.5)";
                    }
                }
            }

        }
        
    } else if (position == "SUPERFLEX") {

        // Fill in the table HEADER
        var tr = tableHeader.insertRow(-1);  
        var th = document.createElement("TH");
        th.innerHTML = "Name";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Team";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Fantasy Owner";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Games Played";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Fantasy Points";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Yards";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Opportunities\nInside 10";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "TDs";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Great %";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Good %";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Bust %";
        tr.appendChild(th);

        // Find maximimum game ratings
        maxGreat = 0
        maxGood = 0
        maxBust = 0
        for(var i = 0; i < tableData.length; i++){
            if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                if(tableData[i]['Great'] > maxGreat) maxGreat = tableData[i]['Great'];
                if(tableData[i]['Good'] > maxGood) maxGood = tableData[i]['Good'];
                if(tableData[i]['Bust'] > maxBust) maxBust = tableData[i]['Bust'];
            }
        }

        // Fill in table body
        if(average) {
            for(var i = 0; i < tableData.length; i++){
                if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                    tr = tableBody.insertRow(-1);  
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Name'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['NFLTeam'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['FantasyOwner'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['GamesPlayed'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = Math.round(tableData[i]['PPG']*100)/100;
                    if('PassTDs' in tableData[i]) {
                        console.log(tableData[i]['Name']);
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round((tableData[i]['PassYards']+tableData[i]['RushYards'])/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round((tableData[i]['PassAttemptsInside10']+tableData[i]['CarriesInside10'])/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round((tableData[i]['PassTDs']+tableData[i]['RushTDs'])/tableData[i]['GamesPlayed']*100)/100;
                    } else {
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round((tableData[i]['RecYards']+tableData[i]['RushYards'])/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round((tableData[i]['TargetsInside10']+tableData[i]['CarriesInside10'])/tableData[i]['GamesPlayed']*100)/100;
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = Math.round((tableData[i]['RecTDs']+tableData[i]['RushTDs'])/tableData[i]['GamesPlayed']*100)/100;
                    }
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Great']
                    if(tableData[i]['Great'] > maxGreat/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGreat - tableData[i]['Great'])/(maxGreat/2)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Great'] - 0)/(maxGreat/2)*255) + ", 0, 0.5)";
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Good']
                    if(tableData[i]['Good'] > maxGood/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGood - tableData[i]['Good'])/(maxGood/2)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Good'] - 0)/(maxGood/2)*255) + ", 0, 0.5)";
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Bust']
                    if(tableData[i]['Bust'] > maxBust/2) tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxBust - tableData[i]['Bust'])/(maxBust/2)*255) + ", 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(" + Math.round((tableData[i]['Bust'] - 0)/(maxBust/2)*255) + ", 255, 0, 0.5)";
                }
            }
        } else {
            for(var i = 0; i < tableData.length; i++){
                if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                    tr = tableBody.insertRow(-1);  
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Name'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['NFLTeam'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['FantasyOwner'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['GamesPlayed'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = Math.round(tableData[i]['FantasyPoints']*100)/100;
                    if('PassTDs' in tableData[i]) {
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['PassYards']+tableData[i]['RushYards'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['PassAttemptsInside10']+tableData[i]['CarriesInside10'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['PassTDs']+tableData[i]['RushTDs'];
                    } else {
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['RecYards']+tableData[i]['RushYards'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['TargetsInside10']+tableData[i]['CarriesInside10'];
                        tabCell = tr.insertCell(-1);
                        tabCell.innerText = tableData[i]['RecTDs']+tableData[i]['RushTDs'];
                    }
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Great']
                    if(tableData[i]['Great'] > maxGreat/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGreat - tableData[i]['Great'])/(maxGreat/2)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Great'] - 0)/(maxGreat/2)*255) + ", 0, 0.5)";
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Good']
                    if(tableData[i]['Good'] > maxGood/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGood - tableData[i]['Good'])/(maxGood/2)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Good'] - 0)/(maxGood/2)*255) + ", 0, 0.5)";
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Bust']
                    if(tableData[i]['Bust'] > maxBust/2) tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxBust - tableData[i]['Bust'])/(maxBust/2)*255) + ", 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(" + Math.round((tableData[i]['Bust'] - 0)/(maxBust/2)*255) + ", 255, 0, 0.5)";
                }
            }
        }

    } else if (position == "K") {

        // Fill in the table HEADER
        var tr = tableHeader.insertRow(-1);  
        var th = document.createElement("TH");
        th.innerHTML = "Name";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Team";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Fantasy Owner";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Games Played";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Fantasy Points";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "FGs Made";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "FGs Missed";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Extra Points";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Great %";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Good %";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Bust %";
        tr.appendChild(th);

        // Find maximimum game ratings
        maxGreat = 0
        maxGood = 0
        maxBust = 0
        for(var i = 0; i < tableData.length; i++){
            if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                if(tableData[i]['Great'] > maxGreat) maxGreat = tableData[i]['Great'];
                if(tableData[i]['Good'] > maxGood) maxGood = tableData[i]['Good'];
                if(tableData[i]['Bust'] > maxBust) maxBust = tableData[i]['Bust'];
            }
        }

        // Fill in table body
        if(average) {
            for(var i = 0; i < tableData.length; i++){
                if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                    tr = tableBody.insertRow(-1);  
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Name'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['NFLTeam'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['FantasyOwner'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['GamesPlayed'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = Math.round(tableData[i]['PPG']*100)/100;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = Math.round((tableData[i]['FGsMade'])/tableData[i]['GamesPlayed']*100)/100;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = Math.round((tableData[i]['FGsMissed'])/tableData[i]['GamesPlayed']*100)/100;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = Math.round((tableData[i]['ExtraPoints'])/tableData[i]['GamesPlayed']*100)/100;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Great']
                    if(tableData[i]['Great'] > maxGreat/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGreat - tableData[i]['Great'])/(maxGreat/2)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Great'] - 0)/(maxGreat/2)*255) + ", 0, 0.5)";
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Good']
                    if(tableData[i]['Good'] > maxGood/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGood - tableData[i]['Good'])/(maxGood/2)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Good'] - 0)/(maxGood/2)*255) + ", 0, 0.5)";
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Bust']
                    if(tableData[i]['Bust'] > maxBust/2) tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxBust - tableData[i]['Bust'])/(maxBust/2)*255) + ", 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(" + Math.round((tableData[i]['Bust'] - 0)/(maxBust/2)*255) + ", 255, 0, 0.5)";
                }
            }
        } else {
            for(var i = 0; i < tableData.length; i++){
                if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                    tr = tableBody.insertRow(-1);  
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Name'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['NFLTeam'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['FantasyOwner'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['GamesPlayed'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = Math.round(tableData[i]['FantasyPoints']*100)/100;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['FGsMade'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['FGsMissed'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['ExtraPoints'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Great']
                    if(tableData[i]['Great'] > maxGreat/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGreat - tableData[i]['Great'])/(maxGreat/2)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Great'] - 0)/(maxGreat/2)*255) + ", 0, 0.5)";
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Good']
                    if(tableData[i]['Good'] > maxGood/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGood - tableData[i]['Good'])/(maxGood/2)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Good'] - 0)/(maxGood/2)*255) + ", 0, 0.5)";
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Bust']
                    if(tableData[i]['Bust'] > maxBust/2) tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxBust - tableData[i]['Bust'])/(maxBust/2)*255) + ", 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(" + Math.round((tableData[i]['Bust'] - 0)/(maxBust/2)*255) + ", 255, 0, 0.5)";
                }
            }
        }

    } else {

        // Fill in the table HEADER
        var tr = tableHeader.insertRow(-1);  
        var th = document.createElement("TH");
        th.innerHTML = "Name";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Team";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Fantasy Owner";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Games Played";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Fantasy Points";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Sacks";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Interceptions";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Fumbles";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Touchdowns";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Great %";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Good %";
        tr.appendChild(th);
        th = document.createElement("TH");
        th.innerHTML = "Bust %";
        tr.appendChild(th);

        // Find maximimum game ratings
        maxGreat = 0
        maxGood = 0
        maxBust = 0
        for(var i = 0; i < tableData.length; i++){
            if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                if(tableData[i]['Great'] > maxGreat) maxGreat = tableData[i]['Great'];
                if(tableData[i]['Good'] > maxGood) maxGood = tableData[i]['Good'];
                if(tableData[i]['Bust'] > maxBust) maxBust = tableData[i]['Bust'];
            }
        }

        // Fill in table body
        if(average) {
            for(var i = 0; i < tableData.length; i++){
                if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                    tr = tableBody.insertRow(-1);  
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Name'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['NFLTeam'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['FantasyOwner'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['GamesPlayed'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = Math.round(tableData[i]['PPG']*100)/100;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = Math.round((tableData[i]['Sacks'])/tableData[i]['GamesPlayed']*100)/100;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = Math.round((tableData[i]['Ints'])/tableData[i]['GamesPlayed']*100)/100;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = Math.round((tableData[i]['Fumbles'])/tableData[i]['GamesPlayed']*100)/100;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = Math.round((tableData[i]['TDs'])/tableData[i]['GamesPlayed']*100)/100;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Great']
                    if(tableData[i]['Great'] > maxGreat/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGreat - tableData[i]['Great'])/(maxGreat/2)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Great'] - 0)/(maxGreat/2)*255) + ", 0, 0.5)";
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Good']
                    if(tableData[i]['Good'] > maxGood/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGood - tableData[i]['Good'])/(maxGood/2)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Good'] - 0)/(maxGood/2)*255) + ", 0, 0.5)";
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Bust']
                    if(tableData[i]['Bust'] > maxBust/2) tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxBust - tableData[i]['Bust'])/(maxBust/2)*255) + ", 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(" + Math.round((tableData[i]['Bust'] - 0)/(maxBust/2)*255) + ", 255, 0, 0.5)";
                }
            }
        } else {
            for(var i = 0; i < tableData.length; i++){
                if(tableData[i]['GamesPlayed'] >= weeksRequired) {
                    tr = tableBody.insertRow(-1);  
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Name'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['NFLTeam'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['FantasyOwner'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['GamesPlayed'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = Math.round(tableData[i]['FantasyPoints']*100)/100;
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Sacks'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Ints'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Fumbles'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['TDs'];
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Great']
                    if(tableData[i]['Great'] > maxGreat/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGreat - tableData[i]['Great'])/(maxGreat/2)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Great'] - 0)/(maxGreat/2)*255) + ", 0, 0.5)";
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Good']
                    if(tableData[i]['Good'] > maxGood/2) tabCell.style.backgroundColor = "rgba(" + Math.round((maxGood - tableData[i]['Good'])/(maxGood/2)*255) + ", 255, 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(255, " + Math.round((tableData[i]['Good'] - 0)/(maxGood/2)*255) + ", 0, 0.5)";
                    tabCell = tr.insertCell(-1);
                    tabCell.innerText = tableData[i]['Bust']
                    if(tableData[i]['Bust'] > maxBust/2) tabCell.style.backgroundColor = "rgba(255, " + Math.round((maxBust - tableData[i]['Bust'])/(maxBust/2)*255) + ", 0, 0.5)"; 
                    else tabCell.style.backgroundColor = "rgba(" + Math.round((tableData[i]['Bust'] - 0)/(maxBust/2)*255) + ", 255, 0, 0.5)";
                }
            }
        }

    }


    // Make the entire table sortable
    var entireTable = document.getElementById("tableEntire");
    sorttable.makeSortable(entireTable);
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

    // Update weeks required based on new value
    var selectObj = document.getElementById("weeksRequired");
    while(selectObj.hasChildNodes()) {
        selectObj.removeChild(selectObj.firstChild);
    }

    // Fill in pull down with applicable matchups
    for(var i = 0; i < weeks; i++){
        var opt = document.createElement('option');
        opt.value = i+1;
        opt.innerHTML = i+1;
        selectObj.appendChild(opt);
    }
    selectObj.selectedIndex = Math.max(Math.floor(weeks/2 + 0.01) - 1,0);
    
    // Check and update pulldown value
    pulldown = document.getElementById("weeksRequired");
    weeksRequired = pulldown.value;

    // Update the data table
    updateDataTable()
}

/* FUNCTION: changeWeekRequiredCount
*
* Called whenver the weeks count pulldown is updated.
* Calls 'updateTable' at end to update all page items as appropriate
*
*/
function changeWeekRequiredCount() {

    // Check and update pulldown value
    var pulldown = document.getElementById("weeksRequired");
    weeksRequired = pulldown.value;

    // Update the data table
    updateTable()
}

/* FUNCTION: changePosition
*
* Called whenver the weeks count pulldown is updated.
* Calls 'updateTable' at end to update all page items as appropriate
*
*/
function changePosition() {

    // Check and update pulldown value
    var pulldown = document.getElementById("positions");
    position = pulldown.value;

    // Control what radio buttons are active
    var radio = document.getElementsByName('statDisplayRadio');
    if(position == "QB") {

        radio[0].disabled = false;
        radio[1].disabled = false;
        radio[3].disabled = false;

        if(radio[2].checked) {
            radio[0].checked = true;
            statType = "Passing";
        }

        radio[2].disabled = true;
        document.getElementById("PassingText").innerHTML = ("Passing");
        document.getElementById("RushingText").innerHTML = ("Rushing");
        document.getElementById("ReceivingText").innerHTML = ("Receiving").strike();
        document.getElementById("TotalText").innerHTML = ("Total");

    }else if (position == "RB") {

        radio[1].disabled = false;
        radio[2].disabled = false;
        radio[3].disabled = false;

        if(radio[0].checked) {
            radio[1].checked = true;
            statType = "Rushing";
        }

        radio[0].disabled = true;
        document.getElementById("PassingText").innerHTML = ("Passing").strike();
        document.getElementById("RushingText").innerHTML = ("Rushing");
        document.getElementById("ReceivingText").innerHTML = ("Receiving");
        document.getElementById("TotalText").innerHTML = ("Total");

    }else if (position == "WR") {
        
        radio[1].disabled = false;
        radio[2].disabled = false;
        radio[3].disabled = false;

        if(radio[0].checked) {
            radio[2].checked = true;
            statType = "Receiving";
        }

        radio[0].disabled = true;
        document.getElementById("PassingText").innerHTML = ("Passing").strike();
        document.getElementById("RushingText").innerHTML = ("Rushing");
        document.getElementById("ReceivingText").innerHTML = ("Receiving");
        document.getElementById("TotalText").innerHTML = ("Total");

    }else if (position == "TE") {
        
        radio[1].disabled = false;
        radio[2].disabled = false;
        radio[3].disabled = false;

        if(radio[0].checked) {
            radio[2].checked = true;
            statType = "Receiving";
        }

        radio[0].disabled = true;
        document.getElementById("PassingText").innerHTML = ("Passing").strike();
        document.getElementById("RushingText").innerHTML = ("Rushing");
        document.getElementById("ReceivingText").innerHTML = ("Receiving");
        document.getElementById("TotalText").innerHTML = ("Total");

    }else if (position == "FLEX") {
        
        radio[1].disabled = false;
        radio[2].disabled = false;
        radio[3].disabled = false;

        if(radio[0].checked) {
            radio[3].checked = true;
            statType = "Total";
        }

        radio[0].disabled = true;
        document.getElementById("PassingText").innerHTML = ("Passing").strike();
        document.getElementById("RushingText").innerHTML = ("Rushing");
        document.getElementById("ReceivingText").innerHTML = ("Receiving");
        document.getElementById("TotalText").innerHTML = ("Total");

    }else if (position == "SUPERFLEX") {
        
        radio[3].disabled = false;

        if(radio[0].checked || radio[1].checked || radio[2].checked) {
            radio[3].checked = true;
            statType = "Total";
        }

        radio[0].disabled = true;
        radio[1].disabled = true;
        radio[2].disabled = true;
        document.getElementById("PassingText").innerHTML = ("Passing").strike();
        document.getElementById("RushingText").innerHTML = ("Rushing").strike();
        document.getElementById("ReceivingText").innerHTML = ("Receiving").strike();
        document.getElementById("TotalText").innerHTML = ("Total");

    }else if (position == "K") {
        
        radio[3].disabled = false;

        if(radio[0].checked || radio[1].checked || radio[2].checked) {
            radio[3].checked = true;
            statType = "Total";
        }

        radio[0].disabled = true;
        radio[1].disabled = true;
        radio[2].disabled = true;
        document.getElementById("PassingText").innerHTML = ("Passing").strike();
        document.getElementById("RushingText").innerHTML = ("Rushing").strike();
        document.getElementById("ReceivingText").innerHTML = ("Receiving").strike();
        document.getElementById("TotalText").innerHTML = ("Total");

    }else if (position == "DST") {
        
        radio[3].disabled = false;

        if(radio[0].checked || radio[1].checked || radio[2].checked) {
            radio[3].checked = true;
            statType = "Total";
        }

        radio[0].disabled = true;
        radio[1].disabled = true;
        radio[2].disabled = true;
        document.getElementById("PassingText").innerHTML = ("Passing").strike();
        document.getElementById("RushingText").innerHTML = ("Rushing").strike();
        document.getElementById("ReceivingText").innerHTML = ("Receiving").strike();
        document.getElementById("TotalText").innerHTML = ("Total");

    }

    // Update the data table
    updateDataTable()
}

/* FUNCTION: flipTotalAverage
*
* Called whenver the weeks count pulldown is updated.
* Calls 'updateTable' at end to update all page items as appropriate
*
*/
function flipTotalAverage() {

    // Reset values
    average = false;

    // Get buttons/pulldown
    var radio = document.getElementsByName('total-select');

    // Check value and update if necessary
    if (radio[0].checked) {
        average = true;
    }

    // Update the data table
    updateTable()
}

/* FUNCTION: flipStatDisplay
*
* Called whenver the weeks count pulldown is updated.
* Calls 'updateTable' at end to update all page items as appropriate
*
*/
function flipStatDisplay() {

    // Get buttons/pulldown
    var radio = document.getElementsByName('statDisplayRadio');

    // Check value and update if necessary
    if (radio[0].checked) statType = "Passing";
    if (radio[1].checked) statType = "Rushing";
    if (radio[2].checked) statType = "Receiving";
    if (radio[3].checked) statType = "Total";

    // Update the data table
    updateTable()
}
