// import axios from 'axios';
// import { log } from 'console';
// import {useEffect} from 'react';



// const useAxios = () => {

  
//     useEffect (
//       () => {
//         axios.defaults.headers.common['x-auth-token'] = token;
//         axios.interceptors.request.use (data => {
//           return Promise.resolve (data);
//         }, null);
  
//         axios.interceptors.response.use (
//           data => {
//             return Promise.resolve (data);
//           },
//           error => {
//             log ('error', error.message);
//             return Promise.reject (error);
//           }
//         );
//       },
//       []
//     );
//   };
  
//   export default useAxios;