/*src = "https://cdn.firebase.com/js/client/2.4.2/firebase.js";
src = "https://www.gstatic.com/firebasejs/8.2.2/firebase-app.js";
src = "https://www.gstatic.com/firebasejs/8.2.2/firebase-analytics.js";
src = "https://www.gstatic.com/firebasejs/8.2.2/firebase-auth.js";
src = "https://www.gstatic.com/firebasejs/8.2.2/firebase-database.js";

*/

//var firebase = require('firebase');

var firebaseConfig = {
    apiKey: "AIzaSyC8f6X3dPhyU-zgvzMWlMh-WImPZsJMMh8",
    authDomain: "fantasyfootball-7496f.firebaseapp.com",
    databaseURL: "https://fantasyfootball-7496f-default-rtdb.firebaseio.com",
    projectId: "fantasyfootball-7496f",
    storageBucket: "fantasyfootball-7496f.appspot.com",
    messagingSenderId: "25543165955",
};
firebase.initializeApp(firebaseConfig);

console.log(5);


const dbRef = firebase.database().ref();
const usersRef = dbRef.child('users');

firebase.database().ref('fantasyTeamData').once('value', function(snap){
    console.log(snap.val());
})



const userListUI = document.getElementById("userList");
usersRef.on("child_added", snap => {
    let user = snap.val();
    let $li = document.createElement("li");
    $li.innerHTML = user.name;
    $li.setAttribute("child-key", snap.key);
    $li.addEventListener("click", userClicked);
    userListUI.append($li);
});
