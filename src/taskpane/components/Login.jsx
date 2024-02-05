

// Example usage of Fluent UI components
import React, { useState, useEffect } from 'react';
// import { DefaultButton, PrimaryButton, TextField, Stack, Text, Image, IconButton, FontWeights } from '@fluentui/react';
import { Button } from "@material-tailwind/react";
import Main from './Main';
import axios from 'axios';
// import { cache } from 'webpack';

// import Main from './MainPage';

const Login = () => {
  const [mainpage, setmainpage] = useState(false);
  // const [RecapchaKey, setRecapchaKey] = useState("");
  const [emailValue, setemailValue] = useState("");
  const [Password, setPassword] = useState("");
  const [signinbttunChanges, setsigninbttunChanges] = useState("Sign in");
  const [message, setmessage] = useState("");
  const [loaderSpinner, setloaderSpinner] = useState("");
  const [CaptchaSiteKey, setCaptchaSiteKey] = useState("");
  const [Loginpage, setLoginpage] = useState(true);
  const [Mainpage, setMainpage] = useState(false);

  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [isSideNavOpen, setisSideNavOpen] = useState(false);

  const toggleUserDropdown = () => {
    setIsUserDropdownOpen(!isUserDropdownOpen);
  };
  // const togleSideNav = () => {
  //   setisSideNavOpen(!isSideNavOpen);
  // };


  useEffect(() => {
    // Fetch the captchaSiteKey
    let BearerToken = window.localStorage.getItem("Token");
    BearerToken = JSON.parse(BearerToken);
    if (BearerToken) {
      setMainpage(true)
      setLoginpage(false)
    }
  }, []);



  useEffect(() => {
    // Fetch the captchaSiteKey
    fetch('https://app-staging.hivelight.com/v1/configurations/security/captcha')
      .then((response) => response.json())
      .then((data) => {
        setCaptchaSiteKey(data.captchaSiteKey);
        loadReCaptchaScript(data.captchaSiteKey);
      });
  }, []);

  const loadReCaptchaScript = (siteKey) => {
    const script = document.createElement('script');
    script.src = `https://www.google.com/recaptcha/api.js?render=${siteKey}`;
    document.body.appendChild(script);
  };


  const handleEmailChange = (event) => {
    setemailValue(event.target.value);
  };

  const handlePasswordChange = (event) => {
    setPassword(event.target.value);
  };

  const buttonStyles = {
    root: {
      backgroundColor: 'black',
      color: 'white',
      selectors: {
        ':hover': {
          backgroundColor: '#333', // Darken the background color on hover if desired
        },
      },
    },
  };




  const authenticateUser = async (captchaToken) => {


    if (emailValue == "" || Password == "") {

      setmessage("Enter The Email and Password to Continue ")
      setTimeout(() => {
        setmessage("");
      }, 3000);
    } else {
      setloaderSpinner(true)
      setsigninbttunChanges("Signing in...")





      let requestData = {
        "data": {
          "type": "user",
          "attributes": {
            "email": emailValue,
            "password": Password,
            "token": captchaToken
          }
        }
      }




      try {

        const response = await axios.post('https://app-staging.hivelight.com/v1/identities/authenticate', requestData);

        // Handle the response as needed
        console.log('Response:', response.data);
        console.log(response.data.meta.token)
        let token = response.data.meta.token
        window.localStorage.setItem("Token", JSON.stringify(token))
        setsigninbttunChanges("Sign in")
        setloaderSpinner(false)
        window.location.reload();
      } catch (error) {
        console.error('Error:', error.response.data.status);
        setsigninbttunChanges("Sign in")
        if (error.message) {
          setmessage(error.response.data.status)
          setloaderSpinner(false)
          setTimeout(() => {
            setmessage("")
          }, 5000);
        } else {
          setloaderSpinner(false)


        }
      }


    }

    // setmainpage(true)

  }


  const signinfun = async (event) => {
    event.preventDefault();
    if (window.grecaptcha && CaptchaSiteKey) {
      const captchaToken = await window.grecaptcha.execute(CaptchaSiteKey, { action: 'submit' });
      console.log('reCAPTCHA token:', captchaToken);
      authenticateUser(captchaToken);
    }
  };

  return (
    <>
      {loaderSpinner ? <>
        <div role="status" class="absolute -translate-x-1/2 -translate-y-1/2 top-2/4 left-1/2">
          <svg aria-hidden="true" class="w-8 h-8 text-gray-200 animate-spin dark:text-gray-600 fill-blue-950" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor" /><path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill" /></svg>
          <span class="sr-only">Loading...</span>
        </div></> : ""}

      {Loginpage ? <div className='' style={{ opacity: loaderSpinner ? 0.2 : 1 }}>
        <div className="flex min-h-full  flex-col justify-center px-4 py-8 lg:px-4 bg-white ">
          <div className="sm:mx-auto sm:w-full sm:max-w-sm">
            <img className="mx-auto h-10 w-auto" src="../assets/hivelightLogo.png" alt="Your Company" />
            <h2 className="mt-2 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
              Sign in to your account
            </h2>
          </div>
          <p className="mt-4 text-center text-sm text-gray-500">
            Or
            <a href="#" className="font-semibold leading-6 px-1 text-indigo-600 hover:text-indigo-500">
              sign-up for an account now
            </a>
          </p>
          <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-sm">
            <form className="space-y-2" action="#" method="POST">
              <label className="bg-white font-semibold">Email</label>

              <div className="relative flex items-center">
                <input type="email" placeholder="Enter email" onChange={handleEmailChange}
                  className="px-2 py-2 bg-white w-full text-sm border-2 border-gray-200 focus:border-blue-600 rounded outline-none" />

              </div>

              <div className='mt-2'>
                <label className="bg-white font-semibold">Password</label>

                <div className="relative flex items-center">
                  <input type="Password" placeholder="Enter password" onChange={handlePasswordChange}
                    className="px-2 py-2 bg-white w-full text-sm border-2 border-gray-200 focus:border-blue-600 rounded outline-none" />

                </div>
              </div>




              <div className="text-sm">
                <a href="#" className="font-semibold text-indigo-600 hover:text-indigo-500 ">
                  Forgot your password?
                </a>
              </div>
              <div>
             

                <div className="mt-4">
                  {/* <img src="../assets/Lock.png" alt="metamask" className="h-7 w-7 ml-1 absolute mt-1 text-white" /> */}
                  <i class="fa fa-lock h-7 w-7 absolute mt-1 ml-2 text-xl hover:text-white" style={{ color: "royalblue" }} aria-hidden="true"></i>
                  <button
                    type="button"
                    onClick={signinfun}
                    className="flex items-center w-full justify-center rounded-md bg-indigo-600 px-3 py-1.5 text-sm font-semibold leading-6 text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 hover:icon-hover"
                  >
                    {signinbttunChanges}
                  </button>

                </div>
                <div className="relative flex items-center">
                  <span className='text-red-600'>{message}</span>

                </div>

              </div>
            </form>
            <p className="mt-3 text-start text-sm text-gray-500" style={{
              fontSize: "13px"
            }}>
              This site is protected by reCAPTCHA and the Google
              <a href="#" className="font-semibold leading-6 text-indigo-600 hover:text-indigo-500">
                Privacy Policy <a className='text-gray-500'>and</a> Terms of Service <a className='text-gray-500'>apply.</a>
              </a>
            </p>
          </div>
        </div>
      </div> : <>

      </>
      }

      {Mainpage ?
        <Main></Main>

        : <>

        </>
      }
    </>
  );
};

export default Login;
