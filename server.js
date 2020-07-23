// ExpressJS Setup
const express = require('express');
const app = express();
var bodyParser = require('body-parser');

// Constants
const PORT = 8800;
const HOST = "0.0.0.0";

 // Hyperledger Bridge
const { FileSystemWallet, Gateway } = require('fabric-network');
const fs = require('fs');
const path = require('path');
const ccpPath = path.resolve(__dirname, '..','basic-network','connection.json');
const ccpJSON = fs.readFileSync(ccpPath, 'utf8');
const ccp = JSON.parse(ccpJSON);
const walletPath = path.join(process.cwd(), 'wallet');
const wallet = new FileSystemWallet(walletPath);

app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'views')));

// Index page
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/create', function (req, res) {
    res.sendFile(__dirname + '/create.html');
});
app.get('/query', function (req, res) {
    res.sendFile(__dirname + '/query.html');
});

app.get('/key', async function (req, res) {
    const key = req.query.key;

    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');

    // Get the contract from the network.
    const contract = network.getContract('firstcc');

    // Evaluate the specified transaction.
    // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
    // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
    const result = await contract.evaluateTransaction('get',key);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

    res.send("result is "+result.toString());
});
app.post('/key', async function (req, res) {
    const key = req.body.key;
    const value = req.body.value;

    const userExists = await wallet.exists('user1');
    if (!userExists) {
        console.log('An identity for the user "user1" does not exist in the wallet');
        console.log('Run the registerUser.js application before retrying');
        return;
    }

    // Create a new gateway for connecting to our peer node.
    const gateway = new Gateway();
    await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });

    // Get the network (channel) our contract is deployed to.
    const network = await gateway.getNetwork('mychannel');

    // Get the contract from the network.
    const contract = network.getContract('firstcc');

    // Evaluate the specified transaction.
    // queryCar transaction - requires 1 argument, ex: ('queryCar', 'CAR4')
    // queryAllCars transaction - requires no arguments, ex: ('queryAllCars')
    const result = await contract.submitTransaction('set',key, value);
    console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

    res.send("result is "+result.toString());
});




// // Qeury all cars page
// app.get('/queryallcars', function (req, res) {
//     res.render('query', { title: "Query", activate: "query" });
// });
// // Create car page
// app.get('/createcar', function (req, res) {
//     res.render('createcar', { title: "Create Car", activate: "createcar"  });
// });

// // Change car owner page
// app.get('/querycar', function (req, res) {
//     res.render('querycar', { title: "Change Owner", activate: "querycar" });
// });

// // Change car owner page
// app.get('/changeowner', function (req, res) {
//     res.render('changeowner', { title: "Change Owner", activate: "changeowner" });
// });


// app.get('/api/querycars', async function (req, res) {

//         const userExists = await wallet.exists('user1');
//         if (!userExists) {
//             console.log('An identity for the user "user1" does not exist in the wallet');
//             console.log('Run the registerUser.js application before retrying');
//             return;
//         }
//         const gateway = new Gateway();
//         await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
//         const network = await gateway.getNetwork('mychannel');
//         const contract = network.getContract('fabcar');
//         const result = await contract.evaluateTransaction('queryAllCars');
//         console.log(`Transaction has been evaluated, result is: ${result.toString()}`);

//         var obj = JSON.parse(result)
//         res.json(obj)
// });

// // localhost:8080/api/querycar?carno=CAR5
// app.get('/api/querycar/', async function (req, res) {
//     try {
// 	var carno = req.query.carno;
// 	console.log(carno);

//     const userExists = await wallet.exists('user1');
//         if (!userExists) {
//             console.log('An identity for the user "user1" does not exist in the wallet');
//             console.log('Run the registerUser.js application before retrying');
//             return;
//         }
//         const gateway = new Gateway();
//         await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } });
//         const network = await gateway.getNetwork('mychannel');
//         const contract = network.getContract('fabcar');
//         const result = await contract.evaluateTransaction('queryCar', carno);
//         console.log(`Transaction has been evaluated, result is: ${result.toString()}`);
//         res.status(200).json({response: result.toString()});
//     } catch (error) {
//         console.error(`Failed to evaluate transaction: ${error}`);
//         res.status(400).json(error);
//     }
// });

// app.post('/api/createcar/', async function (req, res) {
//     try {
// 	var carno = req.body.carno;
// 	var colour = req.body.colour;
// 	var make = req.body.make;
// 	var model = req.body.model;
// 	var owner = req.body.owner;

//         const userExists = await wallet.exists('user1');
//         if (!userExists) {
//             console.log('An identity for the user "user1" does not exist in the wallet');
//             console.log('Run the registerUser.js application before retrying');
//             return;
//         }
//         const gateway = new Gateway();
//         await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } }); 
//         const network = await gateway.getNetwork('mychannel');
//         const contract = network.getContract('fabcar');

//         await contract.submitTransaction('createCar', carno, make, model, colour, owner);
//         console.log('Transaction has been submitted');
//         await gateway.disconnect();

//         res.status(200).json({response: 'Transaction has been submitted'});

//     } catch (error) {
//         console.error(`Failed to submit transaction: ${error}`);
//         res.status(400).json(error);
//     }   

// });

// app.post('/api/changeowner/', async function (req, res) {
//     try {
//         var carno = req.body.carno;
//         var owner = req.body.owner;

//         const userExists = await wallet.exists('user1');
//         if (!userExists) {
//             console.log('An identity for the user "user1" does not exist in the wallet');
//             console.log('Run the registerUser.js application before retrying');
//             return;
//         }
//         const gateway = new Gateway();
//         await gateway.connect(ccp, { wallet, identity: 'user1', discovery: { enabled: false } }); 

//         const network = await gateway.getNetwork('mychannel');
//         const contract = network.getContract('fabcar');
//         await contract.submitTransaction('changeCarOwner', carno, owner);
//         console.log('Transaction has been submitted');
//         await gateway.disconnect();
//         res.status(200).json({response: 'Transaction has been submitted'});

//     } catch (error) {
//         console.error(`Failed to submit transaction: ${error}`);
//         res.status(400).json(error);
//     }   
// });

// server start
app.listen(PORT, HOST);
console.log(`Running on http://${HOST}:${PORT}`);
