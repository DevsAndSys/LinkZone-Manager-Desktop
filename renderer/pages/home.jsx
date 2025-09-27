import Head from "next/head";
import React from "react";
import CardsSection from "../sections/CardsSection";

function Home({ loading }) {
  return (
    <React.Fragment>
      <Head>
        <title>Home - Link Zone Manager</title>
      </Head>
      {!loading && <CardsSection />}
    </React.Fragment>
  );
}

export default Home;
