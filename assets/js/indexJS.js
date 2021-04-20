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


function loadIndex() {

    dbRef.child("seasonFantasyTeamData").get().then((snapshot) => {
        tableData = snapshot.val();
        tableData.forEach(function(year, index, array) {
            var tableBody = document.getElementById(String(year.year).concat("TableBody"));
            while(tableBody != null && tableBody.hasChildNodes()) {
                tableBody.removeChild(tableBody.firstChild);
            }


            var sortArray = []
            year.standings.forEach(function(team,index2,array) {
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



            sortArray.forEach(function(team,index2,array) {
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
        })

    }).catch((error) => {
        console.error(error);
    });
    
}