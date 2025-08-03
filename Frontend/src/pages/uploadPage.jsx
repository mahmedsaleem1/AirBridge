import {
    Header,
    UploadAndDownload,
    Footer,
} from '../components/index';

const UploadPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <UploadAndDownload />
      </main>
      <Footer />
    </div>
  );
};

export default UploadPage;