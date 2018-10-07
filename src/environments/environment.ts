// This file can be replaced during build by using the `fileReplacements` array.
// `ng build ---prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  firebase: {
    apiKey: "AIzaSyCd4Eh-jZB8QePzStKB3SfgI5uDg_SQEec",
    authDomain: "fajas-1e953.firebaseapp.com",
    databaseURL: "https://fajas-1e953.firebaseio.com",
    projectId: "fajas-1e953",
    storageBucket: "fajas-1e953.appspot.com",
    messagingSenderId: "563210501242"
  },
  algolia:{
    appId: 'RHQNHCKPTA',
    apikey: 'ec1aad39778851bc1d8bc0f034913290'
  }

};

/*
 * In development mode, to ignore zone related error stack frames such as
 * `zone.run`, `zoneDelegate.invokeTask` for easier debugging, you can
 * import the following file, but please comment it out in production mode
 * because it will have performance impact when throw error
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
