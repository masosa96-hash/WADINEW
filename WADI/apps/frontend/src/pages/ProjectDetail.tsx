import { useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useRunsStore } from "../store/runsStore";
import { ChatInterface } from "../components/ChatInterface";
import type { ChatMessage } from "../components/ChatInterface";
import { Layout } from "../components/Layout";

export default function ProjectDetail() {
  const { id } = useParams();
  const { runs, fetchRuns, createRun, loading } = useRunsStore();

  useEffect(() => {
    if (id) {
      fetchRuns(id);
    }
  }, [id, fetchRuns]);

  const handleSend = async (text: string) => {
    if (!id || !text.trim()) return;
    await createRun(id, text);
  };

  // Transform runs (Run[]) into ChatMessage[]
  // Runs are stored [newest, ..., oldest] in store
  // We want to display [oldest, ..., newest] in ChatInterface typically
  const messages = useMemo(() => {
    const msgs: ChatMessage[] = [];

    // Process in reverse (oldest first) to build chat history
    // Since 'runs' is [newest...oldest], we slice().reverse()
    const sortedRuns = runs.slice().reverse();

    sortedRuns.forEach((run) => {
      // User Message
      msgs.push({
        id: `${run.id}-user`,
        role: "user",
        content: run.input,
        timestamp: new Date(run.created_at).toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      });

      // Assistant Message (if output exists)
      if (run.output) {
        msgs.push({
          id: `${run.id}-ai`,
          role: "assistant",
          content: run.output,
          timestamp: new Date(run.created_at).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
          // Technically output might be later, but for now using run time is fine
        });
      }
    });

    return msgs;
  }, [runs]);

  return (
    <Layout>
      <ChatInterface
        title={`Project ${id}`}
        status={loading ? "Processing..." : "Ready"}
        messages={messages}
        onSendMessage={handleSend}
        isThinking={loading}
        suggestions={[
          "Analyze this code",
          "Explain the architecture",
          "Suggest improvements",
          "Write a test case",
        ]}
      />
    </Layout>
  );
}
