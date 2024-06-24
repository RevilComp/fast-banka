import { useState } from "react";
import logo from "../logo.png";
import Container from "../components/ui/Container";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
// import Sidebar from "../components/ui/Sidebar";
import DocsSidebar from "../components/ui/DocsSidebar";

const DocsPageBanka = () => {
  const [language, setLanguage] = useState("javascript");

  const [docsSidebar, setDocsSidebar] = useState(false);

  const handleDocsSidebar = () => setDocsSidebar(!docsSidebar);

  return (
    <>
      <div className="lg:grid lg:grid-cols-12 overflow-x-hidden relative h-screen">
        <nav className="bg-secondary hidden sticky top-0 left-0 col-span-3 h-screen z-50 lg:block">
          <Container>
            <Link
              to={"/"}
              className="block border-b border-gray-700 py-6 mb-12"
            >
              <img src={logo} alt="Logo" className="w-24" />
            </Link>
            <ul>
              <li className="mb-4">
                <a
                  className="text-gray-400 hover:text-white text-sm font-bold"
                  href="#credits"
                >
                  Credits
                </a>
              </li>
              <li className="mb-4">
                <a
                  className="text-gray-400 hover:text-white text-sm font-bold"
                  href="#parameter-credits"
                >
                  Parameters and Descriptons
                </a>
              </li>
              <li className="mb-4">
                <a
                  className="text-gray-400 hover:text-white text-sm font-bold"
                  href="#callback-mechanism"
                >
                  Callback Mechanism
                </a>
              </li>
              <li className="mb-4">
                <a
                  className="text-gray-400 hover:text-white text-sm font-bold"
                  href="#transaction-by-transactionUid"
                >
                  Get Transaction by transactionUid
                </a>
              </li>
              <li className="mb-4">
                <a
                  className="text-gray-400 hover:text-white text-sm font-bold"
                  href="#bank-withdraw"
                >
                  Bank Withdraw
                </a>
              </li>
              <li className="mb-4">
                <a
                  className="text-gray-400 hover:text-white text-sm font-bold"
                  href="#bank-deposit"
                >
                  Bank Deposit
                </a>
              </li>
            </ul>
          </Container>
        </nav>
        <div className="col-span-12 lg:col-span-9">
          <Container>
            <div className="flex justify-between mb-12 py-6">
              <FontAwesomeIcon
                icon={faBars}
                size="lg"
                className="lg:hidden text-dark cursor-pointer"
                onClick={handleDocsSidebar}
              />
              <select
                name="user-type"
                id="user-type"
                className="rounded-md border-gray-300 lg:ms-auto"
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
              >
                <option value="">Select Language</option>
                <option value="javascript">JavaScript</option>
                <option value="nodejs">NodeJS</option>
                <option value="python">Python</option>
                <option value="php">PHP</option>
              </select>
            </div>
            <div id="credits">
              <h1 className="font-bold font-md">Credits:</h1>
              <br />
              <div className="overflow-x-auto">
                <table className="table-auto w-full rounded-md">
                  <thead className="bg-secondary text-white">
                    <tr>
                      <th className="px-4 py-2">Key</th>
                      <th className="px-4 py-2">Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="border px-4 py-2">firm_key</td>
                      <td className="border px-4 py-2">
                        6675a5153858d3634cc262e9
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">website</td>
                      <td className="border px-4 py-2">
                        <p className="text-dark">https://yourwebsite.com</p>
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">secretKey</td>
                      <td className="border px-4 py-2">1OaKUoxIGXKIgN9</td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">secretId</td>
                      <td className="border px-4 py-2">
                        6675a4f935dd8d139ec2156a
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">hash</td>
                      <td className="border px-4 py-2">
                        4d78c4c6b9bb5a191db8cd9bdf23292405e9f9c11a8354789decebc36e92bc5d
                      </td>
                    </tr>
                    <tr>
                      <td className="border px-4 py-2">privateKey</td>
                      <td className="border px-4 py-2">
                        b51c5cd8-3727-4a4a-8d49-070fb2cb7a67
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div id="parameter-credits">
              <h1 className="font-bold font-md  mt-10">
                Parameters and Descriptons:
              </h1>
              <br />
              <div className="overflow-x-auto">
                <table className="table-auto w-full rounded-md">
                  <thead className="bg-secondary text-white">
                    <tr>
                      <th className="px-4 py-2">Parameter Name</th>
                      <th className="px-4 py-2">Value Type</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2">firm_key</td>
                      <td className="px-4 py-2">String</td>
                      <td className="px-4 py-2">
                        The firm key is yur firm key to authorize transactions.
                      </td>
                      <td className="px-4 py-2">660188c420b04635af276227</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">website</td>
                      <td className="px-4 py-2">URL</td>
                      <td className="px-4 py-2">
                        Website URL only for identification
                      </td>
                      <td className="px-4 py-2">https://yourwebsite.com</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">user_name_surname</td>
                      <td className="px-4 py-2">String</td>
                      <td className="px-4 py-2">User's full name</td>
                      <td className="px-4 py-2">Adam Eve</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">user_id</td>
                      <td className="px-4 py-2">Int</td>
                      <td className="px-4 py-2">
                        The user indetification number/string that is your from
                        website in order to indetifying transactions pf your
                        users
                      </td>
                      <td className="px-4 py-2">67219</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">callback</td>
                      <td className="px-4 py-2">String</td>
                      <td className="px-4 py-2">
                        The Callback when transaction has failed or approved
                        from panel.{" "}
                        <span className="font-bold">(We use Post Request)</span>
                      </td>
                      <td className="px-4 py-2">
                        ttps://yourwebsite.com/transaction
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">transaction_id</td>
                      <td className="px-4 py-2">string</td>
                      <td className="px-4 py-2">
                        If you have transaction id on yoursystem you can add it
                        and show it on the panel
                      </td>
                      <td className="px-4 py-2">TR-4o22390</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">hash</td>
                      <td className="px-4 py-2">string</td>
                      <td className="px-4 py-2">
                        The hash iss required for th API. You need to hash
                        generate hash using SHA'%& with you frim_key and sallt{" "}
                      </td>
                      <td className="px-4 py-2">
                        4d78c4c6b9bb5a191db8cd9bdf23292405e9f9c11a8354789decebc36e92bc5d
                      </td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">amount</td>
                      <td className="px-4 py-2">Int</td>
                      <td className="px-4 py-2">The amount of transaction</td>
                      <td className="px-4 py-2">200</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div id="callback-mechanism">
              <h1 className="font-bold font-md  mt-10">
                Callback Mechanism:{" "}
                <span className="font-normal">
                  You can get status callback when the transaction is approved
                  or rejected from web panel. Please provide your API endpoint
                  with POST request.
                </span>
              </h1>
              <div className="bg-secondary p-5 rounded-md ">
                <div className="nav flex justify-between text-white">
                  <h1>
                    <span className="bg-primary p-5 rounded-md ml-[-20px]">
                      POST
                    </span>{" "}
                    <span className="text primary ml-5">
                      https://yoursite-url.com/transaction
                    </span>
                  </h1>
                </div>
              </div>

              <br />
              <div className="overflow-x-auto">
                <table className="table-auto w-full rounded-md">
                  <thead className="bg-secondary text-white">
                    <tr>
                      <th className="px-4 py-2">Parameter Name</th>
                      <th className="px-4 py-2">Value Type</th>
                      <th className="px-4 py-2">Description</th>
                      <th className="px-4 py-2">Example</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td className="px-4 py-2">type</td>
                      <td className="px-4 py-2">String</td>
                      <td className="px-4 py-2">"deposit" or "withdraw"</td>
                      <td className="px-4 py-2">deposit</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">user_id</td>
                      <td className="px-4 py-2">String</td>
                      <td className="px-4 py-2">
                        Transaction id from your website. Its must be Unique
                      </td>
                      <td className="px-4 py-2">19867278</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">transaction_id</td>
                      <td className="px-4 py-2">String</td>
                      <td className="px-4 py-2">
                        Transaction id from your website
                      </td>
                      <td className="px-4 py-2">189349939</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">user_name_surname</td>
                      <td className="px-4 py-2">String</td>
                      <td className="px-4 py-2">User's fullname</td>
                      <td className="px-4 py-2">Adam Eve</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">status</td>
                      <td className="px-4 py-2">String</td>
                      <td className="px-4 py-2">
                        Transaction status. "fail" or "success"
                      </td>
                      <td className="px-4 py-2">success</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">transactionUid</td>
                      <td className="px-4 py-2">string</td>
                      <td className="px-4 py-2">
                        If you have transaction id on yoursystem you can add it
                        and show it on the panel
                      </td>
                      <td className="px-4 py-2">TR-4o22390</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">hash</td>
                      <td className="px-4 py-2">string</td>
                      <td className="px-4 py-2">
                        The kid of transaction. It must be uniqie{" "}
                      </td>
                      <td className="px-4 py-2">1567657856897</td>
                    </tr>
                    <tr>
                      <td className="px-4 py-2">amount</td>
                      <td className="px-4 py-2">Int</td>
                      <td className="px-4 py-2">The amount of transaction</td>
                      <td className="px-4 py-2">200</td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div className="bg-secondary rounded-md mt-5">
                <pre>
                  {language === "javascript" && (
                    <code className="text-white">
                      {`
                      const postData = {
                          type: 'deposit',
                          user_id: '19867278',
                          transaction_id: '19867278',
                          user_name_surname: 'Adam Eve',
                          status: 'success',
                          transactionUid: 'TR-4o22390',
                          amount: 200
                      };
          
                      const url = 'https://yoursite-url.com/transaction';
          
                      fetch(url, {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(postData)
                      })
                      .then(response => {
                          if (!response.ok) {
                              throw new Error('Network response was not ok');
                          }
                          return response.json();
                      })
                      .then(data => {
                          console.log('Response:', data);
                      })
                      .catch(error => {
                      console.error('Failed:', error); 
                  });`}
                    </code>
                  )}

                  {language === "nodejs" && (
                    <code className="text-white">
                      {`
                      const axios = require('axios');

                      const postData = {
                          type: 'deposit',
                          user_id: '19867278',
                          transaction_id: '19867278',
                          user_name_surname: 'Adam Eve',
                          status: 'success',
                          transactionUid: 'TR-4o22390',
                          amount: 200
                      };
                      
                      const url = 'https://yoursite-url.com/transaction';
                      
                      axios.post(url, postData, {
                          headers: {
                              'Content-Type': 'application/json', // Veri tipi JSON olarak belirtiliyor
                          }
                      })
                      .then(response => {
                          console.log('Sunucudan gelen yanıt:', response.data); // Sunucudan gelen yanıtı konsola yazdırma
                      })
                      .catch(error => {
                          console.error('Hata oluştu:', error); // Hata durumunda konsola hata yazdırma
                      });
                      `}
                    </code>
                  )}

                  {language === "python" && (
                    <code className="text-white">
                      {`
                      import requests
                      import json
                      
                      postData = {
                          'type': 'deposit',
                          'user_id': '19867278',
                          'transaction_id': '19867278',
                          'user_name_surname': 'Adam Eve',
                          'status': 'success',
                          'transactionUid': 'TR-4o22390',
                          'amount': 200
                      }
                      
                      url = 'https://yoursite-url.com/transaction'
                      
                      headers = {'Content-Type': 'application/json'}
                      
                      try:
                          response = requests.post(url, data=json.dumps(postData), headers=headers)
                          response.raise_for_status()
                          responseData = response.json()
                          print('Response:', responseData)
                      except requests.exceptions.RequestException as e:
                          print('Failed:', e)
                      
                      `}
                    </code>
                  )}

                  {language === "php" && (
                    <code className="text-white">
                      {`
                      <?php

                      $postData = array(
                          'type' => 'deposit',
                          'user_id' => '19867278',
                          'transaction_id' => '19867278',
                          'user_name_surname' => 'Adam Eve',
                          'status' => 'success',
                          'transactionUid' => 'TR-4o22390',
                          'amount' => 200
                      );
                      
                      $url = 'https://yoursite-url.com/transaction';
                      
                      $payload = json_encode($postData);
                      
                      $ch = curl_init($url);
                      curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
                      curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
                      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                      
                      $response = curl_exec($ch);
                      curl_close($ch);
                      
                      if ($response === false) {
                          echo 'Failed: ' . curl_error($ch);
                      } else {
                          $responseData = json_decode($response, true);
                          echo 'Response: ' . print_r($responseData, true);
                      }
                      ?>
                      
                      `}
                    </code>
                  )}
                </pre>
              </div>
            </div>
            <div id="transaction-by-transactionUid">
              <h1 className="font-bold mt-5 mb-1">
                Get Transaction by transactionUid:{" "}
                <span className="font-normal">
                  {" "}
                  When you have callback with transaction uniqiue id you can get
                  details about transactions
                </span>
              </h1>
              <div className="bg-secondary p-5 rounded-md ">
                <div className="nav flex justify-between text-white">
                  <h1>
                    <span className="bg-primary p-5 rounded-md ml-[-20px]">
                      GET
                    </span>{" "}
                    <span className="text primary ml-5">
                      https://finfastpay.com/api/entegration/transaction?transactionUid=transactionUid
                    </span>
                  </h1>
                </div>
              </div>
              <div className="bg-secondary rounded-md mt-6">
                <pre>
                  {language === "javascript" && (
                    <code className="text-white">
                      {`
                            const transactionUid = 'Ukkldyttrhndtkvıkj314f0';

                            const url = "https://finfastpay.com/api/entegration/transaction?transactionUid=", transactionUid;
                            
                            fetch(url)
                              .then(response => {
                                if (!response.ok) {
                                  throw new Error('Network response was not ok');
                                }
                                return response.json();
                              })
                              .then(data => {
                                console.log('Response:', data);
                              })
                              .catch(error => {
                                console.error('Hata oluştu:', error);
                            });
                      `}
                    </code>
                  )}

                  {language === "nodejs" && (
                    <code className="text-white">
                      {`
                        const axios = require('axios');

                        const transactionUid = 'Ukkldyttrhndtkvıkj314f0';
                        
                        const url = "https://finfastpay.com/api/entegration/transaction?transactionUid=", transactionUid;
                        
                        axios.get(url)
                          .then(response => {
                            console.log('Response:', response.data);
                          })
                          .catch(error => {
                            console.error('Hata oluştu:', error);
                          });
                        
                      `}
                    </code>
                  )}

                  {language === "python" && (
                    <code className="text-white">
                      {`
                      import requests

                      transactionUid = 'Ukkldyttrhndtkvıkj314f0'
                      
                      url = f"https://finfastpay.com/api/entegration/transaction?transactionUid={transactionUid}"
                      
                      try:
                          response = requests.get(url)
                          response.raise_for_status()
                          responseData = response.json()
                          print('Response:', responseData)
                      except requests.exceptions.RequestException as e:
                          print('Failed:', e)  # Hata durumunda hatayı yazdır
                      
                      
                      `}
                    </code>
                  )}

                  {language === "php" && (
                    <code className="text-white">
                      {`
                      <?php

                      $transactionUid = 'Ukkldyttrhndtkvıkj314f0';
                      
                      $url = 'https://finfastpay.com/api/entegration/transaction?transactionUid=' . urlencode($transactionUid);
                      
                      try {
                          $response = file_get_contents($url); // URL'yi oku ve içeriği al
                          if ($response === false) {
                              throw new Exception('Failed to fetch data from URL');
                          }
                          $responseData = json_decode($response, true); // JSON veriyi diziye dönüştür
                          echo 'Response: ' . print_r($responseData, true); // Sunucudan gelen yanıtı yazdır
                      } catch (Exception $e) {
                          echo 'Hata oluştu: ' . $e->getMessage(); // Hata durumunda hatayı yazdır
                      }
                      
                      ?>
                      
                      
                      `}
                    </code>
                  )}
                </pre>
              </div>
            </div>
            <div id="bank-withdraw">
              <h1 className="font-bold mt-5 mb-1">Bank Withdraw:</h1>
              <div className="bg-secondary p-5 rounded-md ">
                <div className="nav flex justify-between text-white">
                  <h1>
                    <span className="bg-primary p-5 rounded-md ml-[-20px]">
                      POST
                    </span>{" "}
                    <span className="text primary ml-5">
                      https://finfastpay.com/api/transactions/makewithdrawrequest
                    </span>
                  </h1>
                </div>
              </div>
              <div className="bg-secondary rounded-md mt-5">
                <pre>
                  {language === "javascript" && (
                    <code className="text-white">
                      {`
                      const postData = {
                          user_id: '19867278',
                          nameSurname: 'Adam Eve',
                          websites: 'https://yourwebsites.com',
                          bankAccount: {
                            'bankName': 'Bank Name',
                            'iban': 'IBAN NO',
                            'accountNumber': '23467',
                            'nameSurname': 'Adam Eve',
                            'callback': 'https://yoursiteurl.com/success',
                            'transaction_id': '4557645789',
                            'hash': '4d78c4c6b9bb5a191db8cd9bdf23292405e9f9c11a8354789decebc36e92bc5d' // SHA256 (firm_key + "havaleode.com")
                          },
                          ipadress: '127.0.0.1',
                          transaction_time: Date.now(),
                          amount: 200
                      };
          
                      const url = 'https://finfastpay.com/api/transactions/makewithdrawrequest';
          
                      fetch(url, {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(postData)
                      })
                      .then(response => {
                          if (!response.ok) {
                              throw new Error('Network response was not ok');
                          }
                          return response.json();
                      })
                      .then(data => {
                          console.log('Response:', data);
                      })
                      .catch(error => {
                      console.error('Failed:', error); 
                  });`}
                    </code>
                  )}

                  {language === "nodejs" && (
                    <code className="text-white">
                      {`
                      const axios = require('axios');

                      const postData = {
                          user_id: '19867278',
                          unameSurname: 'Adam Eve',
                          websites: 'https://yourwebsites.com',
                          bankAccount: {
                              'bankName': 'Bank Name',
                              'iban': 'IBAN NO',
                              'accountNumber': '23467',
                              'nameSurname': 'Adam Eve',
                              'callback': 'https://yoursiteurl.com/success',
                              'transaction_id': '4557645789',
                              'hash': '4d78c4c6b9bb5a191db8cd9bdf23292405e9f9c11a8354789decebc36e92bc5d' // SHA256 (firm_key + "havaleode.com")
                          },
                          ipadress: '127.0.0.1',
                          transaction_time: Date.now(),
                          amount: 200
                      };
                      
                      const url = 'https://finfastpay.com/api/transactions/makewithdrawrequest';
                      
                      axios.post(url, postData, {
                          headers: {
                              'Content-Type': 'application/json'
                          }
                      })
                      .then(response => {
                          console.log('Response:', response.data);
                      })
                      .catch(error => {
                          console.error('Failed:', error);
                      });
                      
                      `}
                    </code>
                  )}

                  {language === "python" && (
                    <code className="text-white">
                      {`
                      import requests
                      import json
                      from datetime import datetime
                      
                      postData = {
                          'user_id': '19867278',
                          'unameSurname': 'Adam Eve',
                          'websites': 'https://yourwebsites.com',
                          'bankAccount': {
                              'bankName': 'Bank Name',
                              'iban': 'IBAN NO',
                              'accountNumber': '23467',
                              'nameSurname': 'Adam Eve',
                              'callback': 'https://yoursiteurl.com/success',
                              'transaction_id': '4557645789',
                              'hash': '4d78c4c6b9bb5a191db8cd9bdf23292405e9f9c11a8354789decebc36e92bc5d'  # SHA256 (firm_key + "havaleode.com")
                          },
                          'ipadress': '127.0.0.1',
                          'transaction_time': datetime.now().timestamp() * 1000,  # Convert to milliseconds
                          'amount': 200
                      }
                      
                      url = 'https://finfastpay.com/api/transactions/makewithdrawrequest'
                      
                      headers = {'Content-Type': 'application/json'}
                      
                      try:
                          response = requests.post(url, json=postData, headers=headers)
                          response.raise_for_status()  # Hata durumunda istisna oluştur
                          responseData = response.json()  # Sunucudan gelen yanıtı JSON olarak ayrıştır
                          print('Response:', responseData)  # Sunucudan gelen yanıtı yazdır
                      except requests.exceptions.RequestException as e:
                          print('Failed:', e)  # Hata durumunda hatayı yazdır
                      
                      `}
                    </code>
                  )}

                  {language === "php" && (
                    <code className="text-white">
                      {`
                      <?php

                      $postData = array(
                          'user_id' => '19867278',
                          'unameSurname' => 'Adam Eve',
                          'websites' => 'https://yourwebsites.com',
                          'bankAccount' => array(
                              'bankName' => 'Bank Name',
                              'iban' => 'IBAN NO',
                              'accountNumber' => '23467',
                              'nameSurname' => 'Adam Eve',
                              'callback' => 'https://yoursiteurl.com/success',
                              'transaction_id' => '4557645789',
                              'hash' => '4d78c4c6b9bb5a191db8cd9bdf23292405e9f9c11a8354789decebc36e92bc5d' // SHA256 (firm_key + "havaleode.com")
                          ),
                          'ipadress' => '127.0.0.1',
                          'transaction_time' => round(microtime(true) * 1000),
                          'amount' => 200
                      );
                      
                      $url = 'https://finfastpay.com/api/transactions/makewithdrawrequest';
                      
                      $payload = json_encode($postData);
                      
                      $ch = curl_init($url); 
                      curl_setopt($ch, CURLOPT_POSTFIELDS, $payload); 
                      curl_setopt($ch, CURLOPT_HTTPHEADER, array('Content-Type:application/json'));
                      curl_setopt($ch, CURLOPT_RETURNTRANSFER, true); 
                      
                      $response = curl_exec($ch); 
                      if ($response === false) {
                          echo 'Failed: ' . curl_error($ch);
                      } else {
                          $responseData = json_decode($response, true);
                          echo 'Response: ' . print_r($responseData, true);
                      }
                      
                      curl_close($ch);
                      
                      ?>
                      
                      
                      `}
                    </code>
                  )}
                </pre>
              </div>
            </div>
            <div id="bank-deposit">
              <h1 className="font-bold mt-5 mb-1">Bank Deposit:</h1>
              <div className="bg-secondary p-5 rounded-md ">
                <div className="nav flex justify-between text-white">
                  <h1>
                    <span className="bg-primary p-5 rounded-md ml-[-20px]">
                      POST
                    </span>{" "}
                    <span className="text primary ml-5">
                      https://finfastpay.com/api/entegration/createdeposit
                    </span>
                  </h1>
                </div>
              </div>
              <div className="bg-secondary rounded-md mt-5">
                <pre>
                  {language === "javascript" && (
                    <code className="text-white">
                      {`
                      const postData = {
                        firm_key: “660188c420b04635af276227”, 
                        website: "https://test.com",
                        user_name_surname: “Adam Eve,
                        user_id: ”29534",
                        callback: “https://webhook.site/8b4f341c-4bdd-46e2-b9c6-7cdc7815af7d",
                        transaction_id: “A2233”,
                        hash:"4d78c4c6b9bb5a191db8cd9bdf23292405e9f9c11a8354789decebc36e92bc5d",
                        amount: 405
                      };
          
                      const url = 'https://finfastpay.com/api/entegration/createdeposit';
          
                      fetch(url, {
                          method: 'POST',
                          headers: {
                              'Content-Type': 'application/json',
                          },
                          body: JSON.stringify(postData)
                      })
                      .then(response => {
                          if (!response.ok) {
                              throw new Error('Network response was not ok');
                          }
                          return response.json();
                      })
                      .then(data => {
                          console.log('Response:', data);
                      })
                      .catch(error => {
                      console.error('Failed:', error); 
                  });`}
                    </code>
                  )}

                  {language === "nodejs" && (
                    <code className="text-white">
                      {`
                      const axios = require('axios');

                      const postData = {
                          firm_key: "660188c420b04635af276227",
                          website: "https://test.com",
                          user_name_surname: "Adam Eve",
                          user_id: "29534",
                          callback: "https://webhook.site/8b4f341c-4bdd-46e2-b9c6-7cdc7815af7d",
                          transaction_id: "A2233",
                          hash: "4d78c4c6b9bb5a191db8cd9bdf23292405e9f9c11a8354789decebc36e92bc5d",
                          amount: 405
                      };
                      
                      const url = 'https://finfastpay.com/api/entegration/createdeposit';
                      
                      axios.post(url, postData, {
                          headers: {
                              'Content-Type': 'application/json',
                          }
                      })
                      .then(response => {
                          console.log('Response:', response.data);
                      })
                      .catch(error => {
                          console.error('Failed:', error);
                      });
                      
                      
                      `}
                    </code>
                  )}

                  {language === "python" && (
                    <code className="text-white">
                      {`
                      import requests
                      import json
                      
                      postData = {
                          "firm_key": "660188c420b04635af276227",
                          "website": "https://test.com",
                          "user_name_surname": "Adam Eve",
                          "user_id": "29534",
                          "callback": "https://webhook.site/8b4f341c-4bdd-46e2-b9c6-7cdc7815af7d",
                          "transaction_id": "A2233",
                          "hash": "4d78c4c6b9bb5a191db8cd9bdf23292405e9f9c11a8354789decebc36e92bc5d",
                          "amount": 405
                      }
                      
                      url = 'https://finfastpay.com/api/entegration/createdeposit'
                      
                      headers = {
                          'Content-Type': 'application/json'
                      }
                      
                      try:
                          response = requests.post(url, json=postData, headers=headers)
                          response.raise_for_status()  # Raise an error for bad responses
                          data = response.json()
                          print('Response:', data)
                      except requests.exceptions.HTTPError as http_err:
                          print('HTTP error occurred:', http_err)
                      except Exception as err:
                          print('Error occurred:', err)
                      
                      
                      `}
                    </code>
                  )}

                  {language === "php" && (
                    <code className="text-white">
                      {`
                      <?php

                      $postData = array(
                          'firm_key' => '660188c420b04635af276227',
                          'website' => 'https://test.com',
                          'user_name_surname' => 'Adam Eve',
                          'user_id' => '29534',
                          'callback' => 'https://webhook.site/8b4f341c-4bdd-46e2-b9c6-7cdc7815af7d',
                          'transaction_id' => 'A2233',
                          'hash' => '4d78c4c6b9bb5a191db8cd9bdf23292405e9f9c11a8354789decebc36e92bc5d',
                          'amount' => 405
                      );
                      
                      $url = 'https://finfastpay.com/api/entegration/createdeposit';
                      
                      $options = array(
                          'http' => array(
                              'header' => "Content-type: application/json\r\n",
                              'method' => 'POST',
                              'content' => json_encode($postData)
                          )
                      );
                      
                      $context = stream_context_create($options);
                      $response = file_get_contents($url, false, $context);
                      
                      if ($response === FALSE) {
                          echo 'Error: Unable to connect to the API.';
                      } else {
                          $responseData = json_decode($response, TRUE);
                          print_r('Response: ' . print_r($responseData, true));
                      }
                      
                      ?>
                    `}
                    </code>
                  )}
                </pre>
              </div>
            </div>
          </Container>
        </div>
      </div>
      <DocsSidebar show={docsSidebar} handleSidebar={handleDocsSidebar} />
    </>
  );
};

export default DocsPageBanka;
