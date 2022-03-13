import { ToastContainer } from 'react-toastify';

import "@styles/globals.css"
import 'react-toastify/dist/ReactToastify.css';

function MyApp({ Component, pageProps }) {

  const Layout = Component.Layout

  return (
    <Layout>
      <ToastContainer />
      < Component {...pageProps} />
    </Layout>
  )
}

export default MyApp
