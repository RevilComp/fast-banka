const axios = require('axios');
let data = JSON.stringify({
  "apikey": "Zqc36UMK7l12adg6us53WgiZ5GZXHpienu",
  "amount": 200,
  "fullname": "Faruk Test",
  "userdata": "farukk2",
  "callback_url": "https://callbackurl.com/api/xxx",
  "bank_id": 0,
  "hash": "9d0d8922189e3e0d52425a5b3b5ruae468048d620av27b3b9f216bde9e7cc2d49a3f90feb4c",
  "transaction_id": "123456",
  "description": "test mesajı"
});

let config = {
  method: 'post',
  maxBodyLength: Infinity,
  url: 'http://localhost:3001/api/entegrations/scashmoney/papara/deposit',
  headers: { 
    'Content-Type': 'application/json'
  },
  data : data
};

for (let i = 0; i < 100; i++) {
  axios.request(config)
  .then((response) => {
    console.log(JSON.stringify(response.data));
  })
  .catch((error) => {
    console.log(error);
  });
}
