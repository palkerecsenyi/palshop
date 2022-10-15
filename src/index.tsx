import React from 'react';
import ReactDOM from 'react-dom/client';
import Router from './Router';
import { initializeApp } from "firebase/app"
import { initializeAppCheck, ReCaptchaV3Provider } from "firebase/app-check"
import "./styles/main.scss"

const app = initializeApp({
    apiKey: "AIzaSyA7Zj5BDWoDVP78sF19qFG7fpUGNAgAA44",
    authDomain: "palshop-web.firebaseapp.com",
    projectId: "palshop-web",
    storageBucket: "palshop-web.appspot.com",
    messagingSenderId: "618658054226",
    appId: "1:618658054226:web:6fe1bcad5fc7e821311f8b"
})

initializeAppCheck(app, {
    provider: new ReCaptchaV3Provider("6LdiZFoiAAAAAICmAi9Vs1TM_572KGMSeLQNqSBe"),
})

const root = ReactDOM.createRoot(
    document.getElementById('root') as HTMLElement
)
root.render(
    <React.StrictMode>
        <Router />
    </React.StrictMode>
)
