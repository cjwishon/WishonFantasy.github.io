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

var seasonData;
var pageYear;

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

function updatePage() {

    var tableBody = document.getElementById("seasonStandingTable");
    while(tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    seasonData.forEach(function(year, index, array) {
        if (year.year == pageYear) {
            year.standings.forEach(function(team,index2,array) {
                var tr = tableBody.insertRow(-1);  
                var tabCell = tr.insertCell(-1);
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
        }
    })

}

function radioChange() {
    var radios = document.getElementsByName('season-select');

    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            pageYear = radios[i].value;
            updatePage();
            break;
        }
    }
}