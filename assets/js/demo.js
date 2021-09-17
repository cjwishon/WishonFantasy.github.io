// Global variables
var leagueID;
var year;

/* FUNCTION: loadNFLPlayerData
*
* Initialization function on page load
*
*/

swid = "{8DBDF1C9-39CD-4B37-96D6-1E1734FE2516}"
espn_s2 = "AEAFEMDauUqsBoSuLLT7ASIEkjJoDDXK26P%2FGP4j%2FN%2FtiQMCZo9386%2FDhP8XOwdKMrAb8WISRLeIXu3dxcurTViteu1Lnkq7l5T0VrhX%2FTJjrbFveUUn57YkXharIGL%2FZrE6UtY782duNQ7ib6rf0qiE8spPzU9xDS2NgIWIk0bpbhn1hB%2FFfLOiGgUhuOiuwpqJMUdMtjtXr%2FF4RgxGAgeq8sSoksxwWRNtW3vSe3bnoY0QxdFcnuAdsa%2BclkObhKwc30pjX40tpWtMV8S21Y4y"



function queryLeague() {

    // Get data from pulldowns
    var leagueIDElement = document.getElementById("league_id");
    leagueID = leagueIDElement.value;
    var yearElement = document.getElementById("year");
    year = yearElement.value;

    console.log("HELLO 1");
    document.cookie = "swid=" + swid;
    console.log(document.cookie);
    document.cookie = "espn_s2=" + espn_s2;
    console.log(document.cookie);


    
    //cookies={"swid": espnSWID, "espn_s2": espnS2}

    // Get ESPN Data
    var espnData = fetch('https://fantasy.espn.com/apis/v3/games/ffl/seasons/' + year + '/segments/0/leagues/' + leagueID + '?view=mTeam', {
        credentials: 'include'
      }).then(response => response.json());
    espnData = MakeQuerablePromise(espnData)
    
    espnData.then(data => {
        createTable(data)
    });

}

function createTable(data) {

    console.log(data);

    // Reset table if applicable
    var tableBody = document.getElementById("tableBody");
    while(tableBody != null && tableBody.hasChildNodes()) {
        tableBody.removeChild(tableBody.firstChild);
    }

    // Reset data
    tableData = []

    // Get Data
    for(var i in data['members']){
        tableData.push({
            "Name": data['members'][i]['firstName'][0].toUpperCase() + ". " + data['members'][i]['lastName'][0].toUpperCase() + data['members'][i]['lastName'].substring(1).toLowerCase(),
            "ESPN_ID": data['members'][i]['id']
        });
    }

    // Load position/data
    for(var i in data['teams']){
        for(var j in tableData){

            if(tableData[j]['ESPN_ID'] == data['teams'][i]['primaryOwner']) {
                tableData[j]['Position'] = data['teams'][i]['playoffSeed'];
                tableData[j]['Team'] = data['teams'][i]['location'] + " " + data['teams'][i]['nickname'];
                tableData[j]['Wins'] = data['teams'][i]['record']['overall']['wins'];
                tableData[j]['Points_For'] = Math.round(data['teams'][i]['points'] * 100)/100;
                tableData[j]['Points_Against'] = Math.round(data['teams'][i]['record']['overall']['pointsAgainst'] * 100)/100;
            }

        }
    }

    // Sort
    tableData.sort(function(a,b) {
        return a['Position'] - b['Position']
    });

    // Push into table
    for(var i = 0; i < tableData.length; i++){
        tr = tableBody.insertRow(-1);  
        var tabCell = tr.insertCell(-1);
        tabCell.innerText = tableData[i]['Position'];
        tabCell = tr.insertCell(-1);
        tabCell.innerText = tableData[i]['Team'];
        tabCell = tr.insertCell(-1);
        tabCell.innerText = tableData[i]['Name'];
        tabCell = tr.insertCell(-1);
        tabCell.innerText = tableData[i]['Wins'];
        tabCell = tr.insertCell(-1);
        tabCell.innerText = tableData[i]['Points_For'];
        tabCell = tr.insertCell(-1);
        tabCell.innerText = tableData[i]['Points_Against'];
    }

    // Make the entire table sortable
    var entireTable = document.getElementById("tableEntire");
    sorttable.makeSortable(entireTable);

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