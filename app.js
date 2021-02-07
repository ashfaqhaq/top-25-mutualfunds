const { response } = require("express");
const express = require("express");
const jsonfile = require('jsonfile')
const fetch = require('node-fetch');
var cors = require('cors');
//create express app
const app = express();

app.use(cors());
const file = 'data.json'
var globalData = '';
//port at which the server will run
const port = process.env.PORT || 3000;

//create end point
app.get("/", (request, response) => {
  //send 'Hi, from Node server' to client
  response.send("Hi s, from Node server");
});
function getData(url) {
  return new Promise((resolve, reject) => {
    fetch(url)
      .then((resp) => resp.json())      
      .then((data) => { 
                resolve(data)
      })
  })
}
function loadPrices() {
  let userRequests = []
  const range = '5d'; // Data of past 5 days 
  const stockSymbols = ["SPY", "FXAIX",
    "VTSAX",
    "IVV",
    "VSMPX", "FDRXX", "VMFXX",
    "VTI", "SPAXX",
    "VITSX", "VGTSX", "VOO", "VTSMX", "QQQ", "FGTXX", "VIIIX", "VTBIX", "AGTHX", "VBTLX", "OGVXX", "VINIX", "TFDXX", "FCNTX", "FRGXX"]
  stockSymbols.forEach(
    (stockSymbol) => {
      userRequests.push(getData(`https://query1.finance.yahoo.com/v8/finance/chart/${stockSymbol}?region=IN&lang=en-IN&includePrePost=false&useYfid=true&range=${range}&corsDomain=in.finance.yahoo.com&.tsrc=finance`))
    })
  Promise.all(userRequests)

    .then((responseData) => {
     writeData(responseData)
    })
 
}
async function writeData(responseData) {
  var _objects ={}
  // console.log(responseData)
  const data = await responseData.map((items)=>{
    const closeArray = items.chart.result[0].indicators.quote[0].close;
    const symbol = (items.chart.result[0].meta.symbol)
    return _objects[symbol]=closeArray 
  })
  jsonfile.writeFile(file, _objects, function (err) {
    if (err) console.error(err)
  })
  globalData = _objects;
  console.log(globalData)
}
app.get("/top-25",async (request, response) => {
  // const data = await 
   loadPrices();
  console.log(globalData);
 response.send(globalData);
});
function checkResponseStatus(res) {
  if (res.ok) {
    return res
  } else {
    throw new Error(`The HTTP status of the reponse: ${res.status} (${res.statusText})`);
  }
}
app.listen(port, () =>
  //a callback that will be called as soon as server start listening
  console.log(`server is listening at http://localhost:${port}`)

);


