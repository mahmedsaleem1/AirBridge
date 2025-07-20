import {
    Header,
    About,
    Footer,
} from '../components/index';

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <About />
      </main>
      <Footer />
    </div>
  );
};

export default Home;