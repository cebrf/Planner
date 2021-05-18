# Planner
Trello like app using Vue and Firebase

## How to Load the App

The project uses Node.js and the vue cli 3. If you do not have Node >= 6.x installed, you can download it here: [Node.js](https://nodejs.org/en/)

Once Node is installed, navigate to the directory where you want to store the app

```
git clone https://github.com/Akash187/VueTrello.git
yarn install
```

Create a Firebase App and put the keys and secret in a .env file in the root of project. See the example below.
```
VUE_APP_FIREBASE_API_KEY="AIzaSyCxq04s-Y5WkrAwttP71Y3mVpqNEECqdzQ"
VUE_APP_FIREBASE_AUTH_DOMAIN="planer-org.firebaseapp.com"
VUE_APP_FIREBASE_DATABASE_URL="https://planer-org-default-rtdb.firebaseio.com"
VUE_APP_FIREBASE_PROJECT_ID="planer-org"
VUE_APP_FIREBASE_MESSAGING_SENDER_ID="planer-org.appspot.com"
VUE_APP_FIREBASE_APP_ID="42689209916"
```

After setting up .env file you can run project by below command

```
yarn serve
```

A new browser window should automatically open displaying the app. If it doesn't, navigate to [http://localhost:8080/](http://localhost:8080/) in your browser
