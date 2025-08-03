import {
    Header,
    Login,
    Footer,
} from '../components/index';

const LoginPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Login />
      </main>
      <Footer />
    </div>
  );
};

export default LoginPage;