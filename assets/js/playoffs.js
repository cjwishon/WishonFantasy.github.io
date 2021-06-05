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
var playoffData;
var addedSections;
var bodyElement;
var positionLimits;

/* FUNCTION: seasonChange
*
* Called whenver the season/year radio button is updated.
* Calls 'updatePage' at end to update all page items as appropriate
*
*/
function seasonChange() {

    // Clear the data
    for(var i = 0; i < addedSections.length; i++){
        bodyElement.removeChild(addedSections[i]);
    }
    addedSections = [];

    // Get radio buttons
    var radios = document.getElementsByName('season-select');

    // Determine the value selected and update the 'pageYear' variable and then update page
    for (var i = 0, length = radios.length; i < length; i++) {
        if (radios[i].checked) {
            pageYear = radios[i].value;
            loadPlayoffs();
            break;
        }
    }
}

/* FUNCTION: loadPlayoffs
*
* Called when the page loads and pulls in the firebase data
* Calls 'updatePage' at end to update all page items as appropriate
*
*/
function loadPlayoffs() {

    // Get the element we will be appending to
    bodyElement = document.getElementById('mainBody');

    // Create section list
    addedSections = [];

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
    return firebase.database().ref('/playoffData/' + pageYear).once('value').then((snapshot) => {
        playoffData = snapshot.val();
        updatePage()
    });

}

function updatePage() {

    
    console.log(playoffData)

    for(var i = 1; i < playoffData.length; i++){

        // Initialize sector
        var section = document.createElement("SECTION")
        
        // Create Header
        var header = document.createElement("header");
        header.className = "major";
        var h2 = document.createElement("H2");
        var text;
        if(playoffData[i]['Weeks'].length > 1) text = document.createTextNode("Weeks " + playoffData[i]['Weeks'][0] + " & " + playoffData[i]['Weeks'][1] + "\n");
        else text = document.createTextNode("Week " + playoffData[i]['Weeks'][0] + "\n");
        h2.append(text)
        header.appendChild(h2)
        section.appendChild(header)

        // Loop through games in the session and add there data
        for(var j = 0; j < playoffData[i]['Matchups'].length; j++){

            //Add game name
            var underline = document.createElement("U");
            var h3 = document.createElement("H3");
            var text = document.createTextNode(playoffData[i]['Matchups'][j]["Name"] + "\n");
            underline.append(text);
            h3.append(underline);
            section.appendChild(h3);
            
            

            // Test if the match is complete and get totals to see who won
            var matchComplete = false;
            var index = 0;
            var totals = [0,0];
            var teamNames = ["",""];
            var winnerName, loserName;
            for(const [name, teamArray] of Object.entries(playoffData[i]['Matchups'][j]["Teams"])) {
                if(Object.keys(teamArray[teamArray.length-1]).length > 0) matchComplete = true;
                teamNames[index] = name;

                for(var k = 0; k < teamArray.length; k++) {
                    for(const [player, playerData] of Object.entries(teamArray[k])) {
                        totals[index] += playerData['Points']
                    }
                }
                totals[index] = Math.round(totals[index] * 100)/100;

                index += 1;
            }

            // Print header
            if(matchComplete){
                if(totals[0] > totals[1]) {
                    var text = document.createTextNode(teamNames[0] + " (" + totals[0] + ") defeated " + teamNames[1] + " (" + totals[1] + ")\n");
                    winnerName = teamNames[0];
                    loserName = teamNames[1];
                } else {
                    var text = document.createTextNode(teamNames[1] + " (" + totals[1] + ") defeated " + teamNames[0] + " (" + totals[0] + ")\n");
                    winnerName = teamNames[1];
                    loserName = teamNames[0];
                }
            } else {
                if(totals[0] > totals[1]) {
                    var text = document.createTextNode(teamNames[0] + " (" + totals[0] + ") leading " + teamNames[1] + " (" + totals[1] + ")\n");
                    winnerName = teamNames[0];
                    loserName = teamNames[1];
                } else {
                    var text = document.createTextNode(teamNames[1] + " (" + totals[1] + ") leading " + teamNames[0] + " (" + totals[0] + ")\n");
                    winnerName = teamNames[1];
                    loserName = teamNames[0];
                }
            }
            var h3 = document.createElement("H3");
            h3.append(text)
            section.appendChild(h3)

            // Create tables
            for(var k = 0; k < playoffData[i]['Weeks'].length; k++){

                var weekVal = playoffData[i]['Weeks'][k];
                var middle = (weekVal)/2;

                var winnerPlayers = []
                var loserPlayers = []
                for(const [player, playerData] of Object.entries(playoffData[i]['Matchups'][j]["Teams"][winnerName][k])) {
                    winnerPlayers.push([playerData["Name"],playerData["Points"],playerData["ScoreRank"],playerData["Slot"]])
                }
                for(const [player, playerData] of Object.entries(playoffData[i]['Matchups'][j]["Teams"][loserName][k])) {
                    loserPlayers.push([playerData["Name"],playerData["Points"],playerData["ScoreRank"],playerData["Slot"]])
                }

                if (winnerPlayers.length == 0) continue;

                // Sort (low to high)
                winnerPlayers.sort(function(a,b) {
                    return a[3] - b[3]
                });
                loserPlayers.sort(function(a,b) {
                    return a[3] - b[3]
                });

                // Load into table
                var divElement = document.createElement("DIV");
                divElement.className = "row";
                var divElementTable = document.createElement("DIV");
                divElementTable.className = "table-wrapper";
                var tableElement = document.createElement("TABLE");
                tableElement.className = "alt center";
                var tableHeader = document.createElement("THEAD");

                // Fill in the table HEADER
                var tr = tableHeader.insertRow(-1);  
                var th = document.createElement("TH");
                th.innerHTML = "Position";
                tr.appendChild(th);
                th = document.createElement("TH");
                if(matchComplete) th.innerHTML = "Winner Player";
                else th.innerHTML = "Leader Player";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "<span title='Where the week ranks for the player up to the current week (includes injury weeks)'>Perf. Rank*</span>";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "    ";
                th.style.borderTop = "None";
                th.style.borderBottom = "None";
                th.style.backgroundColor = "White";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "Points";
                tr.appendChild(th);
                th = document.createElement("TH");
                th.innerHTML = "<span title='Where the week ranks for the player up to the current week (includes injury weeks)'>Perf. Rank*</span>";
                tr.appendChild(th);
                th = document.createElement("TH");
                if(matchComplete) th.innerHTML = "Loser Player";
                else th.innerHTML = "Trailer Player";
                tr.appendChild(th);

                // Create table body and load data
                var tableBody = document.createElement("TBODY");
                var winnerIndex = 0;
                var loserIndex = 0;
                while(winnerIndex < winnerPlayers.length || loserIndex < loserPlayers.length) {
                    var minPosition = Math.min(winnerPlayers[winnerIndex][3],loserPlayers[loserIndex][3])

                    var tr = tableBody.insertRow(-1);  

                    var tabCell = tr.insertCell(-1);
                    if (minPosition == 0) tabCell.innerText = "QB";
                    else if (minPosition == 2) tabCell.innerText = "RB";
                    else if (minPosition == 4) tabCell.innerText = "WR";
                    else if (minPosition == 6) tabCell.innerText = "TE";
                    else if (minPosition == 7) tabCell.innerText = "OP";
                    else if (minPosition == 16) tabCell.innerText = "DST";
                    else if (minPosition == 17) tabCell.innerText = "K";
                    else if (minPosition == 23) tabCell.innerText = "FLEX";

                    if(winnerPlayers[winnerIndex][3] == minPosition){
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = winnerPlayers[winnerIndex][0];
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = winnerPlayers[winnerIndex][2];
                        value = winnerPlayers[winnerIndex][2];
                        if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - 1)/(middle - 1)*255)  + ", 255, 0, 0.5)"; 
                        else tabCell.style.backgroundColor = "rgba(255, " + Math.round((weekVal-1 - value)/(weekVal-1 - middle)*255) + ", 0, 0.5)"; 
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = winnerPlayers[winnerIndex][1];
                        winnerIndex += 1;
                    } else {
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = " ";
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = " ";
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = " ";
                    }
                    var tabCell = tr.insertCell(-1);
                    tabCell.innerHTML = "    ";
                    tabCell.style.borderTop = "None";
                    tabCell.style.borderBottom = "None";
                    tabCell.style.backgroundColor = "White";
                    if(loserPlayers[loserIndex][3] == minPosition){
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = loserPlayers[loserIndex][1];
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = loserPlayers[loserIndex][2];
                        value = loserPlayers[loserIndex][2];
                        if(value < middle) tabCell.style.backgroundColor = "rgba(" + Math.round((value - 1)/(middle - 1)*255)  + ", 255, 0, 0.5)"; 
                        else tabCell.style.backgroundColor = "rgba(255, " + Math.round((weekVal-1 - value)/(weekVal-1 - middle)*255) + ", 0, 0.5)"; 
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = loserPlayers[loserIndex][0];
                        loserIndex += 1;
                    } else {
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = " ";
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = " ";
                        var tabCell = tr.insertCell(-1);
                        tabCell.innerText = " ";
                    }

                }

                // Create the total row
                var tr = tableBody.insertRow(-1);  
                var tabCell = tr.insertCell(-1);
                tabCell.innerText = "Total:";
                var tabCell = tr.insertCell(-1);
                tabCell.innerText = "";
                var tabCell = tr.insertCell(-1);
                tabCell.innerText = "";
                var sum = 0; 
                for(var z = 0; z < winnerPlayers.length; z++){
                    sum += winnerPlayers[z][1]
                }
                var tabCell = tr.insertCell(-1);
                tabCell.innerText = Math.round(sum*100)/100;
                var tabCell = tr.insertCell(-1);
                tabCell.innerHTML = "    ";
                tabCell.style.borderTop = "None";
                tabCell.style.borderBottom = "None";
                tabCell.style.backgroundColor = "White";
                var sum = 0; 
                for(var z = 0; z < loserPlayers.length; z++){
                    sum += loserPlayers[z][1]
                }
                var tabCell = tr.insertCell(-1);
                tabCell.innerText = Math.round(sum*100)/100;
                var tabCell = tr.insertCell(-1);
                tabCell.innerText = "";
                var tabCell = tr.insertCell(-1);
                tabCell.innerText = "";


                // Add table category to page
                var h4 = document.createElement("h4");
                var text = document.createTextNode("Week " + weekVal + ":");
                h4.append(text);
                section.appendChild(h4);
    

                // Add all table stuff to the page
                tableElement.appendChild(tableHeader);
                tableElement.appendChild(tableBody);
                divElementTable.appendChild(tableElement);
                divElement.appendChild(divElementTable);
                section.appendChild(divElement)

                var lineBreak = document.createElement("BR");
                section.appendChild(lineBreak);

            }

            // Create matchup timeline
            var canvasElement = document.createElement("CANVAS")
            canvasElement.style.width = "700";
            canvasElement.style.height = "350";

            // Add chart to page
            section.appendChild(canvasElement);

            // Get max time
            var endTime = playoffData[i]['NFLGameBlocks'][playoffData[i]['NFLGameBlocks'].length-1][1];

            // Get data
            var winnerTimeline = []
            var loserTimeline = []
            for(var k = 0; k < playoffData[i]['Weeks'].length; k++){
                for(const [player, playerData] of Object.entries(playoffData[i]['Matchups'][j]["Teams"][winnerName][k])) {
                    if('PlayByPlay' in playerData){
                        for(var x = 0; x < playerData['PlayByPlay'].length; x++){
                            winnerTimeline.push([playerData['PlayByPlay'][x][0],playerData['PlayByPlay'][x][1]])
                        }
                    }
                }
                for(const [player, playerData] of Object.entries(playoffData[i]['Matchups'][j]["Teams"][loserName][k])) {
                    if('PlayByPlay' in playerData){
                        for(var x = 0; x < playerData['PlayByPlay'].length; x++){
                            loserTimeline.push([playerData['PlayByPlay'][x][0],playerData['PlayByPlay'][x][1]])
                        }
                    }
                }
            }
            winnerTimeline.push([0.0, 0.0])
            winnerTimeline.push([endTime, 0.0])
            loserTimeline.push([0.0, 0.0])
            loserTimeline.push([endTime, 0.0])

            // Sort all the entries by time (low to high)
            winnerTimeline.sort(function(a,b) {
                return a[0] - b[0]
            });
            loserTimeline.sort(function(a,b) {
                return a[0] - b[0]
            });

            // Get cumulative sum
            for(var j2 = 1; j2 < winnerTimeline.length; j2++){
                winnerTimeline[j2][1] += winnerTimeline[j2-1][1];
            }
            for(var j2 = 1; j2 < loserTimeline.length; j2++){
                loserTimeline[j2][1] += loserTimeline[j2-1][1];
            }
            
            // Round
            for(var j2 = 1; j2 < winnerTimeline.length; j2++){
                winnerTimeline[j2][1] = Math.round(winnerTimeline[j2][1]*100)/100;
            }
            for(var j2 = 1; j2 < loserTimeline.length; j2++){
                loserTimeline[j2][1] = Math.round(loserTimeline[j2][1]*100)/100;
            }

            // Working from the back, insert steps
            
            var count = 1;
            while(true){
                winnerTimeline.splice(count, 0, [winnerTimeline[count][0],winnerTimeline[count-1][1]]);
                count+=2;
                if (count >= winnerTimeline.length-1) break;
            }
            count = 1;
            while(true){
                loserTimeline.splice(count, 0, [loserTimeline[count][0],loserTimeline[count-1][1]]);
                count+=2;
                if (count >= loserTimeline.length-1) break;
            }

            // Determine maximum height
            var maxY = winnerTimeline[winnerTimeline.length-1][1];;
            maxY = Math.ceil(maxY/25.0 + 0.00001) * 25.0;


            // Fill in data to be graphed
            var maxX = 0;
            var winnerData = []
            for(var i2 = 0; i2 < winnerTimeline.length; i2++){
                var subtractAmount = 0;
                for(var j2 = 0; j2 < playoffData[i]['NFLGameBlocks'].length-1; j2++){
                    if(winnerTimeline[i2][0] <= playoffData[i]['NFLGameBlocks'][j2][1] + 0.1) break;
                    subtractAmount += playoffData[i]['NFLGameBlocks'][j2+1][0] - 1200 - (playoffData[i]['NFLGameBlocks'][j2][1] + 1200);
                }
                winnerData.push({x:winnerTimeline[i2][0] - subtractAmount, y:winnerTimeline[i2][1]})
                if(winnerTimeline[i2][0] - subtractAmount>maxX) maxX = winnerTimeline[i2][0] - subtractAmount;
            }

            var loserData = []
            for(var i2 = 0; i2 < loserTimeline.length; i2++){
                var subtractAmount = 0;
                for(var j2 = 0; j2 < playoffData[i]['NFLGameBlocks'].length-1; j2++){
                    if(loserTimeline[i2][0] <= playoffData[i]['NFLGameBlocks'][j2][1] + 0.1) break;
                    subtractAmount += playoffData[i]['NFLGameBlocks'][j2+1][0] - 1200 - (playoffData[i]['NFLGameBlocks'][j2][1] + 1200);
                }
                loserData.push({x:loserTimeline[i2][0] - subtractAmount, y:loserTimeline[i2][1]})
                if(loserTimeline[i2][0] - subtractAmount>maxX) maxX = loserTimeline[i2][0] - subtractAmount;
            }

            dataSet = [
                {
                    "label":winnerName + " (Winner)",
                    "data":winnerData,
                    "fill": false,
                    "lineTension": 0,
                    'borderColor': '#006400',
                    'fillColor': '#006400',
                    showLine: true,
                    pointRadius: 0
                },
                {
                    "label":loserName + " (Loser)",
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
            for(var j2 = 0; j2 < playoffData[i]['NFLGameBlocks'].length-1; j2++){
                lineX += playoffData[i]['NFLGameBlocks'][j2][1] - playoffData[i]['NFLGameBlocks'][j2][0] + 2400;
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

            // Create graph
            timelineChart = new Chart(canvasElement, {
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

            






            var lineBreak = document.createElement("BR");
            section.appendChild(lineBreak);
        }

        // Add to page
        bodyElement.appendChild(section)

        // Add to list
        addedSections.push(section);

    }

    var lineBreak = document.createElement("BR");
    bodyElement.appendChild(lineBreak);
    addedSections.push(lineBreak);
    var lineBreak = document.createElement("BR");
    bodyElement.appendChild(lineBreak);
    addedSections.push(lineBreak);

    var text = document.createTextNode("* For any given player, this statistic indicates where the given week ranks for that player's weekly performances UP TO and including the week the statistic is for. For example, if Alvin Kamara has a 'Performance Rank' (Perf. Rank) of 2 for Week 13, this implies that for Weeks 1 through 13, his performance in Week 13 would rank as the 2nd best (i.e. he had one above). If his Perf. Rank was 13, it implies his performance was the worst to date. These stats include injury weeks (which score 0).");
    bodyElement.appendChild(text);
    addedSections.push(text);
    
}