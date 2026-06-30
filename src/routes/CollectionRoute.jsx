import { useEffect, useState } from "react";
import { supabaseClient } from "../lib/supabase";

import Loader from "../components/Loader";

import MyCollectionPage from "../pages/my-collection/MyCollectionPage";
import AcervoLandingPage from "../pages/my-collection/acervo-landing/AcervoLandingPage";

export default function CollectionRoute() {
  const [loading, setLoading] = useState(true);
  const [logged, setLogged] = useState(false);

  useEffect(() => {
    async function checkUser() {
      const {
        data: { user },
      } = await supabaseClient.auth.getUser();

      setLogged(!!user);
      setLoading(false);
    }

    checkUser();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return logged ? <MyCollectionPage /> : <AcervoLandingPage />;
}