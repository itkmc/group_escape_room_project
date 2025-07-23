// // // src/index.js
// // import React from 'react';
// // import ReactDOM from 'react-dom/client';
// // import './index.css';
// // import App from './App'; // <--- 여기가 <App /> 이어야 합니다.
// // import reportWebVitals from './reportWebVitals';

// // const root = ReactDOM.createRoot(document.getElementById('root'));
// // root.render(
// //   <React.StrictMode>
// //     <App /> {/* <--- 여기가 <App /> 이어야 합니다. */}
// //   </React.StrictMode>
// // );
// // // ...
// import React from 'react';
// import ReactDOM from 'react-dom/client';
// import BabylonScene from './BabylonScene';

// const root = ReactDOM.createRoot(document.getElementById('root'));
// root.render(<BabylonScene />);
// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // <--- 여기가 <App /> 이어야 합니다.
import reportWebVitals from './reportWebVitals';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <App />
);
// …