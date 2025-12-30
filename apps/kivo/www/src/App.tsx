import { Sidebar } from "./components/Sidebar";
import { TerminalInput } from "./components/TerminalInput";
// Placeholder App
function App() {
  return (
    <div className="flex h-screen w-full bg-[var(--wadi-bg)] text-[var(--wadi-text)]">
      <Sidebar />
      <main className="flex-1 flex flex-col items-center justify-center">
        <h1 className="text-3xl font-bold mb-8">WADI KIVO</h1>
        <TerminalInput
          onSendMessage={async (text) => console.log(text)}
          isLoading={false}
        />
      </main>
    </div>
  );
}

export default App;
