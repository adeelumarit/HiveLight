import * as React from "react";
import { useState, useEffect } from "react";
import { jwtDecode } from "jwt-decode";

// import jwt from 'jsonwebtoken';
const Main = () => {
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSideNavOpen, setisSideNavOpen] = useState(false);
  const [mattersData, setmattersData] = useState([])
  const [token, settoken] = useState([])
  const [isTokenRefreshing, setTokenRefreshing] = useState(false);
  const [milestoneNames, setmilestoneNames] = useState([])
  const [showMatters, setshowMatters] = useState(false)
  const [isMatterSelected, setisMatterSelected] = useState(false)
  const [selectedMatter, setSelectedMatter] = useState("");
  const [Selectedmatterid, setSelectedmatterid] = useState("");
  const [CurrentMilestone, setCurrentMilestone] = useState("");

  const [loaderSpinner, setloaderSpinner] = useState("");
  const [searchInput, setSearchInput] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [showlistView, setshowlistView] = useState(false);


  let baseUrl = "https://app-staging.hivelight.com/";




  Office.onReady(function (info) {
    // Office is ready

    // Assign event handler for when the item changes (e.g., when reading a different email)

  });


  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };
  const togleSideNav = () => {
    setisSideNavOpen(!isSideNavOpen);
  };


  useEffect(() => {
    // Fetch the Matter
    let BearerToken = window.localStorage.getItem("Token");
    BearerToken = JSON.parse(BearerToken);
    const decoded = jwtDecode(BearerToken);

    console.log(decoded);
    // const decodedToken = jwt.verify(BearerToken, 'your_secret_key');
    settoken(BearerToken)

    var myHeaders = new Headers();
    myHeaders.append("Authorization", "Bearer " + BearerToken);

    var requestOptions = {
      method: 'GET',
      headers: myHeaders,
      redirect: 'follow'
    };

    fetch(baseUrl + "v1/matters", requestOptions)
      .then(response => response.json())
      .then(result => {
        console.log(result)
        let data = result.data
        setmattersData(data)
        setshowMatters(true);

        // let milestone = []
        // for (let i = 0; i < data.length; i++) {
        //   milestone.push(data[i].attributes.milestoneStatus.currentMilestone.name)
        //   console.log(data[i].attributes.milestoneStatus.currentMilestone.name)
        // }
        // setmilestoneNames(milestone);


      }

      )
      .catch(error => console.log('error', error));
  }, []);

  ///   Refresg  Token Functionality
  useEffect(() => {
    // Function to check and refresh token if needed
    const checkAndRefreshToken = async () => {
      const decodedToken = jwt.decode(token);

      // Check if the token is expired or about to expire
      if (decodedToken && decodedToken.exp * 1000 < Date.now() + 300000) { // 300000 milliseconds (5 minutes) before expiration
        // Token is expired or about to expire, refresh it
        setTokenRefreshing(true);

        try {
          // Make a request to the refresh endpoint with your current refresh token
          const response = await axios.post(baseUrl + 'v1/identities/refresh', {
            "meta": {
              "token": token
            }
          });

          // Update the token in your application with the new access token
          const newToken = response.data.meta.token;
          settoken(newToken);
        } catch (error) {
          console.error('Error refreshing token:', error.message);
          // Handle refresh failure, e.g., redirect to login page
        } finally {
          setTokenRefreshing(false);
        }
      }
    };

    // Call the function on component mount
    checkAndRefreshToken();
  }, [token]);


  // useEffect(() => {

  //   {
  //     mattersData.map((item, index) => {
  //       // Access the current milestone name within attributes
  //       const currentMilestoneName = item.attributes.currentMilestone.name;

  //       console.log(currentMilestoneName)

  //     })
  //   }

  // }, []);


  const CreateMatter = () => {

    Office.context.ui.displayDialogAsync(`https://localhost:3000/assets/NewMatter.html?token=${token}`, { height: 80, width: 70 });

  }


  const handleItemClick = (itemId) => {
    console.log(`Clicked item ID: ${itemId}`);
    Office.context.ui.displayDialogAsync(`https://localhost:3000/assets/MatterDetails.html?id=${itemId}&token=${token}`, { height: 80, width: 70 });

  };

  const signout = () => {

    window.localStorage.clear("Token")
    let BearerToken = window.localStorage.getItem("Token");
    if (BearerToken == "" || BearerToken == null) {
      window.location.reload()
    }

  }




  const handleSearch = () => {
    setisMatterSelected(false)
    setloaderSpinner(true);

    setTimeout(() => {
      const results = mattersData.filter(item => item.attributes.name.toLowerCase().includes(searchInput.toLowerCase()));
      setSearchResults(results);
      if (searchResults) {

        setshowlistView(true)
        setloaderSpinner(false)

      } else {

        setshowlistView(false)
        setloaderSpinner(false)


      }
    }, 2000);
  };







  const selectMatter = (selectedMatterData) => {
    console.log(selectedMatterData)
    //console.log(selectedMatterData.attributes.milestoneStatus.currentMilestone.name)
    setSelectedmatterid(selectedMatterData.id)
    setSelectedMatter(selectedMatterData);
    setCurrentMilestone(selectedMatterData.attributes.milestoneStatus.currentMilestone.name);

    // console.log(selectedMatter.attributes.milestoneStatus.currentMilestone.name)
    setisMatterSelected(true)
    setshowlistView(false)
  }
  const canceltask = () => {
    setisMatterSelected(false)
    setshowlistView(true)
  }


  const childDialog=null
  const createTask = () => {
    // Create TaskObject with initial values
    let TaskObject = {
      matterid: Selectedmatterid,
      subject: "",
      mailBody: "",
      token: ""
    };

    // Retrieve email subject
    const subject = Office.context.mailbox.item.subject;
    TaskObject.subject = subject;
    console.log('Email Subject:', subject);

    // Retrieve email body as text
    Office.context.mailbox.item.body.getAsync(Office.CoercionType.Text, function (result) {
      if (result.status === Office.AsyncResultStatus.Succeeded) {
        const bodyText = result.value;
        console.log('Email Body:', bodyText);
        TaskObject.mailBody = bodyText;
        TaskObject.token = token;

let subject=TaskObject.subject
let emailbody=TaskObject.mailBody

        if (bodyText) {
          // Set the token value

          // Display the dialog
          Office.context.ui.displayDialogAsync(`https://localhost:3000/assets/CreateTask.html?subject=${subject}&emailbody=${emailbody}`, { width: 60, height: 80 }, async function (result) {
            if (result.status === Office.AsyncResultStatus.Succeeded) {
             childDialog = result.value;

              // Add event handler for DialogMessageReceived
              childDialog.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);

              setTimeout(() => {
                const messageToDialog = JSON.stringify({
                  name: "My Sheet",
                  position: 2
                });

                childDialog.messageChild(messageToDialog);
              }, 3000);


              // setTimeout(() => {
              //   const messageToDialog = JSON.stringify(TaskObject);
              //   childDialog.messageChild(messageToDialog);
              //   console.log("Data sent to the dialog");
              // }, 5000);
              // Convert TaskObject to JSON and send it to the dialog

            } else {
              console.error('Error displaying dialog:', result.error.message);
            }
          });
        }
      } else {
        console.error('Error getting email body:', result.error.message);
      }
    });
  };

  // Event handler for DialogMessageReceived
  function processMessage(args) {
    childDialog.close();

    // const childDialog = args.source;

    const messageFromParent = args.message;

    // Process the message from the parent as needed
    console.log('Message from parent:', messageFromParent);

    // Add your logic to handle the received message on the child page
  }

  // Call the createTask function

  // const createTask = () => {
  //   let TaskObject = {
  //     matterid: Selectedmatterid,
  //     subject: "",
  //     mailBody: "",
  //     token: ""

  //   }
  //   TaskObject.token = token


  //   // Retrieve email subject
  //   const subject = Office.context.mailbox.item.subject;
  //   TaskObject.subject = subject;
  //   console.log('Email Subject:', subject);

  //   // Retrieve email body as text
  //   Office.context.mailbox.item.body.getAsync(Office.CoercionType.Text, function (result) {
  //     if (result.status === Office.AsyncResultStatus.Succeeded) {
  //       const bodyText = result.value;
  //       console.log('Email Body:', bodyText);
  //       TaskObject.mailBody = bodyText;

  //       if (bodyText) {
  //         Office.context.ui.displayDialogAsync('https://localhost:3000/assets/CreateTask.html', { width: 60, height: 80 }, async function (result) {
  //           childDialog = result.value;
  //           childDialog.addEventHandler(Office.EventType.DialogMessageReceived, processMessage);

  //           const messageToDialog = JSON.stringify(TaskObject);

  //           childDialog.messageChild(messageToDialog);
  //           console.log("data sent");
  //         });
  //       }
  //     } else {
  //       console.error('Error getting email body:', result.error.message);
  //     }
  //   });

  //   console.log(TaskObject)

  //   // function SetTaskObject() {
  //   //   setTimeout(() => {


  //   //   }, 4000);

  //   //}
  //   // Event handler for DialogMessageReceived
  //   function processMessage(args) {
  //     childDialog.close();

  //     const messageFromParent = args.message;

  //     // Process the message from the parent as needed
  //     console.log('Message from parent:', messageFromParent);

  //     // Add your logic to handle the received message on the child page
  //   }


  // }
  return (
    <div className=''>
      {loaderSpinner ? <>
        <div role="status" class="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
          <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-950" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
          <span class="sr-only">Loading...</span>
        </div></> : ""}

      <div className="sticky top-0" style={{ opacity: loaderSpinner ? 0.2 : 1 }}>
        <nav class="px-1  border-b dark:border-gray-700 border-gray-200 dark:bg-gray-900" style={{ backgroundColor: "aliceblue" }}>
          <div className='flex justify-center items-center space-x-2'>
            <i onClick={togleSideNav} class="fa fa-bars" aria-hidden="true" style={{ fontSize: "26px" }}></i>
            <input type="text" placeholder="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              style={{
                height: "41px",
              }}
              className="px-1  sm:text-xs py-1 bg-white border-2 border-gray-200 focus:border-blue-600 rounded outline-none" />
            <button type="button" onClick={handleSearch} class="h-10 mt-2 text-sm relative mr-4 text-gray-900 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-200 font-medium text-sm px-5 py-2.5 me-2 mb-2 dark:bg-gray-800 dark:text-white dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700" style={{
              position: "relative", right: "9px",
            }}>
              Search
            </button>

            <div className="">
              <button
                type="button"
                className="text-sm rounded-full md:me-0 focus:ring-4 focus:ring-gray-300 dark:focus:ring-gray-600"
                id="user-menu-button"
                aria-expanded={isUserDropdownOpen}
                onClick={toggleUserDropdown}
              >
                <span className="sr-only">Open user menu</span>
                <div className="w-8 h-8 rounded-full bg-white border border-gray-300 text-black flex items-center justify-center">
                  A {/* Text inside the div */}
                </div>
              </button>

              {isUserDropdownOpen && (
                <div style={{
                  position: "absolute",
                  marginLeft: "-110px"
                }} className="text-base list-none bg-white divide-y divide-gray-100 rounded-lg shadow dark:bg-gray-700 dark:divide-gray-600" id="user-dropdown">
                  <ul className="py-2" aria-labelledby="user-menu-button">
                    <li className="hover:border-blue-500 hover:bg-gray-100 p-2 hover:shadow-md hover:text-bold">
                      <a href="" className=" text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                        Profile
                      </a>
                    </li>
                    <li className="hover:border-blue-500 hover:bg-gray-100 p-2 hover:shadow-md hover:text-bold">
                      <a href="" className=" text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                        Manage Organization
                      </a>
                    </li>
                    <li className="hover:border-blue-500 hover:bg-gray-100 p-2 hover:shadow-md hover:text-bold">
                      <a href="" className=" text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                        Ask for Help
                      </a>
                    </li>
                    <li className="hover:border-blue-500 hover:bg-gray-100 p-2 hover:shadow-md hover:text-bold">
                      <a href="" className=" text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                        Support pages
                      </a>
                    </li>
                    <li onClick={signout} className="hover:border-blue-500 hover:bg-gray-100 p-2 hover:shadow-md hover:text-bold">
                      <a className=" text-sm text-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 dark:text-gray-200 dark:hover:text-white">
                        Sign out
                      </a>
                    </li>
                  </ul>
                </div>
              )}
            </div>
          </div>

        </nav>
      </div>
      <div>

        {/* // sidenavbar */}

        {isSideNavOpen ?
          <>

            <nav
              id="sidenav-5"
              class="fixed left-0 top-13 z-[1035] h-screen w-60 -translate-x-full overflow-hidden bg-white shadow-[0_4px_12px_0_rgba(0,0,0,0.07),_0_2px_4px_rgba(0,0,0,0.05)] data-[te-sidenav-hidden='false']:translate-x-0 dark:bg-zinc-800"
              style={{ backgroundColor: "#ebeef1" }}
              data-te-sidenav-init
              data-te-sidenav-hidden="false"
              data-te-sidenav-accordion="true">
              <ul class="relative m-0 list-none px-[0.2rem]" data-te-sidenav-menu-ref>
                <li onClick={CreateMatter} class="relative">
                  <a
                    class="flex h-12 cursor-pointer items-center truncate rounded-[5px] px-6 py-4 text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
                    data-te-sidenav-link-ref>
                    <span
                      class="mr-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gray-400 dark:[&>svg]:text-gray-300">
                      <i class="fa fa-plus" aria-hidden="true"></i>
                    </span>
                    <span>Matter</span>
                  </a>
                </li>

                <li class="relative">
                  <a
                    class="flex h-12 cursor-pointer items-center truncate rounded-[5px] px-6 py-4 text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
                    data-te-sidenav-link-ref>
                    <span
                      class="mr-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gray-400 dark:[&>svg]:text-gray-300">
                      <i class="fa fa-briefcase" aria-hidden="true"></i>
                    </span>
                    <span>All Matters</span>
                  </a>
                </li>

                <li class="relative">
                  <a
                    class="flex h-12 cursor-pointer items-center truncate rounded-[5px] px-6 py-4 text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
                    data-te-sidenav-link-ref>
                    <span
                      class="mr-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gray-400 dark:[&>svg]:text-gray-300">
                      <i class="fa fa-user-circle" aria-hidden="true"></i>
                    </span>
                    <span>My Matters</span>
                  </a>
                </li>
                <li class="relative">
                  <a
                    class="flex h-12 cursor-pointer items-center truncate rounded-[5px] px-6 py-4 text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
                    data-te-sidenav-link-ref>
                    <span
                      class="mr-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gray-400 dark:[&>svg]:text-gray-300">
                      <i class="fa fa-star-o" aria-hidden="true"></i>
                    </span>
                    <span>Stared</span>
                  </a>
                </li>
                <li class="relative">
                  <a
                    class="flex h-12 cursor-pointer items-center truncate rounded-[5px] px-6 py-4 text-[0.875rem] text-gray-600 outline-none transition duration-300 ease-linear hover:bg-slate-50 hover:text-inherit hover:outline-none focus:bg-slate-50 focus:text-inherit focus:outline-none active:bg-slate-50 active:text-inherit active:outline-none data-[te-sidenav-state-active]:text-inherit data-[te-sidenav-state-focus]:outline-none motion-reduce:transition-none dark:text-gray-300 dark:hover:bg-white/10 dark:focus:bg-white/10 dark:active:bg-white/10"
                    data-te-sidenav-link-ref>
                    <span
                      class="mr-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gray-400 dark:[&>svg]:text-gray-300">
                      <i class="fa fa-archive" aria-hidden="true"></i>
                    </span>
                    <span>Archived</span>
                  </a>
                </li>

              </ul>
            </nav>

            <hr></hr>
          </>
          : <></>
        }

        <div>


          {showMatters ?

            <>

              {isMatterSelected ? <>
                <div className=" rounded-lg mt-2 p-4">
                  <ul className="mt-4 w-11/12 ">

                    <li className="border border-gray-200 p-2 m-1 rounded transition duration-300 ease-in-out hover:bg-blue-200 cursor-pointer active:bg-blue-200 focus:outline-none focus:ring focus:ring-blue-200">
                      <a className="text-blue-500 hover:underline">{selectedMatter.attributes.name}</a>
                      <p>
                        {selectedMatter.attributes.statusMessage
                          ? selectedMatter.attributes.statusMessage.message
                          : "No status"
                        }
                      </p>
                    </li>

                  </ul>
                  <select id="countries" class="mt-2 bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-11/12 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500">
                    <option >Select Milestone</option>

                    <option selected value="US">{CurrentMilestone}</option>



                  </select>
                  <div className="flex space-between mt-2" >
                    <button class="bg-white hover:bg-gray-100 border-2 text-xs font-medium text-center text-black py-2 px-4 mr-5 rounded mt-1"
                      onClick={createTask}>    <span
                        class="mr-4 [&>svg]:h-4 [&>svg]:w-4 [&>svg]:text-gray-400 dark:[&>svg]:text-gray-300">
                        <i class="fa fa-plus text-gray-700 text-sm font-bold" aria-hidden="true"></i>
                      </span>
                      Create Task</button>
                    <button onClick={canceltask} style={{
                      marginLeft: "14%"
                    }} class="bg-white hover:bg-gray-100 border-2 text-xs font-medium text-center text-black py-2 px-4 mr-5 rounded mt-1">Cancel Task</button>
                  </div>
                </div>

              </> : <></>


              }
              {showlistView ? <>
                <ul className="mt-4">
                  {searchResults.map((result, index) => (
                    <li key={index} onClick={() => selectMatter(result)} className="border-b p-2 m-1 rounded transition duration-300 ease-in-out hover:bg-blue-200 cursor-pointer active:bg-blue-200 focus:outline-none focus:ring focus:ring-blue-200">
                      <a className="text-blue-500 hover:underline">{result.attributes.name}</a>
                      <p>
                        {result.attributes.statusMessage
                          ? result.attributes.statusMessage.message
                          : "No status"
                        }
                      </p>
                    </li>
                  ))}
                </ul>
              </> : <></>
              }

              {/* <div className="mt-4">
                <table class="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                  <thead class=" border-b dark:border-gray-700 text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                    <tr>
                      <th scope="col" class="p-4">
                        <div class="flex items-center">
                          <input id="checkbox-all-search" style={{
                            marginLeft: "-8px"

                          }} type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                        </div>
                      </th>
                      <th scope="col" class="px-6 py-3">
                        Matter Name
                      </th>
                      <th scope="col" class="px-6 py-3">
                        Current milestone
                      </th>

                    </tr>
                  </thead>

                  {mattersData.map((item, index) => (

                    <tbody>
                      <tr class="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                        <td class=" p-2">
                          <div class="flex items-center">
                            <input id="checkbox-table-search-1" type="checkbox" class="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 dark:focus:ring-blue-600 dark:ring-offset-gray-800 dark:focus:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600" />
                            <label for="checkbox-table-search-1" class="sr-only">checkbox</label>
                          </div>
                        </td>
                    
                        <td className="px-2 py-2 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                          {item.attributes.name.length > 16 ? `${item.attributes.name.slice(0, 16)}...` : item.attributes.name}
                        </td>

                        <td className="px-2 py-2">
                          {item.attributes.milestoneStatus && item.attributes.milestoneStatus.currentMilestone
                            ? item.attributes.milestoneStatus.currentMilestone.name
                            : "No milestone"
                          }
                        </td>

                      </tr>
                    </tbody>
                  ))}

                </table>
              </div> */}


            </> : <></>}

        </div>
      </div>
    </div>

  );
};



export default Main;


// let avr = { "jsonapi": { "version": "1.0" }, "data": [{ "type": "user", "id": "l02kNaLb9v4Ql01nYAAxL", "attributes":
// { "createdDate": 1706174655271, "createdFrom": "223.123.8.216", "lastName": "umar", "status": "ACTIVE",
// "lastLoginDate": 1706773628721, "email": "adeelumarit@gmail.com", "createdBy": "l02kNaLb9v4Ql01nYAAxL",
//  "firstName": "adeel", "emailRaw": "adeelumarit@gmail.com", "emailVerified": "223.123.8.216", "emailVerifiedDate": 1706174675720, "lastLoginFrom": "223.123.15.29 (, , CN)", "lastModifiedFrom": "223.123.15.29", "lastModifiedBy": "l02kNaLb9v4Ql01nYAAxL", "lastModifiedDate": 1706773628721, "workspace": { "role": "OWNER", "matterRole": "PRINCIPAL", "status": "ACTIVE", "createdDate": 1706174655271 } } }, { "type": "user", "id": "dd89PBlPjjfcxG_M-Iz74", "attributes": { "createdDate": 1706174709626, "lastName": "Gutkowski", "createdFrom": "223.123.8.216, 15.158.24.43", "meta": { "sourceId": "dd89PBlPjjfcxG_M-Iz74", "source": "random" }, "status": "ACTIVE", "email": "cesar27@example.com", "createdBy": "l02kNaLb9v4Ql01nYAAxL", "firstName": "Cesar", "emailRaw": "Cesar27@example.com", "workspace": { "role": "MEMBER", "matterRole": "BUSINESS_1", "status": "ACTIVE", "createdDate": 1706174709718 } } }, { "type": "user", "id": "1oCUQZVhW5r4o8l0JV60i", "attributes": { "createdDate": 1706174709875, "lastName": "Beier", "createdFrom": "223.123.8.216, 15.158.24.43", "meta": { "sourceId": "1oCUQZVhW5r4o8l0JV60i", "source": "random" }, "status": "ACTIVE", "email": "colin.beier@example.com", "createdBy": "l02kNaLb9v4Ql01nYAAxL", "firstName": "Colin", "emailRaw": "Colin.Beier@example.com", "workspace": { "role": "MEMBER", "matterRole": "LEGAL_2", "status": "ACTIVE", "createdDate": 1706174709905 } } }, { "type": "user", "id": "gzjPDiZiJx7MSYiXFepYq", "attributes": { "createdDate": 1706174709694, "lastName": "Wehner", "createdFrom": "223.123.8.216, 15.158.24.43", "meta": { "sourceId": "gzjPDiZiJx7MSYiXFepYq", "source": "random" }, "status": "ACTIVE", "email": "erik_wehner@example.com", "createdBy": "l02kNaLb9v4Ql01nYAAxL", "firstName": "Erik", "emailRaw": "Erik_Wehner@example.com", "workspace": { "role": "MEMBER", "matterRole": "CONSULTANT_1", "status": "ACTIVE", "createdDate": 1706174709783 } } }, { "type": "user", "id": "MDwPGDKrYfWOsBxKjngY0", "attributes": { "createdDate": 1706174709612, "lastName": "Towne", "createdFrom": "223.123.8.216, 15.158.24.43", "meta": { "sourceId": "MDwPGDKrYfWOsBxKjngY0", "source": "random" }, "status": "ACTIVE", "email": "ida14@example.com", "createdBy": "l02kNaLb9v4Ql01nYAAxL", "firstName": "Ida", "emailRaw": "Ida14@example.com", "workspace": { "role": "MEMBER", "matterRole": "LEGAL_1", "status": "ACTIVE", "createdDate": 1706174709707 } } }, { "type": "user", "id": "pAWqXpYX1VfAeRzJBC-O9", "attributes": { "createdDate": 1706174709690, "lastName": "Lueilwitz", "createdFrom": "223.123.8.216, 15.158.24.43", "meta": { "sourceId": "pAWqXpYX1VfAeRzJBC-O9", "source": "random" }, "status": "ACTIVE", "email": "isaac_lueilwitz@example.com", "createdBy": "l02kNaLb9v4Ql01nYAAxL", "firstName": "Isaac", "emailRaw": "Isaac_Lueilwitz@example.com", "workspace": { "role": "MEMBER", "matterRole": "PRINCIPAL", "status": "ACTIVE", "createdDate": 1706174709787 } } }, { "type": "user", "id": "dBBHOvJwtBJB81fTgZ-09", "attributes": { "createdDate": 1706174709898, "lastName": "Koss", "createdFrom": "223.123.8.216, 15.158.24.43", "meta": { "sourceId": "dBBHOvJwtBJB81fTgZ-09", "source": "random" }, "status": "ACTIVE", "email": "kenny39@example.com", "createdBy": "l02kNaLb9v4Ql01nYAAxL", "firstName": "Kenny", "emailRaw": "Kenny39@example.com", "workspace":
// { "role": "MEMBER", "matterRole": "ADVOCATE_1", "status": "ACTIVE", "createdDate": 1706174709925 }
//  } }
// ] }