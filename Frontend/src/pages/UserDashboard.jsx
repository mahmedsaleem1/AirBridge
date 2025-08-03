import {
    Header,
    Dashboard,
    Footer,
} from '../components/index';

const UserDashboard = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Dashboard />
      </main>
      <Footer />
    </div>
  );
};

export default UserDashboard;