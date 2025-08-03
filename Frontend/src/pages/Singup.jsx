import {
    Header,
    Signup,
    Footer,
} from '../components/index';

const SignupPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Signup />
      </main>
      <Footer />
    </div>
  );
};

export default SignupPage;