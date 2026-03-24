import { XliffProvider } from './context/XliffContext';
import { Layout } from './components/Layout';
import { FileUploader } from './components/FileUploader';
import { FileInfo } from './components/FileInfo';
import { ExportButton } from './components/ExportButton';
import { TransUnitList } from './components/TransUnitList';

function App() {
  return (
    <XliffProvider>
      <Layout>
        <FileUploader />
        <FileInfo />
        <div className="space-y-4">
          <ExportButton />
          <TransUnitList />
        </div>
      </Layout>
    </XliffProvider>
  );
}

export default App;
