// "use client";

// import { useEffect } from 'react';
// import '../i18n';

// export default function I18nProvider({ children }) {
//   useEffect(() => {
//     // i18n is initialized in the import above
//   }, []);

//   return <>{children}</>;
// }


"use client";

import { I18nextProvider } from "react-i18next";
import i18n from "../i18n"; // make sure this path is correct

export default function I18nProvider({ children }) {
  return (
    <I18nextProvider i18n={i18n}>
      {children}
    </I18nextProvider>
  );
}